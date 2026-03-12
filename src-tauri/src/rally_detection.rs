use serde::Serialize;
use std::process::Command;
use tauri::{Emitter, Manager};

/// A detected rally segment with start/end times and hit count.
#[derive(Debug, Clone, Serialize)]
pub struct Rally {
    pub start_time: f64,
    pub end_time: f64,
    pub hit_count: usize,
}

/// Result of the rally detection process.
#[derive(Debug, Clone, Serialize)]
pub struct RallyDetectionResult {
    pub rallies: Vec<Rally>,
    pub total_hits: usize,
}

/// Detection parameters tuned for tennis.
struct DetectionParams {
    /// Audio sample rate for analysis (lower = faster).
    sample_rate: u32,
    /// Window size in samples for short-time energy.
    window_size: usize,
    /// Hop size between windows.
    hop_size: usize,
    /// Moving average window (in number of frames) for adaptive threshold.
    avg_window: usize,
    /// Factor above moving average to trigger a transient.
    threshold_factor: f32,
    /// Minimum absolute energy to consider (noise floor).
    min_energy: f32,
    /// Minimum gap between transients in seconds (debounce).
    min_transient_gap: f64,
    /// Maximum gap between hits to be considered the same rally (seconds).
    max_rally_gap: f64,
    /// Minimum number of hits for a valid rally.
    min_rally_hits: usize,
}

impl Default for DetectionParams {
    fn default() -> Self {
        Self {
            sample_rate: 8000,
            window_size: 400, // 50ms at 8kHz
            hop_size: 160,    // 20ms hop
            avg_window: 25,   // ~500ms moving average
            threshold_factor: 3.0,
            min_energy: 0.001,
            min_transient_gap: 0.15,
            max_rally_gap: 4.5,
            min_rally_hits: 2,
        }
    }
}

/// Extract audio from video as raw f32le PCM using FFmpeg sidecar.
fn extract_audio(
    app_handle: &tauri::AppHandle,
    video_path: &str,
    sample_rate: u32,
) -> Result<Vec<f32>, String> {
    // Resolve the FFmpeg sidecar path
    let ffmpeg_path = app_handle
        .path()
        .resolve("ffmpeg", tauri::path::BaseDirectory::Resource)
        .ok();

    // Try sidecar path first, fall back to system ffmpeg
    let ffmpeg_bin = if let Some(ref p) = ffmpeg_path {
        // Tauri sidecars get a platform suffix, try common variants
        let candidates = vec![p.clone(), p.with_extension("exe"), p.with_extension("")];
        candidates
            .into_iter()
            .find(|c| c.exists())
            .map(|c| c.to_string_lossy().to_string())
            .unwrap_or_else(|| "ffmpeg".to_string())
    } else {
        "ffmpeg".to_string()
    };

    let output = Command::new(&ffmpeg_bin)
        .args([
            "-i",
            video_path,
            "-vn", // no video
            "-ac",
            "1", // mono
            "-ar",
            &sample_rate.to_string(),
            "-f",
            "f32le", // raw 32-bit float little-endian
            "-acodec",
            "pcm_f32le",
            "-", // output to stdout
        ])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to run FFmpeg: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("FFmpeg failed: {}", stderr));
    }

    // Convert raw bytes to f32 samples
    let bytes = &output.stdout;
    if bytes.len() < 4 {
        return Err("No audio data extracted".to_string());
    }

    let sample_count = bytes.len() / 4;
    let mut samples = Vec::with_capacity(sample_count);
    for i in 0..sample_count {
        let offset = i * 4;
        let value = f32::from_le_bytes([
            bytes[offset],
            bytes[offset + 1],
            bytes[offset + 2],
            bytes[offset + 3],
        ]);
        samples.push(value);
    }

    Ok(samples)
}

/// Compute RMS energy for a window of samples.
fn rms_energy(samples: &[f32]) -> f32 {
    if samples.is_empty() {
        return 0.0;
    }
    let sum_sq: f32 = samples.iter().map(|s| s * s).sum();
    (sum_sq / samples.len() as f32).sqrt()
}

/// Detect transient timestamps from audio samples.
fn detect_transients(samples: &[f32], params: &DetectionParams) -> Vec<f64> {
    let num_frames = if samples.len() > params.window_size {
        (samples.len() - params.window_size) / params.hop_size + 1
    } else {
        return vec![];
    };

    // Compute energy for each frame
    let energies: Vec<f32> = (0..num_frames)
        .map(|i| {
            let start = i * params.hop_size;
            let end = (start + params.window_size).min(samples.len());
            rms_energy(&samples[start..end])
        })
        .collect();

    // Detect peaks using adaptive threshold (moving average)
    let mut transients: Vec<f64> = Vec::new();
    let half_avg = params.avg_window / 2;

    for i in 0..num_frames {
        let energy = energies[i];
        if energy < params.min_energy {
            continue;
        }

        // Compute local moving average
        let avg_start = i.saturating_sub(half_avg);
        let avg_end = (i + half_avg + 1).min(num_frames);
        let avg_energy: f32 =
            energies[avg_start..avg_end].iter().sum::<f32>() / (avg_end - avg_start) as f32;

        // Check if this frame exceeds the adaptive threshold
        if energy > avg_energy * params.threshold_factor {
            let time = (i * params.hop_size) as f64 / params.sample_rate as f64;

            // Debounce: skip if too close to previous transient
            if let Some(&last) = transients.last() {
                if time - last < params.min_transient_gap {
                    continue;
                }
            }

            transients.push(time);
        }
    }

    transients
}

/// Cluster transient timestamps into rally segments.
fn cluster_rallies(transients: &[f64], params: &DetectionParams) -> Vec<Rally> {
    if transients.is_empty() {
        return vec![];
    }

    let mut rallies: Vec<Rally> = Vec::new();
    let mut rally_start = transients[0];
    let mut rally_end = transients[0];
    let mut hit_count: usize = 1;

    for i in 1..transients.len() {
        let gap = transients[i] - transients[i - 1];

        if gap <= params.max_rally_gap {
            // Continue current rally
            rally_end = transients[i];
            hit_count += 1;
        } else {
            // End current rally, start new one
            if hit_count >= params.min_rally_hits {
                rallies.push(Rally {
                    start_time: rally_start,
                    end_time: rally_end,
                    hit_count,
                });
            }
            rally_start = transients[i];
            rally_end = transients[i];
            hit_count = 1;
        }
    }

    // Don't forget the last rally
    if hit_count >= params.min_rally_hits {
        rallies.push(Rally {
            start_time: rally_start,
            end_time: rally_end,
            hit_count,
        });
    }

    rallies
}

/// Tauri command: detect rallies in a video file using audio analysis.
#[tauri::command]
pub async fn detect_rallies(
    app_handle: tauri::AppHandle,
    video_path: String,
    sensitivity: Option<f32>,
    max_gap: Option<f64>,
) -> Result<RallyDetectionResult, String> {
    // Run on a blocking thread since FFmpeg + analysis can take time
    tokio::task::spawn_blocking(move || {
        let mut params = DetectionParams::default();

        // Allow tuning sensitivity (lower = more sensitive)
        if let Some(s) = sensitivity {
            params.threshold_factor = s.clamp(1.5, 8.0);
        }
        // Allow tuning max gap between hits in a rally
        if let Some(g) = max_gap {
            params.max_rally_gap = g.clamp(1.0, 15.0);
        }

        // Step 1: Extract audio
        let _ = app_handle.emit("rally-detection-progress", "Extracting audio from video...");
        let samples = extract_audio(&app_handle, &video_path, params.sample_rate)?;
        let duration_secs = samples.len() as f64 / params.sample_rate as f64;
        let _ = app_handle.emit(
            "rally-detection-progress",
            format!(
                "Audio extracted ({:.0}s). Analyzing transients...",
                duration_secs
            ),
        );

        // Step 2: Detect transients (ball impacts)
        let transients = detect_transients(&samples, &params);
        let _ = app_handle.emit(
            "rally-detection-progress",
            format!(
                "Found {} transients. Clustering into rallies...",
                transients.len()
            ),
        );

        // Step 3: Cluster into rallies
        let rallies = cluster_rallies(&transients, &params);
        let total_hits = transients.len();
        let _ = app_handle.emit(
            "rally-detection-progress",
            format!(
                "Done! {} rallies detected ({} total hits)",
                rallies.len(),
                total_hits
            ),
        );

        Ok(RallyDetectionResult {
            rallies,
            total_hits,
        })
    })
    .await
    .map_err(|e| format!("Task failed: {}", e))?
}
