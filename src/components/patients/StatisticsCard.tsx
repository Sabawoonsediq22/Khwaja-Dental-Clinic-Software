import React from "react";
import { cn } from "../../lib/utils";

export type StatisticsCardVariant = "success" | "info" | "warning" | "destructive";

export interface StatisticsCardProps {
  label: string;
  value: string | number;
  secondaryValue?: string;
  subtitle?: string | boolean;
  variant?: StatisticsCardVariant;
  className?: string;
}

const variantConfig: Record<StatisticsCardVariant, { bg: string; text: string }> = {
  success: {
    bg: "bg-green-50 dark:bg-green-950/20",
    text: "text-green-600 dark:text-green-400",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  destructive: {
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-600 dark:text-red-400",
  },
};

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  label,
  value,
  secondaryValue,
  subtitle,
  variant = "success",
  className,
}) => {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        "flex-1 rounded-lg p-5 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 font-mono tabular-nums">
            {value}
          </p>
          {secondaryValue && (
            <span className="inline-flex items-center text-[11px] sm:text-xl font-medium text-gray-700 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-700/50 border border-gray-200/60 dark:border-gray-600/40 rounded-full px-2.5 py-0.5 mt-1.5 tabular-nums">
              {secondaryValue}
            </span>
          )}
          {subtitle && (
            <p className={cn("text-xs mt-2", config.text)}>{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;