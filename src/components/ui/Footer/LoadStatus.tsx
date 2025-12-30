const LoadStatus = ({ isProcessingHls, statusMessage }: { isProcessingHls: boolean, statusMessage: string }) => {
    return (
        <div id="LoadStatus" className="flex items-center gap-2 min-w-[150px] max-w-[200px]">
            <div className={`shrink-0 w-2 h-2 rounded-full shadow-[0_0_8px] ${isProcessingHls ? "bg-amber-500 shadow-amber-500/50 animate-pulse" : "bg-emerald-500 shadow-emerald-500/50"}`} />
            <span className="text-[10px] text-white/90 truncate font-semibold">
                {statusMessage}
            </span>
        </div>
    )
}

export default LoadStatus