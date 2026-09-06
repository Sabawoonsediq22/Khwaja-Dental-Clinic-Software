import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { cn } from "../../lib/utils";
import i18n from "../../i18n";
import { CloseIcon, MaximizeIcon, MinimizeIcon, RestoreIcon } from "../../shared/icons/icons";

const appWindow = getCurrentWindow();
const buttonBase =
  "flex items-center justify-center w-[46px] h-full transition-colors duration-150";

export default function AuthTitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const isRTL = i18n.language === "ps";

  useEffect(() => {
    const checkMaximized = async () => {
      try {
        setIsMaximized(await appWindow.isMaximized());
      } catch {}
    };
    checkMaximized();

    let unlistenResize: (() => void) | undefined;
    let unlistenFocus: (() => void) | undefined;

    const setup = async () => {
      try {
        unlistenResize = await appWindow.onResized(checkMaximized);
        unlistenFocus = await appWindow.onFocusChanged(({ payload: focused }) => {
          setIsFocused(focused);
        });
      } catch {}
    };
    setup();

    return () => {
      unlistenResize?.();
      unlistenFocus?.();
    };
  }, []);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handleMinimize = async () => {
    try { await appWindow.minimize(); } catch {}
  };

  const handleMaximizeToggle = async () => {
    try { await appWindow.toggleMaximize(); } catch {}
  };

  const handleClose = async () => {
    try { await appWindow.close(); } catch {}
  };

  const handleDoubleClick = () => {
    handleMaximizeToggle();
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn(
        "flex h-8 w-full select-none items-center",
        isDark
          ? "bg-gray-600 text-white"
          : "bg-[#eafaf6] border-[#d4d4d4] text-black",
        !isFocused && (isDark ? "opacity-70" : "opacity-60"),
        isRTL ? "pr-2" : "pr-2",
      )}
    >
      <div
        data-tauri-drag-region
        onDoubleClick={handleDoubleClick}
        className="flex items-center h-full min-w-0 flex-1"
      >
        <span className="text-[13px] leading-none tracking-tight select-none shrink-0 px-3">
          Khwaja Dental & Implants Clinic
        </span>
      </div>

      <div
        data-tauri-drag-region
        onDoubleClick={handleDoubleClick}
        className="flex h-full items-stretch -mr-2 shrink-0"
      >
        <button
          onClick={handleMinimize}
          aria-label="Minimize"
          className={cn(
            buttonBase,
            isDark
              ? "hover:bg-[#3c3c3c] active:bg-[#505050]"
              : "hover:bg-[#eeecec] active:bg-[#cccccc]",
          )}
        >
          <MinimizeIcon size="sm"/>
        </button>

        <button
          onClick={handleMaximizeToggle}
          aria-label={isMaximized ? "Restore" : "Maximize"}
          className={cn(
            buttonBase,
            isDark
              ? "hover:bg-[#3c3c3c] active:bg-[#505050]"
              : "hover:bg-[#eeecec] active:bg-[#cccccc]",
          )}
        >
          {isMaximized ? <RestoreIcon size="sm"/> : <MaximizeIcon size="sm"/>}
        </button>

        <button
          onClick={handleClose}
          aria-label="Close"
          className={cn(
            buttonBase,
            "hover:bg-[#da0c1d] hover:text-white active:bg-[#bf0f1d]",
          )}
        >
          <CloseIcon size="sm"/>
        </button>
      </div>
    </div>
  );
}
