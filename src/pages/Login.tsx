import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { Button, Input, Checkbox } from "../components/ui";
import Logo from "../assets/favicon.svg";
import { toast } from "sonner";
import TitleBar from "../components/layouts/AuthTitleBar";
import { api } from "../lib/api";
import { translateAuthError } from "../lib/auth-errors";

type View = "login" | "forgot" | "reset-success";

const Login: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const [view, setView] = useState<View>("login");

  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(username, password, rememberMe);
      toast.success(t("auth.loginSuccess"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(translateAuthError(message, t));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmNewPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    if (newPassword.length < 4) {
      setError(t("auth.passwordTooShort"));
      return;
    }

    setIsLoading(true);
    try {
      await api.auth.resetPassword({ recovery_key: recoveryKey, new_password: newPassword });
      setView("reset-success");
      toast.success(t("auth.passwordResetSuccess"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(translateAuthError(message, t));
    } finally {
      setIsLoading(false);
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
              {view === "reset-success" ? (
                /* Success message */
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t("auth.passwordResetDone")}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("auth.passwordResetDoneDesc")}
                  </p>
                  <Button
                    type="button"
                    className="w-full cursor-pointer"
                    onClick={() => {
                      setView("login");
                      setRecoveryKey("");
                      setNewPassword("");
                      setConfirmNewPassword("");
                    }}
                  >
                    {t("auth.backToLogin")}
                  </Button>
                </div>
              ) : view === "forgot" ? (
                /* Forgot Password Form */
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t("auth.forgotPasswordTitle")}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t("auth.forgotPasswordSubtitle")}
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("auth.recoveryKey")}
                      </label>
                      <Input
                        type="text"
                        value={recoveryKey}
                        onChange={(e) => setRecoveryKey(e.target.value)}
                        placeholder={t("auth.recoveryKeyPlaceholder")}
                        required
                        autoFocus
                        className="font-mono tracking-wider"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("auth.newPassword")}
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t("auth.newPasswordPlaceholder")}
                        required
                        autoComplete="new-password"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("auth.confirmNewPassword")}
                      </label>
                      <Input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder={t("auth.confirmNewPasswordPlaceholder")}
                        required
                        autoComplete="new-password"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      disabled={isLoading}
                    >
                      {isLoading ? t("auth.resetting") : t("auth.resetPasswordButton")}
                    </Button>

                    <button
                      type="button"
                      className="w-full text-center text-sm text-primary hover:underline cursor-pointer"
                      onClick={() => {
                        setView("login");
                        setError("");
                        setRecoveryKey("");
                        setNewPassword("");
                        setConfirmNewPassword("");
                      }}
                    >
                      {t("auth.backToLogin")}
                    </button>
                  </form>
                </>
              ) : (
                /* Login Form */
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t("auth.title")}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t("auth.subtitle")}
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
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={rememberMe}
                          onCheckedChange={setRememberMe}
                        />
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          {t("auth.rememberMe")}
                        </label>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline cursor-pointer"
                        onClick={() => {
                          setView("forgot");
                          setError("");
                        }}
                      >
                        {t("auth.forgotPassword")}
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      disabled={isLoading}
                    >
                      {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
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

export default Login;
