import React, { useRef, useState } from 'react';
import { useVolumeControl } from '@/hooks/useVolumeControl';

// Icons
const VolumeHighIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-4 0h-2.5l-5 5h-5v7h5l5 5v-17z" />
    </svg>
);

const VolumeMuteIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 9v6h4l5 5V4l-5 5H7z" />
        <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const VolumeControl = () => {
    const { volume, isMuted, setVolume, toggleMute } = useVolumeControl();
    const [isHovering, setIsHovering] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = Math.round((x / rect.width) * 100);
        setVolume(percentage);
        if (isMuted && percentage > 0) toggleMute(); // Unmute if dragging
    };

    // Calculate width for the fill bar
    const fillWidth = isMuted ? 0 : volume;

    return (
        <div
            className="flex items-center gap-2 group/volume"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <button
                onClick={toggleMute}
                className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted || volume === 0 ? (
                    <VolumeMuteIcon className="w-5 h-5" />
                ) : (
                    <VolumeHighIcon className="w-5 h-5" />
                )}
            </button>

            {/* Slider Container - Expands on hover or always visible? User asked for 'slide button'. 
                We can make it always visible for better UX in a desktop player, or smaller.
                Let's make it a small bar that is always there.
             */}
            <div
                className="relative w-24 h-8 flex items-center cursor-pointer"
                ref={sliderRef}
                onClick={handleVolumeChange}
                onMouseMove={(e) => {
                    if (e.buttons === 1) handleVolumeChange(e);
                }}
            >
                {/* Track */}
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    {/* Fill */}
                    <div
                        className="h-full bg-white transition-all duration-150"
                        style={{ width: `${fillWidth}%` }}
                    />
                </div>

                {/* Knob - Visible on hover */}
                <div
                    className={`absolute w-3 h-3 bg-white rounded-full shadow-md pointer-events-none transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
                    style={{ left: `calc(${fillWidth}% - 6px)` }}
                />
            </div>
        </div>
    );
};
