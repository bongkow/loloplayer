import { invoke } from "@tauri-apps/api/core";
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
        clearRallies,
    } = useRallyStore();

    const detectRallies = async () => {
        if (!videoPath || isDetecting) return;

        setIsDetecting(true);
        setDetectionError(null);
        clearRallies();

        try {
            const result = await invoke<DetectRalliesResponse>("detect_rallies", {
                videoPath,
                sensitivity,
                maxGap,
            });

            setRallies(result.rallies, result.total_hits);
        } catch (error) {
            setDetectionError(
                error instanceof Error ? error.message : String(error)
            );
        } finally {
            setIsDetecting(false);
        }
    };

    return { detectRallies };
}
