import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { Button, Input } from "../components/ui";
import Logo from "../assets/favicon.svg";
import { toast } from "sonner";
import TitleBar from "../components/layouts/AuthTitleBar";

const Setup: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { setup } = useAuth();
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
                className="mb-6 h-24 w-24 object-contain rounded-xl"
              />
              <h1 className="text-2xl font-bold text-center">
                {t("dashboard.logo")}
              </h1>
            </div>

            {/* Left: Form */}
            <div className="flex flex-col justify-center px-8 py-10 md:w-1/2">
              {recoveryKey ? (
                /* Recovery Key Display */
                <div className="space-y-4">
                  <div className="mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t("auth.recoveryKeyTitle")}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t("auth.recoveryKeyWarning")}
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-900/20">
                    <p className="mb-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                      {t("auth.saveThisKey")}
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-white px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-gray-900 dark:bg-gray-800 dark:text-white">
                        {recoveryKey}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyKey}
                        className="cursor-pointer shrink-0"
                      >
                        {keyCopied ? t("auth.copied") : t("auth.copy")}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full cursor-pointer"
                    onClick={() => window.location.reload()}
                  >
                    {t("auth.continueToLogin")}
                  </Button>
                </div>
              ) : (
                /* Setup Form */
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Powered by */}
      <div className="pb-4 text-center text-xs text-gray-400 dark:text-gray-500">
        Powered by <a href="https://www.parsatechnology.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 dark:hover:text-gray-300">www.parsatechnology.com</a>
      </div>
    </div>
  );
};

export default Setup;
