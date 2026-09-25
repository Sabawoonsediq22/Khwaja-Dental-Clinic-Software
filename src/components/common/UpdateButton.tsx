import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Button } from "../ui";
import {
  CloseIcon,
  DownloadIcon,
  ErrorTriangleIcon,
  LoadingIcon,
  UpdateIcon,
} from "../../shared/icons/icons";
import { cn } from "../../lib/utils";
import { useUpdate } from "../../hooks/useUpdate";

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

const UpdateButton: React.FC = () => {
  const { t } = useTranslation();
  const {
    updateAvailable,
    updateInfo,
    status,
    downloadProgress,
    downloadedBytes,
    totalBytes,
    error,
    installUpdate,
  } = useUpdate();

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    if (updateAvailable && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      setOpen(true);
    }
  }, [updateAvailable]);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!updateAvailable || !updateInfo) return null;

  const busy =
    status === "downloading" ||
    status === "installing" ||
    status === "restarting";
  const hasProgress = downloadProgress !== null;

  let releasedAt: string | null = null;
  if (updateInfo.date) {
    const date = new Date(updateInfo.date);
    if (!Number.isNaN(date.getTime())) {
      releasedAt = format(date, "MMM d, yyyy");
    }
  }

  const startUpdate = () => {
    void installUpdate();
  };

  const renderProgress = (label: string, hint?: string) => (
    <div role="status" aria-live="polite" className="mt-4">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
          <LoadingIcon size="xs" className="text-blue-600 dark:text-blue-400" />
          {label}
        </span>
        <span className="font-semibold tabular-nums text-blue-600 dark:text-blue-400">
          {status === "downloading" && hasProgress ? `${downloadProgress}%` : ""}
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        {status === "downloading" && hasProgress ? (
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-200 ease-out"
            style={{ width: `${downloadProgress}%` }}
          />
        ) : status === "downloading" ? (
          <div className="h-full w-1/3 rounded-full bg-blue-600 animate-[update-indeterminate_1.2s_ease-in-out_infinite]" />
        ) : (
          <div className="h-full w-full rounded-full bg-blue-600 animate-pulse" />
        )}
      </div>
      {hint && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {status === "downloading" && totalBytes !== null && (
        <p className="mt-1.5 text-xs tabular-nums text-gray-500 dark:text-gray-400">
          {formatBytes(downloadedBytes)} / {formatBytes(totalBytes)}
        </p>
      )}
    </div>
  );

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        variant="ghost"
        size="icon"
        aria-label={t("update.availableTitle")}
        aria-expanded={open}
        title={
          status === "downloading" && hasProgress
            ? t("update.downloadingProgress", { percent: downloadProgress })
            : t("update.buttonTitle", { version: updateInfo.version })
        }
        className={cn(
          "relative cursor-pointer border rounded-lg transition-colors",
          busy
            ? "border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-600 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900/60 dark:hover:text-blue-400"
            : "border-green-300 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-600 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 dark:hover:text-green-400",
        )}
      >
        {busy ? (
          <LoadingIcon size="lg" className="text-current" />
        ) : (
          <>
            <UpdateIcon size="lg" className="text-current" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
          </>
        )}
        {status === "downloading" && (
          <span className="absolute inset-x-1.5 bottom-1 h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
            <span
              className={cn(
                "block h-full rounded-full bg-current",
                !hasProgress &&
                  "w-1/3 animate-[update-indeterminate_1.2s_ease-in-out_infinite]",
              )}
              style={hasProgress ? { width: `${downloadProgress}%` } : undefined}
            />
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute end-0 top-[calc(100%_+_0.5rem)] z-50 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:w-96">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  busy
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                    : status === "error"
                      ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
                      : "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
                )}
              >
                {busy ? (
                  <LoadingIcon size="sm" className="text-current" />
                ) : status === "error" ? (
                  <ErrorTriangleIcon size="sm" className="text-current" />
                ) : (
                  <UpdateIcon size="sm" className="text-current" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {status === "error"
                    ? t("update.failedTitle")
                    : t("update.availableTitle")}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {updateInfo.currentVersion
                    ? `${updateInfo.currentVersion} → ${updateInfo.version}`
                    : t("update.versionLabel", { version: updateInfo.version })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("update.close")}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <CloseIcon size="sm" />
            </button>
          </div>

          {status === "idle" && (
            <>
              {updateInfo.notes && (
                <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                  {updateInfo.notes}
                </p>
              )}
              {releasedAt && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {t("update.releasedAt", { date: releasedAt })}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  onClick={startUpdate}
                  className="flex-1 cursor-pointer bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  <DownloadIcon size="sm" />
                  {t("update.updateNow")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                >
                  {t("update.later")}
                </Button>
              </div>
            </>
          )}

          {status === "downloading" &&
            renderProgress(t("update.downloading"))}

          {status === "installing" &&
            renderProgress(t("update.installing"), t("update.installingHint"))}

          {status === "restarting" &&
            renderProgress(t("update.restarting"), t("update.installingHint"))}

          {status === "error" && (
            <>
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                <p>{t("update.failed")}</p>
                {error && (
                  <p className="mt-1 break-words opacity-80">{error}</p>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  onClick={startUpdate}
                  className="flex-1 cursor-pointer"
                >
                  {t("update.retry")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                >
                  {t("update.later")}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UpdateButton;
