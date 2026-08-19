import { useState, useEffect, useCallback } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { toast } from "sonner";

interface UpdateInfo {
  version: string;
  date?: string;
  notes?: string;
}

interface UseUpdateReturn {
  updateAvailable: boolean;
  updateInfo: UpdateInfo | null;
  isDownloading: boolean;
  downloadProgress: number;
  checkForUpdates: () => Promise<void>;
  installUpdate: () => Promise<void>;
}

export function useUpdate(): UseUpdateReturn {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updater, setUpdater] = useState<Awaited<ReturnType<typeof check>> | null>(null);

  const checkForUpdates = useCallback(async () => {
    try {
      const update = await check();
      if (update) {
        setUpdateAvailable(true);
        setUpdateInfo({
          version: update.version || "unknown",
          date: update.date,
          notes: update.body,
        });
        setUpdater(update);
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!updater) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      let downloaded = 0;
      let contentLength = 0;

      await updater.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength || 0;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              setDownloadProgress(Math.round((downloaded / contentLength) * 100));
            }
            break;
          case "Finished":
            break;
        }
      });

      toast.success("Update downloaded! Restarting...", {
        duration: 2000,
      });

      setTimeout(async () => {
        await relaunch();
      }, 2000);
    } catch (error) {
      console.error("Failed to install update:", error);
      toast.error("Failed to install update. Please try again.");
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, [updater]);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  return {
    updateAvailable,
    updateInfo,
    isDownloading,
    downloadProgress,
    checkForUpdates,
    installUpdate,
  };
}
