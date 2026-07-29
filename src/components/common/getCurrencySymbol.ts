import { PROCEDURES } from "../../shared/constants/Procedures";

export const getCurrencySymbol = (procedureName: string): string => {
  const proc = PROCEDURES.find((p) => p.name === procedureName);
  if (!proc) return "AFN";
  return proc.price_usd > 0 ? "$" : "AFN";
};

export const getProcedureCurrency = (procedureName: string): "AFN" | "USD" => {
  const proc = PROCEDURES.find((p) => p.name === procedureName);
  if (!proc) return "AFN";
  return proc.price_usd > 0 ? "USD" : "AFN";
};
