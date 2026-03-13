import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import applicationLogoImage from "./assets/logo1.png";
import { getMatches } from "@tauri-apps/plugin-cli";
import { useVideoPlaybackAndConversionStore } from "./lib/useVideoPlaybackAndConversionStore";
import { useAppModeStore } from "./lib/useAppModeStore";
import { useMpvVideoPlaybackControl } from "./hooks/useMpvVideoPlaybackControl";
import { useMpvInitialization } from "./hooks/useMpvInitialization";
import { MediaButton } from "@/components/ui/Header/MediaButton";
import { AboutThisAppButton } from "@/components/ui/Header/AboutThisAppButton";
import { useIdleTimer } from "./hooks/useIdleTimer";
import LoadStatus from "./components/ui/Footer/LoadStatus";
import { AlphaPlayerFooter } from "./components/ui/Footer/AlphaPlayerFooter";
import { HlsConverterFooter } from "./components/ui/Footer/HlsConverterFooter";
import { VideoCutterFooter } from "./components/ui/Footer/VideoCutterFooter";
import { RallyDetectorFooter } from "./components/ui/Footer/RallyDetectorFooter";
import { EditFooter } from "./components/ui/Footer/EditFooter";
import { AppModeSelector } from "./components/ui/Header/AppModeSelector";
import { WindowControls } from "./components/ui/Header/WindowControls";
import { useRecordPlaybackHistory } from "./hooks/useVideoPlaybackHistory";
import { useShortcutStore } from "./lib/useShortcutStore";
import { AlwaysOnTopToggle } from "./components/ui/Footer/AlwaysOnTopToggle";
import { useEffect } from "react";

/**
 * Main Application Component for HLS Maker.
 * Follows the principle of separating logic from UI using custom hooks and Zustand.
 * Controls and Progress bar are now integrated into the footer for a clean, professional look.
 */
function HlsMakerApplication() {
  const {
    videoPath,
    isProcessingHls,
    statusMessage,
    isMpvPlayerReady,
  } = useVideoPlaybackAndConversionStore();

  const { appMode } = useAppModeStore();

  // Track user activity to hide/show UI components
  const { isUserActive } = useIdleTimer(3000);

  // Initialize the mpv player once at the root level.
  useMpvInitialization();

  // Enable playback history recording
  useRecordPlaybackHistory();



  // ... existing imports ...

  // Global Shortcut Listener
  useEffect(() => {
    const handleGlobalKeyDown = useShortcutStore.getState().handleKeyDown;
    window.addEventListener("keydown", handleGlobalKeyDown);

    // Check for CLI args (File Association)
    const checkCliArgs = async () => {
      try {
        const matches = await getMatches();
        if (matches.args.file && matches.args.file.value) {
          const filePath = matches.args.file.value as string;
          await loadVideoFileIntoPlayer(filePath);
        }
      } catch (e) {
        console.error("Failed to parse CLI args:", e);
      }
    };
    checkCliArgs();

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const { loadVideoFileIntoPlayer } = useMpvVideoPlaybackControl();

  /**
   * Opens a file dialog to select a video file and triggers the loading process.
   */
  const initiateVideoFileSelectionProcess = async () => {
    try {
      const selectedFilePath = await openFileDialog({
        multiple: false,
        filters: [
          {
            name: "Video Files",
            extensions: ["mp4", "mkv", "mov", "avi", "webm", "m4v", "wmv", "flv"],
          },
        ],
      });

      if (selectedFilePath && typeof selectedFilePath === "string") {
        await loadVideoFileIntoPlayer(selectedFilePath);
      }
    } catch (fileOpenError) {
      console.error("Error during file selection:", fileOpenError);
    }
  };

  return (
    <div
      className={`flex flex-col w-full h-full text-zinc-100 font-sans overflow-hidden transition-colors duration-500 group ${videoPath && (appMode === 'player' || appMode === 'cutter' || appMode === 'rally' || appMode === 'edit') ? "bg-transparent" : "bg-zinc-950"
        }`}
    >
      <header
        data-tauri-drag-region
        className={`Header z-50 select-none relative h-16 flex flex-row items-center bg-zinc-950/40 backdrop-blur-xl shrink-0 border-b border-white/20 transition-all duration-500 ${isUserActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        <AppModeSelector />
        <MediaButton />
        <AboutThisAppButton />
        <WindowControls />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative min-h-0">
        {/* PLAYER & CUTTER MODE CONTENT (Shared Video View) */}
        {(appMode === 'player' || appMode === 'cutter' || appMode === 'rally' || appMode === 'edit') && (
          <>
            {!isMpvPlayerReady ? (
              <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                <div className="relative">
                  <div className="w-16 h-16 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" />
                  </div>
                </div>
                <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase">Initializing System</p>
              </div>
            ) : !videoPath ? (
              <div
                onClick={initiateVideoFileSelectionProcess}
                className="flex flex-col items-center justify-center gap-0 cursor-pointer group animate-in fade-in slide-in-from-bottom-8 duration-1000"
              >
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <img
                    src={applicationLogoImage}
                    alt="loloplayer Logo"
                    className="w-full h-full object-contain relative transition-transform duration-500 group-hover:scale-105 opacity-80 mix-blend-screen"
                  />
                </div>
                <div className="text-zinc-500 text-lg font-bold tracking-widest uppercase transition-colors duration-300 group-hover:text-zinc-300 font-['Orbitron']">loloplayer</div>
              </div>
            ) : (
              /* Native mpv playback visible through transparency. */
              null
            )}
          </>
        )}

        {/* CONVERTER MODE CONTENT */}
        {appMode === 'converter' && (
          <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-950 text-zinc-400">
            <div className="flex flex-col items-center gap-4 p-8 border border-zinc-900 rounded-2xl bg-zinc-900/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" />
                  <line x1="6" y1="6" x2="6" y2="6.01" />
                  <line x1="6" y1="18" x2="6" y2="18.01" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-zinc-200">HLS Converter</h2>
              <p className="text-sm font-medium opacity-60">Ready for configuration</p>
            </div>
          </div>
        )}
      </main>

      {/* Unified Control & Status Footer */}
      <footer id="Footer" className={`z-[999] solid-black-footer flex items-center justify-between px-4 border-t border-red-800 select-none min-h-[56px] py-1 transition-opacity duration-500 ${isUserActive ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left: System Status */}
        <LoadStatus isProcessingHls={isProcessingHls} statusMessage={statusMessage} />

        {/* Center: Dynamic Footer Controls */}
        {appMode === 'player' ? (
          <AlphaPlayerFooter videoPath={videoPath} />
        ) : appMode === 'converter' ? (
          <HlsConverterFooter />
        ) : appMode === 'rally' ? (
          <RallyDetectorFooter />
        ) : appMode === 'edit' ? (
          <EditFooter />
        ) : (
          <VideoCutterFooter />
        )}

        {/* Right: Always On Top Toggle */}
        <div className="flex items-center justify-end min-w-[150px]">
          <AlwaysOnTopToggle />
        </div>
      </footer>
    </div>
  );
}

export default HlsMakerApplication;
