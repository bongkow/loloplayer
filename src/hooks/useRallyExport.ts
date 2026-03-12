import { open, save } from "@tauri-apps/plugin-dialog";
import { useVideoPlaybackAndConversionStore } from "../lib/useVideoPlaybackAndConversionStore";
import { useRallyStore, type Rally } from "../lib/useRallyStore";
import { formatTimeForFilename, parseVideoFileInfo, cutVideoSegment, concatVideoSegments } from "../lib/ffmpegUtils";

export function useRallyExport() {
    const { videoPath } = useVideoPlaybackAndConversionStore();
    const {
        rallies,
        bufferTime,
        isExporting,
        selectedRallyIndices,
        setIsExporting,
        setExportProgress,
        setReelPreviewActive,
    } = useRallyStore();

    const exportRallies = async (indicesToExport: number[]) => {
        if (!videoPath || isExporting || indicesToExport.length === 0) return;

        const outputDir = await open({
            directory: true,
            title: "Select Output Folder for Rally Exports",
        });

        if (!outputDir) return;

        setIsExporting(true);

        const { originalExt, fileName } = parseVideoFileInfo(videoPath);

        try {
            for (let i = 0; i < indicesToExport.length; i++) {
                const rallyIndex = indicesToExport[i];
                const rally: Rally = rallies[rallyIndex];

                const bufferedStart = Math.max(0, rally.start_time - bufferTime);
                const bufferedEnd = rally.end_time + bufferTime;

                const startStr = formatTimeForFilename(bufferedStart);
                const endStr = formatTimeForFilename(bufferedEnd);
                const outputPath = `${outputDir}\\${fileName}_${startStr}_${endStr}.${originalExt}`;

                setExportProgress(`Exporting ${i + 1}/${indicesToExport.length} (R${rallyIndex + 1})...`);
                await cutVideoSegment(videoPath, outputPath, bufferedStart, bufferedEnd);
            }

            setExportProgress(`Exported ${indicesToExport.length} rallies`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setExportProgress(`Export failed: ${message}`);
        } finally {
            setIsExporting(false);
        }
    };

    const exportSelectedRallies = () => {
        const indices = Array.from(selectedRallyIndices).sort((a, b) => a - b);
        return exportRallies(indices);
    };

    const exportAllRallies = () => {
        const indices = rallies.map((_, i) => i);
        return exportRallies(indices);
    };

    const exportRallyReel = async () => {
        if (!videoPath || isExporting || rallies.length === 0) return;

        const { originalExt, fileName } = parseVideoFileInfo(videoPath);

        const savePath = await save({
            title: "Save Rally Reel As",
            defaultPath: `${fileName}_rally_reel.${originalExt}`,
            filters: [{ name: "Video", extensions: [originalExt] }],
        });

        if (!savePath) return;

        setIsExporting(true);

        const segments = rallies.map((rally) => ({
            startTime: Math.max(0, rally.start_time - bufferTime),
            endTime: rally.end_time + bufferTime,
        }));

        try {
            await concatVideoSegments(videoPath, savePath, segments, (msg) => {
                setExportProgress(msg);
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setExportProgress(`Reel export failed: ${message}`);
        } finally {
            setIsExporting(false);
            setReelPreviewActive(false);
        }
    };

    return { exportSelectedRallies, exportAllRallies, exportRallyReel, isExporting };
}

