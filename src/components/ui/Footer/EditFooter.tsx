import { useVideoQualityControl } from "../../../hooks/useVideoQualityControl";
import { QualityPreset } from "../../../lib/useVideoQualityStore";
import ControlsAndProgressBarAtBottom from "./ControlsAndProgressBarAtBottom";

const PRESETS: { value: QualityPreset; label: string; description: string }[] = [
    { value: "off", label: "OFF", description: "Default (bilinear)" },
    { value: "high", label: "HIGH", description: "ewa_lanczossharp + spline36" },
    { value: "ultra", label: "ULTRA", description: "ewa_lanczos4sharpest" },
];

export function EditFooter() {
    const { activePreset, applyPreset } = useVideoQualityControl();

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto pb-2">
            {/* Playback Controls */}
            <div className="mb-2">
                <ControlsAndProgressBarAtBottom />
            </div>

            {/* Quality Enhancement Controls */}
            <div className="flex items-center justify-between bg-zinc-900/80 backdrop-blur-md rounded-lg p-3 border border-zinc-800">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mr-2">Quality</span>
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => applyPreset(preset.value)}
                            className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all ${
                                activePreset === preset.value
                                    ? preset.value === "off"
                                        ? "bg-zinc-700 text-zinc-200 ring-1 ring-zinc-600"
                                        : preset.value === "high"
                                        ? "bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/50"
                                        : "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50"
                                    : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
                            }`}
                            title={preset.description}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 px-3 border-l border-zinc-800">
                    <span className="text-xs font-mono text-zinc-500">
                        {activePreset === "off"
                            ? "Default scaling"
                            : activePreset === "high"
                            ? "High quality upscaling active"
                            : "Ultra quality upscaling active"}
                    </span>
                </div>
            </div>
        </div>
    );
}
