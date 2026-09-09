import * as React from "react"

import { cn } from "../../lib/utils"
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from "../../shared/icons/icons"

interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  disabled?: boolean
}

function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  emptyMessage = "No results found.",
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)

  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = React.useMemo(() => {
    if (!query) return options
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase())
    )
  }, [options, query])

  React.useEffect(() => {
    setHighlightedIndex(-1)
  }, [query])

  React.useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          const opt = filteredOptions[highlightedIndex]
          if (!opt.disabled) {
            onValueChange?.(opt.value)
            setOpen(false)
          }
        }
        break
      case "Escape":
        setOpen(false)
        triggerRef.current?.focus()
        break
    }
  }

  function selectOption(opt: ComboboxOption) {
    if (opt.disabled) return
    onValueChange?.(opt.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          triggerClassName
        )}
      >
        <span className={cn("flex flex-1 text-left truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {open ? (
          <ChevronUpIcon className="pointer-events-none size-4 text-muted-foreground" />
        ) : (
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          onKeyDown={handleKeyDown}
          className={cn(
            "absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
            contentClassName
          )}
        >
          <div className="p-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="p-1">
            {filteredOptions.length === 0 && (
              <div className="px-2.5 py-1.5 text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
            {filteredOptions.map((opt, index) => (
              <div
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                aria-disabled={opt.disabled}
                onClick={() => selectOption(opt)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none",
                  value === opt.value && "bg-accent text-accent-foreground",
                  highlightedIndex === index && "bg-accent text-accent-foreground",
                  opt.disabled && "pointer-events-none opacity-50",
                  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                )}
              >
                <span className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
                  {opt.label}
                </span>
                {value === opt.value && (
                  <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                    <CheckCircleIcon className="pointer-events-none" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { Combobox }
export type { ComboboxOption, ComboboxProps }
