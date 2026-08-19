import { useUpdate } from "../../hooks/useUpdate";
import { Button } from "../ui";
import { toast } from "sonner";

export function UpdateNotification() {
  const {
    updateAvailable,
    updateInfo,
    isDownloading,
    downloadProgress,
    installUpdate,
  } = useUpdate();

  if (!updateAvailable || !updateInfo) return null;

  const handleUpdate = async () => {
    try {
      await installUpdate();
    } catch {
      toast.error("Update failed. Please try again.");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-blue-200 bg-white p-4 shadow-lg dark:border-blue-800 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Update Available
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Version {updateInfo.version} is ready to install.
            {updateInfo.notes && (
              <span className="mt-1 block">{updateInfo.notes}</span>
            )}
          </p>
          {isDownloading ? (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Downloading... {downloadProgress}%
              </p>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={handleUpdate}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Install & Restart
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
