import { useEffect } from "react";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  modifier?: "ctrl" | "meta" | "alt",
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modifier === "ctrl") {
        if (e.ctrlKey && e.key.toLowerCase() === key.toLowerCase()) {
          e.preventDefault();
          callback(e);
        }
      } else if (modifier === "meta") {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key.toLowerCase()) {
          e.preventDefault();
          callback(e);
        }
      } else if (modifier === "alt") {
        if (e.altKey && e.key.toLowerCase() === key.toLowerCase()) {
          e.preventDefault();
          callback(e);
        }
      } else {
        // Bare-key shortcuts (e.g. "?") must not fire while the user is typing.
        if (isEditableTarget(e.target)) return;
        if (e.key.toLowerCase() === key.toLowerCase()) {
          callback(e);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, modifier]);
}
