import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { useRallyStore } from "../lib/useRallyStore";
import { useVideoPlaybackAndConversionStore } from "../lib/useVideoPlaybackAndConversionStore";

interface DetectRalliesResponse {
    rallies: { start_time: number; end_time: number; hit_count: number }[];
    total_hits: number;
}

export function useRallyDetection() {
    const { videoPath } = useVideoPlaybackAndConversionStore();
    const {
        isDetecting,
        sensitivity,
        maxGap,
        setRallies,
        setIsDetecting,
        setDetectionError,
        setDetectionStatus,
        clearRallies,
    } = useRallyStore();

    const detectRallies = async () => {
        if (!videoPath || isDetecting) return;

        setIsDetecting(true);
        setDetectionError(null);
        setDetectionStatus("Starting detection...");
        clearRallies();

        let unlisten: UnlistenFn | null = null;

        try {
            unlisten = await listen<string>("rally-detection-progress", (event) => {
                setDetectionStatus(event.payload);
            });

            const result = await invoke<DetectRalliesResponse>("detect_rallies", {
                videoPath,
                sensitivity,
                maxGap,
            });

            setRallies(result.rallies, result.total_hits);
            setDetectionStatus(
                result.rallies.length > 0
                    ? `${result.rallies.length} rallies found (${result.total_hits} hits)`
                    : "No rallies detected"
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setDetectionError(errorMessage);
            setDetectionStatus("Detection failed");
        } finally {
            setIsDetecting(false);
            if (unlisten) unlisten();
        }
    };

    return { detectRallies };
}
