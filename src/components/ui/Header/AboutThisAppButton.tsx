import {
    DropdownMenu,
    DropdownMenuContent,

    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../dropdown-menu";


export function AboutThisAppButton() {
    return (
        <div className="flex items-center h-full pl-1">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="h-8 px-4 flex items-center justify-center bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 text-zinc-400 hover:text-white rounded-[2px] transition-all duration-150 font-mono text-[10px] tracking-widest uppercase outline-none"
                    >
                        About
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-2xl border-zinc-200 text-zinc-800 shadow-2xl rounded-[2px] mt-2 p-4">
                    <div className="flex flex-col gap-1 items-center justify-center pb-2">
                        <h1 className="font-mono font-bold text-lg tracking-wider text-black">LOLOPLAYER</h1>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">v0.1.1</span>
                    </div>

                    <DropdownMenuSeparator className="bg-zinc-100 my-2" />

                    <div className="text-xs text-zinc-600 space-y-2 text-center leading-relaxed">
                        <p>
                            A professional-grade HLS video converter and player designed for high-performance streaming workflows.
                        </p>
                    </div>

                    <DropdownMenuSeparator className="bg-zinc-100 my-2" />

                    <div className="flex flex-col gap-1 text-[10px] text-zinc-400 text-center uppercase tracking-wider font-mono">
                        <span>Built with Tauri v2 & React</span>
                        <span>Powered by libmpv</span>
                    </div>

                    <DropdownMenuSeparator className="bg-zinc-100 my-2" />

                    <button
                        onClick={async () => {
                            const { open } = await import('@tauri-apps/plugin-shell');
                            await open('ms-settings:defaultapps');
                        }}
                        className="w-full h-8 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-white rounded-[2px] transition-colors font-mono text-[10px] tracking-widest uppercase outline-none"
                    >
                        Set as Default App
                    </button>
                </DropdownMenuContent>
            </DropdownMenu>
        </div >
    );
}
