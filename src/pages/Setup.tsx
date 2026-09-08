import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { Button, Input } from "../components/ui";
import { Dialog } from "../components/ui/Dialog";
import Logo from "../assets/favicon.svg";
import { toast } from "sonner";
import TitleBar from "../components/layouts/AuthTitleBar";

const Setup: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { setup, completeSetup } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    if (password.length < 4) {
      setError(t("auth.passwordTooShort"));
      return;
    }

    setIsLoading(true);
    try {
      const key = await setup(username, password);
      setRecoveryKey(key);
      toast.success(t("auth.setupSuccess"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = async () => {
    if (recoveryKey) {
      await navigator.clipboard.writeText(recoveryKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  const changeLanguage = (lng: "en" | "ps") => {
    i18n.changeLanguage(lng);
  };

  const isRTL = i18n.language === "ps";

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <TitleBar />
      <div className="relative flex flex-1 items-center justify-center px-4">
        {/* Language Switcher */}
        <div className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-10 flex gap-1`}>
          {(["en", "ps"] as const).map((lng) => (
            <Button
              key={lng}
              variant={i18n.language === lng ? "default" : "ghost"}
              size="sm"
              onClick={() => changeLanguage(lng)}
              className="cursor-pointer"
            >
              {lng.toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="w-full max-w-3xl">
          <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 md:flex-row-reverse">
            {/* Right: Logo & Branding */}
            <div className="flex flex-col items-center justify-center bg-primary px-8 py-12 text-white md:w-1/2">
              <img
                src={Logo}
                alt="Clinic Logo"
                className="h-52 w-52 object-contain rounded-xl"
              />
              <h1 className="text-2xl font-bold text-center">
                {t("dashboard.logo")}
              </h1>
            </div>

            {/* Left: Form */}
            <div className="flex flex-col justify-center px-8 py-10 md:w-1/2">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("auth.setupTitle")}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("auth.setupSubtitle")}
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("auth.username")}
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("auth.usernamePlaceholder")}
                    required
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("auth.password")}
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.passwordPlaceholder")}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("auth.confirmPassword")}
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? t("auth.settingUp") : t("auth.setupButton")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Powered by */}
      <div className="pb-4 text-center text-xs text-gray-400 dark:text-gray-500">
        Powered by <a href="https://www.parsatechnology.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 dark:hover:text-gray-300">www.parsatechnology.com</a>
      </div>

      {/* Recovery Key Modal - Non-closeable */}
      <Dialog
        isOpen={!!recoveryKey}
        onClose={() => {}}
        showCloseButton={false}
        title={t("auth.recoveryKeyTitle")}
        size="md"
      >
        <div className="space-y-4">
          {/* Warning Message */}
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-900/20">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {t("auth.recoveryKeyWarning")}
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  {t("auth.saveThisKey")}
                </p>
              </div>
            </div>
          </div>

          {/* Recovery Key Display */}
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
              {recoveryKey}
            </code>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCopyKey}
              className="cursor-pointer shrink-0"
            >
              {keyCopied ? (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t("auth.copied")}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {t("auth.copy")}
                </span>
              )}
            </Button>
          </div>

          {/* Continue Button */}
          <Button
            type="button"
            className="w-full cursor-pointer"
            onClick={completeSetup}
          >
            {t("auth.continueToLogin")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default Setup;
