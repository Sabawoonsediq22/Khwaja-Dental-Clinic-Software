use sqlx::SqlitePool;
use crate::models::*;
use crate::services::errors::{AppError, AppResult};
use chrono::Utc;

#[derive(Debug, sqlx::FromRow)]
struct ProcedureRow {
    treatment_record_id: String,
    procedure_name: String,
    procedure_additional_note: Option<String>,
    number_of_procedures: i32,
    unit_price_afn: f64,
    unit_price_usd: f64,
    total_price_afn: f64,
    total_price_usd: f64,
    performed_at: String,
}

pub struct VisitService;

impl VisitService {
    pub async fn create(pool: &SqlitePool, input: CreateVisitInput) -> AppResult<Visit> {
        let id = format!("V-{}-{:06}", Utc::now().format("%Y%m%d"), {
            let count = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM visits").fetch_one(pool).await.unwrap_or(0);
            count + 1
        });

        let mut tx = pool.begin().await?;
        let now = Utc::now().to_rfc3339();
        let visit_date = input.visit_date.clone().unwrap_or_else(|| now.clone());

        let visit = sqlx::query_as::<_, Visit>(
            "INSERT INTO visits (id, patient_id, visit_date, chief_complaint, clinical_notes, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             RETURNING id, patient_id, visit_date, chief_complaint, clinical_notes, status, created_at, updated_at"
        )
        .bind(&id)
        .bind(&input.patient_id)
        .bind(&visit_date)
        .bind(&input.chief_complaint)
        .bind(&input.clinical_notes)
        .bind("Open")
        .bind(&now)
        .bind(&now)
        .fetch_one(&mut *tx)
        .await?;

        tx.commit().await?;

        Ok(visit)
    }

    pub async fn update_status(pool: &SqlitePool, id: &str, status: VisitStatus) -> AppResult<Visit> {
        let now = Utc::now().to_rfc3339();
        let status_str = match status {
            VisitStatus::Open => "Open",
            VisitStatus::Completed => "Completed",
            VisitStatus::Cancelled => "Cancelled",
        };

        let mut tx = pool.begin().await?;

        let visit = sqlx::query_as::<_, Visit>(
            "UPDATE visits SET status=?, updated_at=? WHERE id=?
             RETURNING id, patient_id, visit_date, chief_complaint, clinical_notes, status, created_at, updated_at"
        )
        .bind(status_str)
        .bind(&now)
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Visit {} not found", id)))?;

        tx.commit().await?;

        Ok(visit)
    }

    pub async fn get_by_patient(pool: &SqlitePool, patient_id: &str) -> AppResult<Vec<Visit>> {
        let visits = sqlx::query_as(
            "SELECT id, patient_id, visit_date, chief_complaint, clinical_notes, status, created_at, updated_at FROM visits WHERE patient_id = ? ORDER BY visit_date DESC"
        )
        .bind(patient_id)
        .fetch_all(pool)
        .await?;

        Ok(visits)
    }

    #[allow(dead_code)]
    pub async fn find(pool: &SqlitePool, id: &str) -> AppResult<Visit> {
        let visit = sqlx::query_as(
            "SELECT id, patient_id, visit_date, chief_complaint, clinical_notes, status, created_at, updated_at FROM visits WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("Visit {} not found", id)))?;

        Ok(visit)
    }

    pub async fn get_with_treatments(pool: &SqlitePool, patient_id: &str) -> AppResult<Vec<PatientVisitWithTreatments>> {
        let visits = sqlx::query_as::<_, Visit>(
            "SELECT id, patient_id, visit_date, chief_complaint, clinical_notes, status, created_at, updated_at FROM visits WHERE patient_id = ? ORDER BY visit_date DESC"
        )
        .bind(patient_id)
        .fetch_all(pool)
        .await?;

        let mut result = Vec::new();

        for visit in visits {
            let rows: Vec<ProcedureRow> = sqlx::query_as(
                "SELECT tr.id as treatment_record_id,
                        p.name as procedure_name,
                        p.additional_note as procedure_additional_note,
                        tr.number_of_procedures,
                        COALESCE(p.procedure_price_afn, 0) as unit_price_afn,
                        COALESCE(p.procedure_price_usd, 0) as unit_price_usd,
                        (COALESCE(p.procedure_price_afn, 0) * tr.number_of_procedures) as total_price_afn,
                        (COALESCE(p.procedure_price_usd, 0) * tr.number_of_procedures) as total_price_usd,
                        tr.performed_at
                 FROM treatment_records tr
                 JOIN procedures p ON p.id = tr.procedure_id
                 WHERE tr.visit_id = ?
                 ORDER BY tr.performed_at DESC"
            )
            .bind(&visit.id)
            .fetch_all(pool)
            .await?;

            let mut treatment_procedures: Vec<TreatmentProcedure> = Vec::new();
            for row in rows {
                let treatment_record_id = row.treatment_record_id.clone();
                
                let teeth = sqlx::query_as::<_, TreatmentTooth>(
                    "SELECT id, treatment_record_id, tooth_number, tooth_quadrant FROM treatment_tooth WHERE treatment_record_id = ?"
                )
                .bind(&treatment_record_id)
                .fetch_all(pool)
                .await?.into_iter().collect();

                let xrays: Vec<String> = sqlx::query_scalar(
                    "SELECT file_path FROM xrays WHERE treatment_record_id = ? ORDER BY uploaded_at DESC"
                )
                .bind(&treatment_record_id)
                .fetch_all(pool)
                .await?
                .into_iter()
                .collect();

                let procedure_name = match row.procedure_additional_note.as_deref().map(str::trim).filter(|note| !note.is_empty()) {
                    Some(note) => format!("{} - {}", row.procedure_name, note),
                    None => row.procedure_name,
                };

                treatment_procedures.push(TreatmentProcedure {
                    treatment_record_id,
                    procedure_name,
                    procedure_additional_note: None,
                    number_of_procedures: row.number_of_procedures,
                    unit_price_afn: row.unit_price_afn,
                    unit_price_usd: row.unit_price_usd,
                    total_price_afn: row.total_price_afn,
                    total_price_usd: row.total_price_usd,
                    performed_at: row.performed_at,
                    teeth,
                    xrays,
                });
            }

            result.push(PatientVisitWithTreatments {
                visit_id: visit.id,
                visit_date: visit.visit_date,
                chief_complaint: visit.chief_complaint,
                clinical_notes: visit.clinical_notes,
                status: visit.status,
                procedures: treatment_procedures,
            });
        }

        Ok(result)
    }

    pub async fn list_all(
        pool: &SqlitePool,
        query: Option<&str>,
        status: Option<&str>,
        page: u32,
        per_page: u32,
    ) -> AppResult<VisitPageResult> {
        let offset = (page.saturating_sub(1)) * per_page;

        let mut where_clauses = Vec::new();
        let mut bind_values: Vec<String> = Vec::new();

        if let Some(q) = query {
            if !q.trim().is_empty() {
                let pattern = format!("%{}%", q.trim());
                where_clauses.push(
                    "(v.id LIKE ?1 OR v.chief_complaint LIKE ?1 OR p.full_name LIKE ?1 OR p.phone LIKE ?1)"
                );
                bind_values.push(pattern);
            }
        }

        if let Some(s) = status {
            if !s.is_empty() && s != "All" {
                where_clauses.push("v.status = ?");
                bind_values.push(s.to_string());
            }
        }

        let where_sql = if where_clauses.is_empty() {
            String::new()
        } else {
            format!("WHERE {}", where_clauses.join(" AND "))
        };

        // Count total
        let count_sql = format!(
            "SELECT COUNT(*) FROM visits v
             JOIN patients p ON p.id = v.patient_id
             {}",
            where_sql
        );
        let mut count_query = sqlx::query_scalar::<_, i64>(&count_sql);
        for val in &bind_values {
            count_query = count_query.bind(val);
        }
        let total = count_query.fetch_one(pool).await?;

        let total_pages = (total as f64 / per_page as f64).ceil() as i64;

        // Fetch items
        let items_sql = format!(
            "SELECT v.id,
                    v.patient_id,
                    p.full_name as patient_name,
                    p.phone as patient_phone,
                    v.visit_date,
                    v.chief_complaint,
                    v.clinical_notes,
                    v.status,
                    COALESCE(proc.procedures_count, 0) as procedures_count,
                    COALESCE(inv.total_afn, 0) as total_afn,
                    COALESCE(inv.total_usd, 0) as total_usd,
                    v.created_at
             FROM visits v
             JOIN patients p ON p.id = v.patient_id
             LEFT JOIN (
                 SELECT visit_id, COUNT(*) as procedures_count
                 FROM treatment_records
                 GROUP BY visit_id
             ) proc ON proc.visit_id = v.id
             LEFT JOIN invoices inv ON inv.visit_id = v.id
             {}
             ORDER BY v.visit_date DESC
             LIMIT ?{} OFFSET ?{}",
            where_sql,
            bind_values.len() + 1,
            bind_values.len() + 2,
        );

        let mut items_query = sqlx::query_as::<_, VisitListItem>(&items_sql);
        for val in &bind_values {
            items_query = items_query.bind(val);
        }
        items_query = items_query.bind(per_page as i64).bind(offset as i64);
        let items = items_query.fetch_all(pool).await?;

        // Status counts
        let open_count = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM visits WHERE status = 'Open'")
            .fetch_one(pool).await?;
        let completed_count = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM visits WHERE status = 'Completed'")
            .fetch_one(pool).await?;
        let cancelled_count = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM visits WHERE status = 'Cancelled'")
            .fetch_one(pool).await?;

        Ok(VisitPageResult {
            items,
            total,
            page,
            per_page,
            total_pages,
            open_count,
            completed_count,
            cancelled_count,
        })
    }
}