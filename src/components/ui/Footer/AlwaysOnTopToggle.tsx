import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppModeStore } from "../../../lib/useAppModeStore";

export function AlwaysOnTopToggle() {
    const { isAlwaysOnTop, toggleAlwaysOnTop } = useAppModeStore();

    // Side effect: Sync window state when store state changes
    useEffect(() => {
        getCurrentWindow().setAlwaysOnTop(isAlwaysOnTop).catch((error) => {
            console.error("Failed to sync always on top state:", error);
        });
    }, [isAlwaysOnTop]);

    return (
        <div
            onClick={toggleAlwaysOnTop}
            className="flex items-center gap-2 cursor-pointer group hover:opacity-100 transition-opacity"
        >
            <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors ${isAlwaysOnTop ? 'border-amber-500' : 'border-zinc-500 group-hover:border-zinc-300'}`}>
                {isAlwaysOnTop && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-in zoom-in duration-200" />
                )}
            </div>
            <span className={`text-[10px] font-mono font-bold tracking-tight uppercase transition-colors ${isAlwaysOnTop ? 'text-zinc-200' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                Always on Top [t]
            </span>


        </div>
    );
}
