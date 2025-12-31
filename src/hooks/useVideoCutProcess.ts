import { save } from "@tauri-apps/plugin-dialog";
import { Command as ShellCommand } from "@tauri-apps/plugin-shell";
import { useVideoPlaybackAndConversionStore } from "../lib/useVideoPlaybackAndConversionStore";
import { useVideoCutStore } from "../lib/useVideoCutStore";

/**
 * Helper to format seconds into HH:MM:SS.mmm for FFmpeg
 */
export const formatTimeForFFmpeg = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`;
};

export function useVideoCutProcess() {
    const { videoPath } = useVideoPlaybackAndConversionStore();
    const { startTime, endTime, setIsProcessing, setStatusMessage, isProcessing } = useVideoCutStore();

    const initiateCutProcess = async () => {
        if (!videoPath) return;

        // Validation
        if (startTime < 0 || endTime <= startTime) {
            setStatusMessage("Invalid start/end time");
            return;
        }

        try {
            // Get file name without extension and directory
            const fileNameWithExt = videoPath.split(/[\\/]/).pop() || 'video.mp4';
            const originalExt = fileNameWithExt.split('.').pop() || 'mp4';
            const fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.'));

            // Format times for filename (replace colons with dashes or similar safe chars)
            // Using hyphen for safety
            const startStr = formatTimeForFFmpeg(startTime).replace(/:/g, '-').replace(/\./g, '_');
            const endStr = formatTimeForFFmpeg(endTime).replace(/:/g, '-').replace(/\./g, '_');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            const defaultName = `${fileName}_${startStr}_${endStr}_${timestamp}.${originalExt}`;

            const savePath = await save({
                title: "Save Cut Video As",
                defaultPath: defaultName,
                filters: [{
                    name: "Video",
                    extensions: [originalExt]
                }]
            });

            if (!savePath) return;

            setIsProcessing(true);
            setStatusMessage("Cutting video...");

            // FFmpeg command: ffmpeg -ss [start] -to [end] -i [input] -c copy [output]
            // Note: putting -ss before -i is faster (input seeking) but less accurate. 
            // Putting -ss after -i is slower (output seeking) but frame-accurate.
            // For cutting, we usually want accuracy, but -c copy implies keyframe cutting only.
            // If user wants frame-exact cut without re-encoding, it's impossible.
            // We will stick to -c copy for speed as per user request "simple way", but be aware of keyframe issues.
            // Actually, for "extremely simple", re-encoding might be too slow. Keyframe cut (-c copy) is simplest and fastest.

            const ffmpegCommand = ShellCommand.sidecar("ffmpeg", [
                "-ss",
                formatTimeForFFmpeg(startTime),
                "-to",
                formatTimeForFFmpeg(endTime),
                "-i",
                videoPath,
                "-c",
                "copy",
                "-y", // overwrite if exists (dialog already asked confirmation, but just in case)
                savePath
            ]);

            ffmpegCommand.on("close", (data) => {
                setIsProcessing(false);
                if (data.code === 0) {
                    setStatusMessage(`Saved to ${savePath.split(/[\\/]/).pop()}`);
                } else {
                    setStatusMessage(`Failed (Code ${data.code})`);
                }
            });

            ffmpegCommand.on("error", (error) => {
                console.error("FFmpeg error:", error);
                setIsProcessing(false);
                setStatusMessage("Error starting FFmpeg");
            });

            // Optional: capture stderr for progress if needed, but for -c copy it's instant usually.

            await ffmpegCommand.spawn();

        } catch (error) {
            console.error("Error in cut process:", error);
            setIsProcessing(false);
            setStatusMessage("Error initiating cut");
        }
    };

    return {
        initiateCutProcess,
        isProcessing
    };
}
