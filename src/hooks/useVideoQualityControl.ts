import { setProperty } from "tauri-plugin-libmpv-api";
import { useVideoQualityStore, QualityPreset } from "../lib/useVideoQualityStore";

const QUALITY_SETTINGS: Record<QualityPreset, Record<string, string | boolean>> = {
    off: {
        scale: "bilinear",
        cscale: "bilinear",
        dscale: "bilinear",
        "sigmoid-upscaling": false,
        "correct-downscaling": false,
    },
    high: {
        scale: "ewa_lanczossharp",
        cscale: "spline36",
        dscale: "mitchell",
        "sigmoid-upscaling": true,
        "correct-downscaling": true,
    },
    ultra: {
        scale: "ewa_lanczos4sharpest",
        cscale: "ewa_lanczossharp",
        dscale: "mitchell",
        "sigmoid-upscaling": true,
        "correct-downscaling": true,
    },
};

export function useVideoQualityControl() {
    const { activePreset, setActivePreset } = useVideoQualityStore();

    const applyPreset = async (preset: QualityPreset) => {
        const settings = QUALITY_SETTINGS[preset];

        for (const [key, value] of Object.entries(settings)) {
            try {
                if (typeof value === "boolean") {
                    await setProperty(key, value ? "yes" : "no");
                } else {
                    await setProperty(key, value);
                }
            } catch (error) {
                console.error(`[Quality] Failed to set ${key}:`, error);
            }
        }

        setActivePreset(preset);
    };

    return { activePreset, applyPreset };
}
