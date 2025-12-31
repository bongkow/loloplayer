import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "../dropdown-menu";
import { useVideoPlaybackAndConversionStore } from "../../../lib/useVideoPlaybackAndConversionStore";
import { useMpvVideoPlaybackControl } from "../../../hooks/useMpvVideoPlaybackControl";
import { useHlsMediaConversionProcess } from "../../../hooks/useHlsMediaConversionProcess";
import { useAppModeStore } from "../../../lib/useAppModeStore";

// Pure SVG Icons for a lightweight, dependency-free UI
const VideoIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" />
        <rect x="2" y="6" width="14" height="12" rx="2" />
    </svg>
);

const ConvertIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6" y2="6.01" />
        <line x1="6" y1="18" x2="6" y2="18.01" />
    </svg>
);

const ExitIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);

/**
 * MenuBarAtTop Component
 * 
 * A premium, desktop-style title bar and menu system for the HLS Maker application.
 * Handles file selection, HLS conversion initiation, and window management.
 * Follows the principle of separating UI from logic using stores and custom hooks
 */
export function MediaButton() {
    const { videoPath, isProcessingHls } = useVideoPlaybackAndConversionStore();
    const { appMode } = useAppModeStore();
    const { loadVideoFileIntoPlayer } = useMpvVideoPlaybackControl();
    const { initiateHlsConversionProcess } = useHlsMediaConversionProcess();
    const currentTauriWindow = getCurrentWindow();

    /**
     * Opens a file dialog to select a video file and triggers the loading process.
     * This logic is local to the menu bar as it's a direct user interaction point.
     */
    const handleInitiateVideoFileSelection = async () => {
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
            console.error("Error during file selection in MenuBar:", fileOpenError);
        }
    };

    return (
        <div className="flex items-center h-full pl-1">
            {/* Menu Options */}
            <div className="flex flex-row items-center h-full">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="h-8 px-4 flex items-center justify-center bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 text-zinc-400 hover:text-white rounded-[2px] transition-all duration-150 font-mono text-[10px] tracking-widest uppercase outline-none"
                        >
                            Media
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-2xl border-zinc-200 text-zinc-800 shadow-2xl rounded-[2px] mt-2">
                        {/* Alpha Player Specific Menu Items */}
                        {appMode === 'player' && (
                            <>
                                <DropdownMenuItem
                                    onClick={handleInitiateVideoFileSelection}
                                    className="flex items-center gap-2 text-xs focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer py-2 font-mono tracking-wide rounded-[1px]"
                                >
                                    <VideoIcon />
                                    <span className="font-medium">Open Video File...</span>
                                    <DropdownMenuShortcut className="ml-auto opacity-50 text-[10px]">Ctrl+O</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-zinc-100" />
                            </>
                        )}

                        {/* HLS Converter Specific Menu Items */}
                        {appMode === 'converter' && (
                            <>
                                <DropdownMenuItem
                                    onClick={initiateHlsConversionProcess}
                                    disabled={!videoPath || isProcessingHls}
                                    className="DropdownMenuItem flex items-center gap-2 text-xs focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed py-2 font-mono tracking-wide rounded-[1px]"
                                >
                                    <ConvertIcon />
                                    <span className="font-medium">Start HLS Conversion...</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-zinc-100" />
                            </>
                        )}

                        <DropdownMenuItem
                            onClick={() => currentTauriWindow.close()}
                            className="DropdownMenuItem flex items-center gap-2 text-xs focus:bg-red-50 text-red-600 focus:text-red-700 cursor-pointer py-2 font-mono tracking-wide rounded-[1px]"
                        >
                            <div className="text-red-500">
                                <ExitIcon />
                            </div>
                            <span className="font-medium">Exit</span>
                            <DropdownMenuShortcut className="ml-auto opacity-50 text-[10px]">Alt+F4</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
