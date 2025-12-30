import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { Command as ShellCommand } from "@tauri-apps/plugin-shell";
import { useVideoPlaybackAndConversionStore } from "../lib/useVideoPlaybackAndConversionStore";

/**
 * Custom hook to handle the HLS conversion process using FFmpeg sidecar.
 * Separates the conversion logic from the UI components.
 */
export function useHlsMediaConversionProcess() {
    const {
        videoPath,
        setIsProcessingHls,
        setStatusMessage,
        isProcessingHls,
    } = useVideoPlaybackAndConversionStore();

    const initiateHlsConversionProcess = async () => {
        if (!videoPath) return;

        try {
            const selectedOutputDirectory = await openFileDialog({
                directory: true,
                multiple: false,
                title: "Select Output Directory for HLS",
            });

            if (!selectedOutputDirectory || typeof selectedOutputDirectory !== "string") return;

            setIsProcessingHls(true);
            setStatusMessage("Starting HLS conversion...");

            const pathSeparator = selectedOutputDirectory.includes("\\") ? "\\" : "/";
            const fullOutputPath = `${selectedOutputDirectory}${selectedOutputDirectory.endsWith(pathSeparator) ? "" : pathSeparator
                }playlist.m3u8`;

            const ffmpegConversionCommand = ShellCommand.sidecar("ffmpeg", [
                "-i",
                videoPath,
                "-codec",
                "copy",
                "-start_number",
                "0",
                "-hls_time",
                "10",
                "-hls_list_size",
                "0",
                "-f",
                "hls",
                fullOutputPath,
            ]);

            ffmpegConversionCommand.on("close", (terminationData) => {
                setIsProcessingHls(false);
                if (terminationData.code === 0) {
                    setStatusMessage(`Success! Saved to ${fullOutputPath}`);
                } else {
                    setStatusMessage(`Conversion failed with code ${terminationData.code}`);
                }
            });

            ffmpegConversionCommand.on("error", (shellError) => {
                console.error("FFmpeg sidecar error:", shellError);
                setIsProcessingHls(false);
                setStatusMessage(`Error: ${shellError}`);
            });

            ffmpegConversionCommand.stderr.on("data", (standardErrorLine) => {
                console.log(standardErrorLine);
                setStatusMessage(`Processing... ${standardErrorLine.substring(0, 50)}`);
            });

            await ffmpegConversionCommand.spawn();
        } catch (hlsInitiationError) {
            console.error("Error initiating HLS conversion:", hlsInitiationError);
            setIsProcessingHls(false);
            setStatusMessage(`Error: ${hlsInitiationError}`);
        }
    };

    return {
        initiateHlsConversionProcess,
        isProcessingHls,
    };
}
