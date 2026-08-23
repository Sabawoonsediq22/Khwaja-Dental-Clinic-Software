import React from "react";
import { useTranslation } from "react-i18next";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Card, CardContent, CardFooter } from "../ui";
import { cn } from "../../lib/utils";
import {
  Globe,
  Mail,
  Phone,
  Clock,
  MapPin,
  Shield,
  Heart,
  Eye,
  Users,
  Tooth,
  ChevronRightIcon,
} from "../../shared/icons/icons";

const InfoRow = ({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
}) => (
  <div
    className={cn(
      "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
      onClick
        ? "cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10"
        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
    )}
    onClick={onClick}
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110 dark:bg-primary/20">
      {icon}
    </span>
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </span>
      {onClick ? (
        <span className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-200 group-hover:text-primary/80">
          <span className="truncate">{value}</span>
          <ChevronRightIcon className="h-3 w-3 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
        </span>
      ) : (
        <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
        </span>
      )}
    </div>
  </div>
);

const ValueBadge = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="group flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white px-4 py-2.5 transition-all duration-200 hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:from-gray-800/80 dark:to-gray-800 dark:hover:border-primary/30">
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110 dark:bg-primary/20">
      {icon}
    </span>
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
      {label}
    </span>
  </div>
);

const AboutSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden">
      {/* Brand Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 px-6 py-6 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 dark:bg-primary/10" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/5 dark:bg-primary/10" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-gray-800 dark:shadow-md">
            <Tooth className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Parsa Technology
            </h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {t(
                "about.hero.description",
                "We design and develop secure, modern and scalable software that helps dental clinics manage patients, operations and growth with confidence and simplicity."
              )}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="space-y-6 p-6">
        {/* Company Values */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t("about.cards.values.title", "Values")}
          </h4>
          <div className="flex flex-wrap gap-2.5">
            <ValueBadge
              icon={<Heart />}
              label={t("about.cards.mission.title", "Mission")}
            />
            <ValueBadge
              icon={<Eye />}
              label={t("about.cards.vision.title", "Vision")}
            />
            <ValueBadge
              icon={<Shield />}
              label={t("about.cards.values.text", "Integrity & Innovation")}
            />
            <ValueBadge
              icon={<Users />}
              label={t("about.cards.team.text", "Customer-First")}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-700/50" />

        {/* Contact Info */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t("about.contact.title", "Contact Information")}
          </h4>
          <div className="space-y-1">
            <InfoRow
              icon={<MapPin />}
              label={t("nav.about", "Address")}
              value={t(
                "about.contact.address",
                "Behsood, Nangarhar, Afghanistan"
              )}
            />
            <InfoRow
              icon={<Phone />}
              label={t("settings.contactPhone", "Phone")}
              value="+93 78 784 4487"
              onClick={() => openUrl("tel:+93787844487")}
            />
            <InfoRow
              icon={<Mail />}
              label={t("settings.supportEmail", "Email")}
              value={t("about.contact.email", "info@parsatechnology.com")}
              onClick={() => openUrl("mailto:info@parsatechnology.com")}
            />
            <InfoRow
              icon={<Globe />}
              label={t("contact.website", "Website")}
              value={t("about.contact.website", "www.parsatechnology.com")}
              onClick={() => openUrl("https://www.parsatechnology.com")}
            />
            <InfoRow
              icon={<Clock />}
              label={t("about.contact.hours", "Hours")}
              value={t(
                "about.contact.hours",
                "Sat - Thu: 9:00 AM - 6:00 PM"
              )}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-gray-100 bg-gray-50/50 px-6 py-3 text-center dark:border-gray-700/50 dark:bg-gray-800/30">
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()}{" "}
          {t("about.copyright", { year: new Date().getFullYear() })}
        </p>
      </CardFooter>
    </Card>
  );
};

export default AboutSection;
