use sqlx::SqlitePool;
use crate::models::*;
use crate::services::errors::AppResult;
use chrono::Utc;

pub struct PaymentService;

impl PaymentService {
    pub async fn add(pool: &SqlitePool, input: AddPaymentInput) -> AppResult<Payment> {
        let id = format!("PAY-{}", uuid::Uuid::new_v4().simple());
        let now = Utc::now().to_rfc3339();
        let method_str = match input.method {
            PaymentMethod::Cash => "Cash",
            PaymentMethod::Card => "Card",
            PaymentMethod::Mobile => "Mobile",
            PaymentMethod::Insurance => "Insurance",
        };

        let mut tx = pool.begin().await?;

        let payment = sqlx::query_as::<_, Payment>(
            "INSERT INTO payments (id, invoice_id, amount, amount_afn, amount_usd, method, notes, received_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             RETURNING id, invoice_id, amount, amount_afn, amount_usd, method, notes, received_at"
        )
        .bind(&id)
        .bind(&input.invoice_id)
        .bind(input.amount)
        .bind(input.amount_afn)
        .bind(input.amount_usd)
        .bind(method_str)
        .bind(&input.notes)
        .bind(&now)
        .fetch_one(&mut *tx)
        .await?;

        // Update invoice paid amount and status for both currencies
        sqlx::query(
            "UPDATE invoices SET
             paid_amount = COALESCE(paid_amount, 0) + ?,
             paid_afn = COALESCE(paid_afn, 0) + ?,
             paid_usd = COALESCE(paid_usd, 0) + ?,
             outstanding_amount = CASE
                 WHEN COALESCE(outstanding_amount, 0) - ? < 0 THEN 0
                 ELSE COALESCE(outstanding_amount, 0) - ?
             END,
             outstanding_afn = CASE
                 WHEN COALESCE(outstanding_afn, 0) - ? < 0 THEN 0
                 ELSE COALESCE(outstanding_afn, 0) - ?
             END,
             outstanding_usd = CASE
                 WHEN COALESCE(outstanding_usd, 0) - ? < 0 THEN 0
                 ELSE COALESCE(outstanding_usd, 0) - ?
             END,
             status = CASE
                 WHEN COALESCE(outstanding_afn, 0) - ? <= 0 AND COALESCE(outstanding_usd, 0) - ? <= 0 THEN 'Paid'
                 WHEN COALESCE(paid_afn, 0) + ? > 0 OR COALESCE(paid_usd, 0) + ? > 0 THEN 'Partial'
                 ELSE status
             END
             WHERE id = ?"
        )
        .bind(input.amount)
        .bind(input.amount_afn)
        .bind(input.amount_usd)
        .bind(input.amount)
        .bind(input.amount)
        .bind(input.amount_afn)
        .bind(input.amount_afn)
        .bind(input.amount_usd)
        .bind(input.amount_usd)
        .bind(input.amount_afn)
        .bind(input.amount_usd)
        .bind(input.amount_afn)
        .bind(input.amount_usd)
        .bind(&input.invoice_id)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        Ok(payment)
    }

    pub async fn list_for_invoice(pool: &SqlitePool, invoice_id: &str) -> AppResult<Vec<Payment>> {
        let payments = sqlx::query_as(
            "SELECT id, invoice_id, amount, COALESCE(amount_afn, 0) as amount_afn, COALESCE(amount_usd, 0) as amount_usd, method, notes, received_at FROM payments WHERE invoice_id = ?"
        )
        .bind(invoice_id)
        .fetch_all(pool)
        .await?;

        Ok(payments)
    }
}