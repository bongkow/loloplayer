import * as React from "react";
import { useAppModeStore, AppMode } from "../../../lib/useAppModeStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../dropdown-menu";

// Pure SVG Icons for a lightweight, dependency-free UI
const PlayIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

interface ModeOption {
    value: AppMode;
    label: string;
    icon: React.ReactNode;
}

/**
 * AppModeSelector Component
 * 
 * Provides a global mode switcher in the MenuBar.
 * Managed via useAppModeStore.
 */
export function AppModeSelector() {
    const { appMode, setAppMode } = useAppModeStore();

    const modes: ModeOption[] = [
        {
            value: "alpha-player",
            label: "player",
            icon: <PlayIcon className="text-emerald-500" />
        },
        {
            value: "hls-converter",
            label: "converter",
            icon: <SettingsIcon className="text-amber-500" />
        },
    ];

    const currentModeInfo = modes.find(m => m.value === appMode) || modes[0];

    return (
        <div
            className="AppModeSelector"
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 px-4 h-8 bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 rounded-[2px] transition-all duration-150 group outline-none">
                        <div className="flex flex-col items-start leading-none pointer-events-none">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${appMode === 'alpha-player' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {currentModeInfo.label}
                            </span>
                        </div>
                        <ChevronDownIcon className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="DropdownMenuContent w-48 backdrop-blur-2xl border-zinc-200 text-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200 rounded-[2px]"
                    align="start"
                    sideOffset={8}
                >
                    {modes.map((mode) => (
                        <DropdownMenuItem
                            key={mode.value}
                            onClick={() => setAppMode(mode.value)}
                            className={`DropdownMenuItem flex items-center gap-3 px-3 py-2.5 text-xs focus:bg-zinc-100 focus:text-zinc-900 cursor-pointer transition-all rounded-[1px] font-mono tracking-wide ${appMode === mode.value ? "bg-zinc-100 text-zinc-900" : "opacity-60 hover:opacity-100"
                                }`}
                        >
                            <div className={`p-1.5 rounded-[2px] transition-colors ${appMode === mode.value ? "bg-white shadow-sm ring-1 ring-zinc-200" : "bg-zinc-100"}`}>
                                <div className="w-3.5 h-3.5 flex items-center justify-center">
                                    {mode.icon}
                                </div>
                            </div>
                            <span className="font-semibold">{mode.label}</span>
                            {appMode === mode.value && (
                                <div className={`ml-auto w-1 h-1 rounded-sm ${appMode === 'alpha-player' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`} />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
