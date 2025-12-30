import * as React from "react"
import { cn } from "@/lib/utils"
// Import useClickOutside hook
import { useClickOutside } from "@/hooks/useClickOutside"

// --- Context for managing dropdown state ---
// --- Context for managing dropdown state ---
interface DropdownContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DropdownMenuContext = React.createContext<DropdownContextValue | undefined>(undefined)

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error("useDropdownMenu must be used within a DropdownMenu")
  }
  return context
}

// --- Components ---

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild, onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useDropdownMenu()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen((prev) => !prev)
    onClick?.(e)
  }

  // Combine local ref with context triggerRef
  const handleRef = (node: HTMLButtonElement | null) => {
    // Sync with context ref
    if (triggerRef) (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;

    // Sync with forwarded ref
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    }
  };

  // If asChild is true, we clone the child element to attach props
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      ...props,
      // @ts-ignore - cloning logic
      ref: handleRef,
      onClick: handleClick,
      "data-state": open ? "open" : "closed",
    })
  }

  return (
    <button
      ref={handleRef}
      onClick={handleClick}
      data-state={open ? "open" : "closed"}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end"; sideOffset?: number }
>(({ className, children, align = "center", sideOffset = 4, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useDropdownMenu()
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Sync internal ref with forwarded ref if possible
  React.useImperativeHandle(ref, () => contentRef.current!)

  // Cast contentRef to RefObject<HTMLElement> to satisfy hook
  useClickOutside(contentRef as React.RefObject<HTMLElement>, (event) => {
    // Critical fix: If click is on the trigger, ignore it (let trigger handle toggle)
    if (triggerRef.current && triggerRef.current.contains(event.target as Node)) {
      return;
    }
    if (open) setOpen(false)
  })

  if (!open) return null

  // Align logic (simple mapping for now)
  const alignClass = align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2"

  return (
    <div
      ref={contentRef}
      data-state={open ? "open" : "closed"}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "mt-2", // Simple vertical offset
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; disabled?: boolean }
>(({ className, inset, onClick, disabled, ...props }, ref) => {
  const { setOpen } = useDropdownMenu()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    // Close on item click
    setOpen(false)
    onClick?.(e)
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      aria-disabled={disabled}
      data-disabled={disabled}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

// --- Unused Components (Skeleton exports to prevent breaking existing imports if any remain) ---
const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuSub = () => null
const DropdownMenuSubContent = () => null
const DropdownMenuSubTrigger = () => null
const DropdownMenuRadioGroup = () => null
const DropdownMenuRadioItem = () => null
const DropdownMenuCheckboxItem = () => null
const DropdownMenuLabel = () => null

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  // Exports kept for compatibility but effectively no-ops or simple wrappers
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
}
