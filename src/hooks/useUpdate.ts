import { useState, useEffect, useCallback, useRef } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { toast } from "sonner";
import i18n from "../i18n";

export type UpdateStatus =
  | "idle"
  | "downloading"
  | "installing"
  | "restarting"
  | "error";

export interface UpdateInfo {
  version: string;
  currentVersion?: string;
  date?: string;
  notes?: string;
}

interface UseUpdateReturn {
  updateAvailable: boolean;
  updateInfo: UpdateInfo | null;
  status: UpdateStatus;
  isDownloading: boolean;
  downloadProgress: number | null;
  downloadedBytes: number;
  totalBytes: number | null;
  error: string | null;
  checkForUpdates: () => Promise<void>;
  installUpdate: () => Promise<void>;
}

const isBusy = (status: UpdateStatus) =>
  status === "downloading" || status === "installing" || status === "restarting";

export function useUpdate(): UseUpdateReturn {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState<number | null>(null);

  const updaterRef = useRef<Update | null>(null);
  const statusRef = useRef<UpdateStatus>("idle");

  const changeStatus = useCallback((next: UpdateStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const checkForUpdates = useCallback(async () => {
    try {
      const update = await check();
      if (update) {
        updaterRef.current = update;
        setUpdateInfo({
          version: update.version,
          currentVersion: update.currentVersion,
          date: update.date,
          notes: update.body,
        });
        setUpdateAvailable(true);
      }
    } catch (err) {
      console.error("Failed to check for updates:", err);
      toast.error(i18n.t("update.checkFailed"));
    }
  }, []);

  const installUpdate = useCallback(async () => {
    const update = updaterRef.current;
    if (!update || isBusy(statusRef.current)) return;

    setError(null);
    setDownloadedBytes(0);
    setTotalBytes(null);
    changeStatus("downloading");

    try {
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started": {
            const length = event.data.contentLength;
            setTotalBytes(length && length > 0 ? length : null);
            setDownloadedBytes(0);
            break;
          }
          case "Progress":
            setDownloadedBytes((prev) => prev + event.data.chunkLength);
            break;
          case "Finished":
            changeStatus("installing");
            break;
        }
      });

      changeStatus("restarting");
      toast.success(i18n.t("update.restartToast"));
      setTimeout(() => {
        relaunch();
      }, 1500);
    } catch (err) {
      console.error("Failed to install update:", err);
      setError(err instanceof Error ? err.message : String(err));
      changeStatus("error");
      toast.error(i18n.t("update.failed"));
    }
  }, [changeStatus]);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  const downloadProgress =
    totalBytes && totalBytes > 0
      ? Math.min(100, Math.round((downloadedBytes / totalBytes) * 100))
      : null;

  return {
    updateAvailable,
    updateInfo,
    status,
    isDownloading: status === "downloading",
    downloadProgress,
    downloadedBytes,
    totalBytes,
    error,
    checkForUpdates,
    installUpdate,
  };
}
