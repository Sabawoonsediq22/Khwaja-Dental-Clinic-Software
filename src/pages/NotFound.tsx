import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui";
import { HomeIcon } from "../shared/icons/icons";

/**
 * Catch-all 404 page so unknown routes never render an empty content area.
 */
const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-primary dark:text-white">404</p>
      <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
        {t("notFound.title", "Page not found")}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {t(
          "notFound.description",
          "The page you are looking for doesn't exist or has been moved.",
        )}
      </p>
      <Button
        className="mt-6 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <HomeIcon className="h-4 w-4" />
        {t("notFound.goHome", "Back to Dashboard")}
      </Button>
    </div>
  );
};

export default NotFound;
