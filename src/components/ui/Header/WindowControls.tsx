import { getCurrentWindow } from "@tauri-apps/api/window";

// Pure SVG Icons for a lightweight, dependency-free UI
const MinusIcon = () => (
    <div className="w-3 h-[1.5px] bg-current rounded-full" />
);

const SquareIcon = () => (
    <div className="w-2.5 h-2.5 border-[1.5px] border-current rounded-[1px]" />
);

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className || "w-3.5 h-3.5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);

/**
 * WindowControls Component
 * 
 * Handles application window state (minimize, maximize, close).
 * Extracted from MenuBarAtTop for better separation of concerns.
 */
export function WindowControls() {
    const currentTauriWindow = getCurrentWindow();

    return (
        <div className="flex items-center h-full ml-auto pr-1 gap-1">
            <button
                onClick={() => currentTauriWindow.minimize()}
                className="w-10 h-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 rounded-[2px] transition-all duration-150"
                title="Minimize"
            >
                <MinusIcon />
            </button>
            <button
                onClick={() => currentTauriWindow.toggleMaximize()}
                className="w-10 h-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 rounded-[2px] transition-all duration-150"
                title="Maximize"
            >
                <SquareIcon />
            </button>
            <button
                onClick={() => currentTauriWindow.close()}
                className="w-10 h-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-red-500/90 border border-transparent hover:border-red-500/50 rounded-[2px] transition-all duration-150"
                title="Close"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    );
}
