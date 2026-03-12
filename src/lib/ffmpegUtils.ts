import { Command as ShellCommand } from "@tauri-apps/plugin-shell";
import { writeTextFile, remove } from "@tauri-apps/plugin-fs";
import { tempDir } from "@tauri-apps/api/path";

/**
 * Format seconds into HH:MM:SS.mmm for FFmpeg time arguments.
 */
export const formatTimeForFFmpeg = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toFixed(3).padStart(6, "0")}`;
};

/**
 * Format seconds into a filesystem-safe string for filenames.
 * Produces MM-SS_d or HH-MM-SS_d format.
 */
export const formatTimeForFilename = (seconds: number): string => {
    const totalSec = Math.max(0, Math.round(seconds * 10) / 10);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const secStr = s.toFixed(1).replace(".", "_");

    if (h > 0) {
        return `${h}-${m.toString().padStart(2, "0")}-${secStr.padStart(4, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}-${secStr.padStart(4, "0")}`;
};

/**
 * Parse video file path into its component parts.
 */
export const parseVideoFileInfo = (videoPath: string) => {
    const fileNameWithExt = videoPath.split(/[\\/]/).pop() || "video.mp4";
    const originalExt = fileNameWithExt.split(".").pop() || "mp4";
    const fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf("."));
    return { fileNameWithExt, originalExt, fileName };
};

/**
 * Cut a video segment using FFmpeg sidecar with -c copy (keyframe cut).
 * Returns a promise that resolves on success or rejects on failure.
 */
export const cutVideoSegment = (
    videoPath: string,
    outputPath: string,
    startTime: number,
    endTime: number
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const ffmpegCommand = ShellCommand.sidecar("ffmpeg", [
            "-ss", formatTimeForFFmpeg(startTime),
            "-to", formatTimeForFFmpeg(endTime),
            "-i", videoPath,
            "-c", "copy",
            "-y",
            outputPath,
        ]);

        ffmpegCommand.on("close", (data) => {
            if (data.code === 0) {
                resolve();
            } else {
                reject(new Error(`FFmpeg failed with code ${data.code}`));
            }
        });

        ffmpegCommand.on("error", (error) => {
            reject(new Error(`FFmpeg error: ${error}`));
        });

        ffmpegCommand.spawn().catch(reject);
    });
};

/**
 * Concatenate multiple video segments into a single output file.
 * Cuts each segment to a temp file, then uses FFmpeg concat demuxer to merge them.
 */
export const concatVideoSegments = async (
    videoPath: string,
    outputPath: string,
    segments: { startTime: number; endTime: number }[],
    onProgress?: (message: string) => void
): Promise<void> => {
    const tmpBase = await tempDir();
    const sessionId = Date.now();
    const tempFiles: string[] = [];

    try {
        // Step 1: Cut each segment to a temp file
        for (let i = 0; i < segments.length; i++) {
            const { startTime, endTime } = segments[i];
            const tempPath = `${tmpBase}loloplayer_reel_${sessionId}_${i}.ts`;
            tempFiles.push(tempPath);
            onProgress?.(`Cutting segment ${i + 1}/${segments.length}...`);

            await new Promise<void>((resolve, reject) => {
                const cmd = ShellCommand.sidecar("ffmpeg", [
                    "-ss", formatTimeForFFmpeg(startTime),
                    "-to", formatTimeForFFmpeg(endTime),
                    "-i", videoPath,
                    "-c", "copy",
                    "-bsf:v", "h264_mp4toannexb",
                    "-f", "mpegts",
                    "-y",
                    tempPath,
                ]);
                cmd.on("close", (data) =>
                    data.code === 0 ? resolve() : reject(new Error(`Segment ${i + 1} failed (code ${data.code})`))
                );
                cmd.on("error", (e) => reject(new Error(`Segment ${i + 1} error: ${e}`)));
                cmd.spawn().catch(reject);
            });
        }

        // Step 2: Write concat list
        const concatListPath = `${tmpBase}loloplayer_reel_${sessionId}_list.txt`;
        const concatContent = tempFiles.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join("\n");
        await writeTextFile(concatListPath, concatContent);
        tempFiles.push(concatListPath);

        // Step 3: Concat all segments
        onProgress?.("Merging segments into final reel...");
        await new Promise<void>((resolve, reject) => {
            const cmd = ShellCommand.sidecar("ffmpeg", [
                "-f", "concat",
                "-safe", "0",
                "-i", concatListPath,
                "-c", "copy",
                "-y",
                outputPath,
            ]);
            cmd.on("close", (data) =>
                data.code === 0 ? resolve() : reject(new Error(`Concat failed (code ${data.code})`))
            );
            cmd.on("error", (e) => reject(new Error(`Concat error: ${e}`)));
            cmd.spawn().catch(reject);
        });

        onProgress?.("Rally Reel exported!");
    } finally {
        // Cleanup temp files
        for (const f of tempFiles) {
            try {
                await remove(f);
            } catch {
                // Ignore cleanup errors
            }
        }
    }
};
