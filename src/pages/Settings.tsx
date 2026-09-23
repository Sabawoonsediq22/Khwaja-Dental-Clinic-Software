import React, { useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

import BackupSection from "../components/settings/BackupSection";
import StatsCards from "../components/settings/StatsCards";
import AboutSection from "../components/settings/AboutSection";
import { useBackupSettings } from "../hooks/useBackup";
import ClinicForm from "../components/settings/ClinicForm";
import ChangePasswordForm from "../components/settings/ChangePasswordForm";
import { SettingsIcon } from "../shared/icons/icons";

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const clinicFormRef = useRef<{ save: () => void }>(null);
  const [brandingKey, setBrandingKey] = useState(0);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: api.settings.get,
  });
  const { data: backupSettings } = useBackupSettings();

  const handleClinicSaved = useCallback(() => {
    setBrandingKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div className="space-y-1 pt-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("settings.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("settings.subtitle")}
          </p>
        </div>
      </div>

      {/* Backup statistics overview — at-a-glance status first */}
      <StatsCards backups={[]} backupSettings={backupSettings} />

      {/* Primary settings: clinic profile + account security, balanced side by side */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <ClinicForm
          key={brandingKey}
          ref={clinicFormRef}
          settings={settings}
          onSaved={handleClinicSaved}
        />
        <ChangePasswordForm />
      </div>

      {/* Backup management — full width so dense restore/backup controls can breathe */}
      <BackupSection />

      {/* About */}
      <AboutSection />
    </div>
  );
};

export default Settings;
