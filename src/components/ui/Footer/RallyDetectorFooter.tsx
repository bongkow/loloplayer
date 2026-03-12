import { useRallyStore } from "../../../lib/useRallyStore";
import { useRallyDetection } from "../../../hooks/useRallyDetection";
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
        sensitivity,
        maxGap,
        setSensitivity,
        setMaxGap,
    } = useRallyStore();
    const { detectRallies } = useRallyDetection();
    const { seekToPosition } = useMpvVideoPlaybackControl();

    const handleJumpToRally = (startTime: number) => {
        seekToPosition(Math.max(0, startTime - 1));
    };

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
                </div>

                {/* Results Summary */}
                <div className="flex items-center gap-3 px-3 border-l border-zinc-800">
                    {rallies.length > 0 ? (
                        <span className="text-xs font-mono text-emerald-400">
                            {rallies.length} rallies / {totalHits} hits
                        </span>
                    ) : detectionError ? (
                        <span className="text-xs font-mono text-red-400 max-w-[200px] truncate" title={detectionError}>
                            {detectionError}
                        </span>
                    ) : (
                        <span className="text-xs font-mono text-zinc-500">
                            {isDetecting ? "Analyzing audio..." : "Ready to detect"}
                        </span>
                    )}
                </div>

                {/* Rally Navigator */}
                {rallies.length > 0 && (
                    <div className="flex items-center gap-1 px-3 border-l border-zinc-800 overflow-x-auto max-w-[300px]">
                        {rallies.map((rally, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleJumpToRally(rally.start_time)}
                                className="px-1.5 py-0.5 text-[10px] font-mono bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded transition-all whitespace-nowrap"
                                title={`${formatTimeDurationToString(rally.start_time)} - ${formatTimeDurationToString(rally.end_time)} (${rally.hit_count} hits)`}
                            >
                                R{idx + 1}
                            </button>
                        ))}
                    </div>
                )}

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
                            <span>Detect Rallies</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
