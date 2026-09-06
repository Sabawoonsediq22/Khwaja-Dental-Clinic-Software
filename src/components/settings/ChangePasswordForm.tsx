import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
} from "../ui";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import { translateAuthError } from "../../lib/auth-errors";
import { toast } from "sonner";

export default function ChangePasswordForm() {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    if (newPassword.length < 4) {
      setError(t("auth.passwordTooShort"));
      return;
    }

    if (!userId) return;

    setIsLoading(true);
    try {
      await api.auth.changePassword(userId, {
        old_password: currentPassword,
        new_password: newPassword,
      });
      toast.success(t("auth.passwordChanged"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(translateAuthError(message, t));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.changePassword")}</CardTitle>
        <CardDescription>{t("auth.changePasswordDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("auth.currentPassword")}
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t("auth.currentPasswordPlaceholder")}
              required
              autoComplete="current-password"
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth.confirmNewPasswordPlaceholder")}
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="cursor-pointer" disabled={isLoading}>
            {isLoading ? t("auth.changing") : t("auth.changePassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
