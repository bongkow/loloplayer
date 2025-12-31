import { useVideoPlaybackAndConversionStore } from "../../../lib/useVideoPlaybackAndConversionStore";
import { useVideoCutStore } from "../../../lib/useVideoCutStore";
import { useVideoCutProcess, formatTimeForFFmpeg } from "../../../hooks/useVideoCutProcess";
import ControlsAndProgressBarAtBottom from "./ControlsAndProgressBarAtBottom";

export function VideoCutterFooter() {
    const { currentPlaybackTime } = useVideoPlaybackAndConversionStore();
    const {
        startTime,
        endTime,
        setStartTime,
        setEndTime,
        isProcessing,
        statusMessage
    } = useVideoCutStore();

    const { initiateCutProcess } = useVideoCutProcess();

    const handleSetStart = () => {
        if (currentPlaybackTime !== null) {
            setStartTime(currentPlaybackTime);
        }
    };

    const handleSetEnd = () => {
        if (currentPlaybackTime !== null) {
            setEndTime(currentPlaybackTime);
        }
    };

    // Calculate cut duration
    const cutDuration = Math.max(0, endTime - startTime);

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto pb-2">

            {/* Playback Controls (Reused) */}
            <div className="mb-2">
                <ControlsAndProgressBarAtBottom />
            </div>

            {/* Cutter Specific Controls */}
            <div className="flex items-center justify-between bg-zinc-900/80 backdrop-blur-md rounded-lg p-3 border border-zinc-800">

                {/* Time Setters */}
                <div className="flex items-center gap-6">
                    {/* Start Time */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Start Time</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-emerald-400 font-bold">
                                {formatTimeForFFmpeg(startTime)}
                            </span>
                            <button
                                onClick={handleSetStart}
                                className="px-2 py-0.5 bg-zinc-800 hover:bg-emerald-500/20 text-xs text-zinc-300 hover:text-emerald-400 border border-zinc-700 hover:border-emerald-500/50 rounded transition-all"
                            >
                                Set
                            </button>
                        </div>
                    </div>

                    {/* End Time */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">End Time</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-rose-400 font-bold">
                                {formatTimeForFFmpeg(endTime)}
                            </span>
                            <button
                                onClick={handleSetEnd}
                                className="px-2 py-0.5 bg-zinc-800 hover:bg-rose-500/20 text-xs text-zinc-300 hover:text-rose-400 border border-zinc-700 hover:border-rose-500/50 rounded transition-all"
                            >
                                Set
                            </button>
                        </div>
                    </div>

                    {/* Duration Info */}
                    <div className="flex flex-col gap-1 px-4 border-l border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Duration</span>
                        <span className="font-mono text-sm text-zinc-200">
                            {formatTimeForFFmpeg(cutDuration)}
                        </span>
                    </div>
                </div>

                {/* Status & Action */}
                <div className="flex items-center gap-4">
                    {statusMessage !== "Ready to cut" && (
                        <span className="text-xs font-mono text-zinc-400 animate-pulse">
                            {statusMessage}
                        </span>
                    )}

                    <button
                        onClick={initiateCutProcess}
                        disabled={isProcessing || cutDuration <= 0}
                        className={`flex items-center gap-2 px-5 py-2 rounded font-bold text-sm transition-all shadow-lg ${isProcessing || cutDuration <= 0
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-900/20 hover:shadow-rose-900/40 transform hover:scale-105"
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="6" cy="6" r="3" />
                                    <circle cx="6" cy="18" r="3" />
                                    <line x1="20" y1="4" x2="8.12" y2="15.88" />
                                    <line x1="14.47" y1="14.48" x2="20" y2="20" />
                                    <line x1="8.12" y1="8.12" x2="12" y2="12" />
                                </svg>
                                <span>Cut Video</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
