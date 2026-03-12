import { save } from "@tauri-apps/plugin-dialog";
import { useVideoPlaybackAndConversionStore } from "../lib/useVideoPlaybackAndConversionStore";
import { useVideoCutStore } from "../lib/useVideoCutStore";
import { formatTimeForFFmpeg, parseVideoFileInfo, cutVideoSegment } from "../lib/ffmpegUtils";

export { formatTimeForFFmpeg };

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
            const { originalExt, fileName } = parseVideoFileInfo(videoPath);

            // Format times for filename
            const startStr = formatTimeForFFmpeg(startTime).replace(/:/g, '-').replace(/\./g, '_');
            const endStr = formatTimeForFFmpeg(endTime).replace(/:/g, '-').replace(/\./g, '_');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            const defaultName = `[cut]${fileName}_${startStr}_${endStr}_${timestamp}.${originalExt}`;

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

            try {
                await cutVideoSegment(videoPath, savePath, startTime, endTime);
                setStatusMessage(`Saved to ${savePath.split(/[\\/]/).pop()}`);
            } catch (error) {
                console.error("FFmpeg error:", error);
                setStatusMessage(error instanceof Error ? error.message : "FFmpeg failed");
            } finally {
                setIsProcessing(false);
            }

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
