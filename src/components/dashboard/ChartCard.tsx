import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, action, className }) => (
  <div className={className}>
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              {title}
          </CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-5 dark:bg-gray-800">{children}</CardContent>
    </Card>
  </div>
);

export default ChartCard;
