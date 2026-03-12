import { useRallyStore } from "../../../lib/useRallyStore";
import { useRallyDetection } from "../../../hooks/useRallyDetection";
import { useRallyExport } from "../../../hooks/useRallyExport";
import { useVideoPlaybackAndConversionStore } from "../../../lib/useVideoPlaybackAndConversionStore";
import { useMpvVideoPlaybackControl } from "../../../hooks/useMpvVideoPlaybackControl";
import { formatTimeDurationToString } from "../../../lib/utils";
import ControlsAndProgressBarAtBottom from "./ControlsAndProgressBarAtBottom";

export function RallyDetectorFooter() {
    const { videoPath } = useVideoPlaybackAndConversionStore();
    const {
        rallies,
        totalHits,
        isDetecting,
        detectionError,
        detectionStatus,
        sensitivity,
        maxGap,
        bufferTime,
        isExporting,
        exportProgress,
        selectedRallyIndices,
        isReelPreviewActive,
        setSensitivity,
        setMaxGap,
        setBufferTime,
        toggleRallySelection,
        selectAllRallies,
        deselectAllRallies,
        setReelPreviewActive,
    } = useRallyStore();
    const { detectRallies } = useRallyDetection();
    const { exportSelectedRallies, exportAllRallies, exportRallyReel } = useRallyExport();
    const { seekToPosition } = useMpvVideoPlaybackControl();

    const handleJumpToRally = (startTime: number) => {
        seekToPosition(Math.max(0, startTime - bufferTime));
    };

    const hasSelectedRallies = selectedRallyIndices.size > 0;
    const allSelected = rallies.length > 0 && selectedRallyIndices.size === rallies.length;

    return (
        <div className="flex flex-col w-full max-w-5xl mx-auto pb-2">
            {/* Playback Controls */}
            <div className="mb-2">
                <ControlsAndProgressBarAtBottom />
            </div>

            {/* Rally Detection Controls */}
            <div className="flex items-center justify-between bg-zinc-900/80 backdrop-blur-md rounded-lg p-3 border border-zinc-800 gap-4">
                {/* Parameters */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sensitivity</span>
                        <input
                            type="range"
                            min="1.5"
                            max="6"
                            step="0.5"
                            value={sensitivity}
                            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                            className="w-20 h-1 accent-emerald-500"
                            title={`Threshold: ${sensitivity} (lower = more sensitive)`}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Max Gap</span>
                        <input
                            type="range"
                            min="2"
                            max="10"
                            step="0.5"
                            value={maxGap}
                            onChange={(e) => setMaxGap(parseFloat(e.target.value))}
                            className="w-20 h-1 accent-emerald-500"
                            title={`Max gap between hits: ${maxGap}s`}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Buffer</span>
                        <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={bufferTime}
                            onChange={(e) => setBufferTime(parseFloat(e.target.value) || 0)}
                            className="w-14 h-5 text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 rounded px-1 text-center focus:outline-none focus:border-emerald-500"
                            title={`Buffer time: ±${bufferTime}s added before/after each rally`}
                        />
                    </div>
                </div>

                {/* Status / Results */}
                <div className="flex items-center gap-3 px-3 border-l border-zinc-800 min-w-[150px]">
                    {detectionError ? (
                        <span className="text-xs font-mono text-red-400 max-w-[200px] truncate" title={detectionError}>
                            {detectionError}
                        </span>
                    ) : isExporting ? (
                        <span className="text-xs font-mono text-amber-400">
                            {exportProgress || "Exporting..."}
                        </span>
                    ) : (
                        <span className={`text-xs font-mono ${isDetecting ? "text-cyan-400" :
                            rallies.length > 0 ? "text-emerald-400" : "text-zinc-500"
                            }`}>
                            {isDetecting ? detectionStatus :
                                rallies.length > 0 ? `${rallies.length} rallies / ${totalHits} hits` :
                                    detectionStatus}
                        </span>
                    )}
                </div>

                {/* Detect Button */}
                <button
                    onClick={detectRallies}
                    disabled={isDetecting || !videoPath}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-all shadow-lg shrink-0 ${isDetecting || !videoPath
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/20 hover:shadow-emerald-900/40 transform hover:scale-105"
                        }`}
                >
                    {isDetecting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span>Detecting...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 10v3" />
                                <path d="M6 6v11" />
                                <path d="M10 3v18" />
                                <path d="M14 8v7" />
                                <path d="M18 5v13" />
                                <path d="M22 10v3" />
                            </svg>
                            <span>Detect</span>
                        </>
                    )}
                </button>
            </div>

            {/* Rally Navigator & Export */}
            {rallies.length > 0 && (
                <div className="flex items-center bg-zinc-900/80 backdrop-blur-md rounded-lg p-2 mt-1 border border-zinc-800 gap-2">
                    {/* Select All / None */}
                    <button
                        onClick={allSelected ? deselectAllRallies : selectAllRallies}
                        className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 px-1.5 py-0.5 border border-zinc-700 rounded hover:border-zinc-500 transition-colors shrink-0"
                        title={allSelected ? "Deselect all" : "Select all"}
                    >
                        {allSelected ? "None" : "All"}
                    </button>

                    {/* Rally Buttons with Checkboxes */}
                    <div className="flex items-center gap-1 overflow-x-auto flex-1">
                        {rallies.map((rally, idx) => {
                            const isSelected = selectedRallyIndices.has(idx);
                            return (
                                <div key={idx} className="flex items-center gap-0.5 shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleRallySelection(idx)}
                                        className="w-3 h-3 accent-emerald-500 cursor-pointer"
                                    />
                                    <button
                                        onClick={() => handleJumpToRally(rally.start_time)}
                                        className={`px-1.5 py-0.5 text-[10px] font-mono border rounded transition-all whitespace-nowrap ${isSelected
                                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                                            : "bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30"
                                            }`}
                                        title={`${formatTimeDurationToString(rally.start_time)} - ${formatTimeDurationToString(rally.end_time)} (${rally.hit_count} hits)`}
                                    >
                                        R{idx + 1}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Export Buttons */}
                    <div className="flex items-center gap-1 shrink-0 border-l border-zinc-800 pl-2">
                        <button
                            onClick={exportSelectedRallies}
                            disabled={!hasSelectedRallies || isExporting}
                            className={`px-2 py-1 text-[10px] font-mono rounded transition-all ${!hasSelectedRallies || isExporting
                                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 hover:border-amber-500/50"
                                }`}
                            title="Export selected rallies"
                        >
                            Export ({selectedRallyIndices.size})
                        </button>
                        <button
                            onClick={exportAllRallies}
                            disabled={isExporting}
                            className={`px-2 py-1 text-[10px] font-mono rounded transition-all ${isExporting
                                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50"
                                }`}
                            title="Export all rallies"
                        >
                            Export All
                        </button>
                        {isReelPreviewActive ? (
                            <>
                                <button
                                    onClick={exportRallyReel}
                                    disabled={isExporting}
                                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-all ${isExporting
                                        ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                        : "bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/30 hover:border-violet-500/50"
                                        }`}
                                    title="Export concatenated rally reel"
                                >
                                    Export Reel
                                </button>
                                <button
                                    onClick={() => setReelPreviewActive(false)}
                                    className="px-1.5 py-1 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded hover:border-zinc-500 transition-colors"
                                    title="Cancel reel preview"
                                >
                                    ✕
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setReelPreviewActive(true)}
                                disabled={isExporting}
                                className={`px-2 py-1 text-[10px] font-mono rounded transition-all ${isExporting
                                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                    : "bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/30 hover:border-violet-500/50"
                                    }`}
                                title="Preview & export rally reel (all rallies stitched into one video)"
                            >
                                Rally Reel
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
