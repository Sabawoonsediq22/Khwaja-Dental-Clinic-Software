import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button, Input } from "../ui";
import type { AddPaymentInput } from "../../types/ApiTypes";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  outstandingAmount: number;
  outstandingAfn?: number;
  outstandingUsd?: number;
  onSave: (input: AddPaymentInput) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  outstandingAmount,
  outstandingAfn = 0,
  outstandingUsd = 0,
  onSave,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<"Cash" | "Card" | "Mobile" | "Insurance">("Cash");
  const [currency, setCurrency] = useState<"AFN" | "USD">("AFN");

  const hasAfn = outstandingAfn > 0 || (outstandingAfn === 0 && outstandingUsd === 0);
  const hasUsd = outstandingUsd > 0;

  const availableCurrencies: ("AFN" | "USD")[] = [];
  if (hasAfn) availableCurrencies.push("AFN");
  if (hasUsd) availableCurrencies.push("USD");

  useEffect(() => {
    if (!availableCurrencies.includes(currency)) {
      setCurrency(availableCurrencies[0]);
    }
  }, [outstandingAfn, outstandingUsd]);

  const maxAmount = currency === "AFN" ? outstandingAfn || outstandingAmount : outstandingUsd;
  const effectiveMax = maxAmount || outstandingAmount;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setAmount("");
      return;
    }
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > effectiveMax) {
      setAmount(effectiveMax.toString());
    } else {
      setAmount(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount > effectiveMax) {
      return;
    }

    onSave({
      invoice_id: invoiceId,
      amount_afn: currency === "AFN" ? paymentAmount : 0,
      amount_usd: currency === "USD" ? paymentAmount : 0,
      method,
      notes: notes.trim() || null,
    });

    setAmount("");
    setNotes("");
    setMethod("Cash");
    setCurrency(availableCurrencies[0]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("billing.recordPayment", "Record Payment")} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("billing.paymentAmount", "Payment Amount")}</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={effectiveMax}
                value={amount}
                onChange={handleAmountChange}
                placeholder={t("billing.enterAmount", "Enter amount")}
                required
                className="w-full"
              />
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "AFN" | "USD")}
              className="px-3 py-2 border rounded-md text-sm"
            >
              {availableCurrencies.includes("AFN") && <option value="AFN">AFN</option>}
              {availableCurrencies.includes("USD") && <option value="USD">$</option>}
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {outstandingAfn > 0 && t("billing.outstandingAmount", "Outstanding: {{amount}} AFN", { amount: outstandingAfn.toLocaleString() })}
            {outstandingAfn > 0 && outstandingUsd > 0 && " | "}
            {outstandingUsd > 0 && `$${outstandingUsd.toLocaleString()}`}
            {outstandingAfn === 0 && outstandingUsd === 0 && t("billing.outstandingAmount", "Outstanding: {{amount}} AFN", { amount: outstandingAmount.toLocaleString() })}
          </p>
          {amount !== "" && parseFloat(amount) > 0 && parseFloat(amount) >= effectiveMax && (
            <p className="text-xs text-amber-600 mt-1">
              {t("billing.amountClamped", "Amount cannot exceed the outstanding balance of {{max}}", { max: effectiveMax.toLocaleString() })}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("billing.paymentMethod", "Payment Method")}</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as typeof method)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="Cash">{t("billing.methods.cash", "Cash")}</option>
            <option value="Card">{t("billing.methods.card", "Card")}</option>
            <option value="Mobile">{t("billing.methods.mobile", "Mobile")}</option>
            <option value="Insurance">{t("billing.methods.insurance", "Insurance")}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("billing.notes", "Notes")} ({t("common.optional", "optional")})</label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("billing.paymentNotesPlaceholder", "Payment reference or notes")}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="cursor-pointer">
            {t("billing.recordPayment")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;