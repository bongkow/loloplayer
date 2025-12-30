import { useEffect } from "react";
import {
    MpvConfig,
    init as initializeMpv,
    observeProperties,
    setProperty,
} from "tauri-plugin-libmpv-api";
import { useVideoPlaybackAndConversionStore } from "../lib/useVideoPlaybackAndConversionStore";

const MPV_OBSERVED_PROPERTIES = [
    ["pause", "flag"],
    ["time-pos", "double", "none"],
    ["duration", "double", "none"],
    ["filename", "string", "none"],
] as const;

// Use a module-level variable to track initialization across HMRs
let isMpvInitializedGlobally = false;

/**
 * Custom hook to handle the ONE-TIME initialization of the mpv player.
 * Should be called at the root of the application (e.g., in App.tsx).
 */
export function useMpvInitialization() {
    const {
        setIsMpvPlayerReady,
        setStatusMessage,
        setIsVideoPlaying,
        setCurrentPlaybackTime,
        setVideoDuration,
    } = useVideoPlaybackAndConversionStore();

    useEffect(() => {
        const performMpvInitialization = async () => {
            // If already initialized globally, just update the store
            if (isMpvInitializedGlobally) {
                setIsMpvPlayerReady(true);
                return;
            }

            try {
                const mpvConfiguration: MpvConfig = {
                    initialOptions: {
                        vo: "gpu-next",
                        hwdec: "auto-safe",
                        "keep-open": "yes",
                        "force-window": "yes",
                        "pause": "no",
                    },
                    observedProperties: MPV_OBSERVED_PROPERTIES,
                };

                console.log("[mpv-init] Starting initialization...");
                await initializeMpv(mpvConfiguration);

                isMpvInitializedGlobally = true;
                setIsMpvPlayerReady(true);
                setStatusMessage("Player ready");

                // Attach properties observer
                await observeProperties(
                    MPV_OBSERVED_PROPERTIES,
                    ({ name, data }) => {
                        console.log(`[mpv-observer] Property changed: ${name} =`, data);
                        switch (name) {
                            case "pause":
                                const isActuallyPaused = data === true;
                                setIsVideoPlaying(!isActuallyPaused);
                                break;
                            case "time-pos":
                                setCurrentPlaybackTime(data as number | null);
                                break;
                            case "duration":
                                setVideoDuration(data as number | null);
                                // Check for pending resume
                                const currentStore = useVideoPlaybackAndConversionStore.getState();
                                const pendingTime = currentStore.pendingResumeTime;
                                if (typeof data === 'number' && data > 0 && pendingTime !== null) {
                                    console.log(`[mpv-observer] Duration loaded (${data}s), executing pending resume to ${pendingTime}s`);

                                    // Execute seek
                                    setProperty("time-pos", pendingTime).catch(err =>
                                        console.error("Failed to execute pending resume seek:", err)
                                    );

                                    // Clear pending state
                                    currentStore.setPendingResumeTime(null);
                                    setStatusMessage(`Resumed at ${Math.floor(pendingTime)}s`);
                                }
                                break;
                            case "filename":
                                if (data) {
                                    setStatusMessage(`Playing: ${data}`);
                                }
                                break;
                        }
                    }
                );
            } catch (initializationError) {
                console.error("[mpv-init] Failed:", initializationError);
                setStatusMessage("Error: Failed to initialize player");
                isMpvInitializedGlobally = false;
            }
        };

        performMpvInitialization();

        // In a production app, you might want to call terminateMpv here, 
        // but for development HMR stability, we keep the instance alive.
        return () => {
            console.log("[mpv-init] Cleanup skipped for persistent instance stability");
        };
    }, [
        setIsMpvPlayerReady,
        setStatusMessage,
        setIsVideoPlaying,
        setCurrentPlaybackTime,
        setVideoDuration,
    ]);
}
