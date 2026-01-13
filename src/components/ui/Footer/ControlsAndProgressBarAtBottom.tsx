import React, { useRef } from "react";
import { useVideoPlaybackAndConversionStore } from "@/lib/useVideoPlaybackAndConversionStore";
import { useMpvVideoPlaybackControl } from "@/hooks/useMpvVideoPlaybackControl";
import { formatTimeDurationToString } from "@/lib/utils";
import { VolumeControl } from "./VolumeControl";

// Native SVG Icons
const PlayIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
    </svg>
);

/**
 * ControlsAndProgressBarAtBottom Component
 * 
 * Includes:
 * - Play/Pause & Restart Button
 * - Interactive Seeker (Progress Bar)
 * - Timer (Current / Total)
 */
export const ControlsAndProgressBarAtBottom = () => {
    const {
        isVideoPlaying,
        currentPlaybackTime,
        videoDuration,
    } = useVideoPlaybackAndConversionStore();

    const { toggleVideoPlaybackState, seekToPosition } = useMpvVideoPlaybackControl();

    const seekerContainerRef = useRef<HTMLDivElement>(null);

    const [hoverTime, setHoverTime] = React.useState<number | null>(null);
    const [hoverX, setHoverX] = React.useState<number>(0);

    // Calculate progress percentage
    const progressPercentage = (currentPlaybackTime && videoDuration)
        ? (currentPlaybackTime / videoDuration) * 100
        : 0;

    /**
     * Handles clicking on the progress bar to seek.
     */
    const handleSeekInteraction = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!seekerContainerRef.current || !videoDuration) return;

        const containerRect = seekerContainerRef.current.getBoundingClientRect();
        const clickX = event.clientX - containerRect.left;
        const width = containerRect.width;

        const seekRatio = Math.max(0, Math.min(1, clickX / width));
        const seekTargetSeconds = seekRatio * videoDuration;

        seekToPosition(seekTargetSeconds);
    };

    /**
     * Handles mouse movement over the seeker to show the hover timestamp.
     */
    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!seekerContainerRef.current || !videoDuration) return;
        const rect = seekerContainerRef.current.getBoundingClientRect();
        const mouseX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
        const ratio = mouseX / rect.width;
        setHoverTime(ratio * videoDuration);
        setHoverX(mouseX);
    };

    const handleMouseLeave = () => {
        setHoverTime(null);
    };

    return (
        <div
            id="ControlsAndProgressBarAtBottom"
            className="flex items-center gap-8 w-full h-12 px-2 select-none"
        >
            {/* Playback Controls Group */}
            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={toggleVideoPlaybackState}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-all active:scale-90"
                    title={isVideoPlaying ? "Pause" : "Play"}
                >
                    {isVideoPlaying ? (
                        <PauseIcon className="w-[18px] h-[18px]" />
                    ) : (
                        <PlayIcon className="w-[18px] h-[18px] ml-0.5" />
                    )}
                </button>
            </div>

            {/* Interactive Progress Seeker */}
            <div
                ref={seekerContainerRef}
                onClick={handleSeekInteraction}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="flex-1 group relative flex items-center h-full cursor-pointer"
            >
                {/* Background Track - Ensure it has a visible height and background */}
                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden shadow-inner relative ring-1 ring-zinc-700/50">
                    {/* Fill Line */}
                    <div
                        className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-150 ease-out shadow-[0_0_15px_rgba(220,38,38,0.6)]"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                {/* Hover Time Tooltip */}
                {hoverTime !== null && (
                    <div
                        className="absolute bottom-full mb-2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-xl font-mono z-50 pointer-events-none whitespace-nowrap"
                        style={{ left: hoverX }}
                    >
                        {formatTimeDurationToString(hoverTime)}
                    </div>
                )}

                {/* Handle / Knob (Visible on hover) */}
                <div
                    className="SeekerHandle absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md border-2 border-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 scale-75 group-hover:scale-110"
                    style={{ left: `${progressPercentage}%` }}
                />

                {/* Invisible larger touch/hover zone */}
                <div className="absolute inset-0 h-full w-full z-10" />
            </div>

            {/* Timer Readout */}
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-tight shrink-0 text-white/90">
                <span className="w-[42px] text-right">
                    {formatTimeDurationToString(currentPlaybackTime)}
                </span>
                <span className="opacity-40">/</span>
                <span className="w-[42px]">
                    {formatTimeDurationToString(videoDuration)}
                </span>
            </div>

            {/* Volume Control */}
            <VolumeControl />
        </div>
    );
};

export default ControlsAndProgressBarAtBottom;