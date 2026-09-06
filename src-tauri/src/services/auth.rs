use crate::models::*;
use crate::services::errors::{AppError, AppResult};
use sha2::{Digest, Sha256};
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct AuthService;

impl AuthService {
    fn generate_salt() -> String {
        let salt: [u8; 16] = rand::random();
        hex::encode(salt)
    }

    fn hash_password(password: &str, salt: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        hasher.update(salt.as_bytes());
        hex::encode(hasher.finalize())
    }

    fn generate_token() -> String {
        let token: [u8; 32] = rand::random();
        hex::encode(token)
    }

    fn generate_recovery_key() -> String {
        let segments: Vec<String> = (0..4)
            .map(|_| {
                let bytes: [u8; 2] = rand::random();
                format!("{:04X}", u16::from_be_bytes(bytes))
            })
            .collect();
        segments.join("-")
    }

    pub async fn has_users(pool: &SqlitePool) -> AppResult<bool> {
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
            .fetch_one(pool)
            .await?;
        Ok(count.0 > 0)
    }

    pub async fn setup(pool: &SqlitePool, input: SetupUserInput) -> AppResult<SetupResponse> {
        if Self::has_users(pool).await? {
            return Err(AppError::BadRequest(
                "User already exists. Cannot create another user via setup.".into(),
            ));
        }

        let id = Uuid::new_v4().to_string();
        let salt = Self::generate_salt();
        let password_hash = Self::hash_password(&input.password, &salt);
        let recovery_key = Self::generate_recovery_key();

        sqlx::query(
            "INSERT INTO users (id, username, password_hash, salt, recovery_key) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(&id)
        .bind(&input.username)
        .bind(&password_hash)
        .bind(&salt)
        .bind(&recovery_key)
        .execute(pool)
        .await?;

        let token = Self::create_session(pool, &id, true).await?;

        Ok(SetupResponse {
            token,
            username: input.username,
            recovery_key,
        })
    }

    pub async fn login(
        pool: &SqlitePool,
        input: LoginInput,
        remember_me: bool,
    ) -> AppResult<AuthResponse> {
        let user: UserRow = sqlx::query_as("SELECT * FROM users WHERE username = ?")
            .bind(&input.username)
            .fetch_optional(pool)
            .await?
            .ok_or_else(|| AppError::Unauthorized("Invalid username or password".into()))?;

        let password_hash = Self::hash_password(&input.password, &user.salt);
        if password_hash != user.password_hash {
            return Err(AppError::Unauthorized(
                "Invalid username or password".into(),
            ));
        }

        let token = Self::create_session(pool, &user.id, remember_me).await?;

        Ok(AuthResponse {
            token,
            username: user.username,
        })
    }

    pub async fn verify_session(pool: &SqlitePool, token: &str) -> AppResult<AuthResponse> {
        let session: SessionRow = sqlx::query_as(
            "SELECT s.*, u.username FROM auth_sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime('now')",
        )
        .bind(token)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| AppError::Unauthorized("Invalid or expired session".into()))?;

        Ok(AuthResponse {
            token: session.token,
            username: session.username,
        })
    }

    pub async fn logout(pool: &SqlitePool, token: &str) -> AppResult<()> {
        sqlx::query("DELETE FROM auth_sessions WHERE token = ?")
            .bind(token)
            .execute(pool)
            .await?;
        Ok(())
    }

    pub async fn change_password(
        pool: &SqlitePool,
        user_id: &str,
        input: ChangePasswordInput,
    ) -> AppResult<()> {
        let user: UserRow = sqlx::query_as("SELECT * FROM users WHERE id = ?")
            .bind(user_id)
            .fetch_optional(pool)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        let old_hash = Self::hash_password(&input.old_password, &user.salt);
        if old_hash != user.password_hash {
            return Err(AppError::Unauthorized(
                "Current password is incorrect".into(),
            ));
        }

        let new_salt = Self::generate_salt();
        let new_hash = Self::hash_password(&input.new_password, &new_salt);

        sqlx::query("UPDATE users SET password_hash = ?, salt = ?, updated_at = datetime('now') WHERE id = ?")
            .bind(&new_hash)
            .bind(&new_salt)
            .bind(user_id)
            .execute(pool)
            .await?;

        Ok(())
    }

    pub async fn reset_password(
        pool: &SqlitePool,
        input: ResetPasswordInput,
    ) -> AppResult<AuthResponse> {
        let user: UserRow = sqlx::query_as("SELECT * FROM users WHERE recovery_key = ?")
            .bind(&input.recovery_key)
            .fetch_optional(pool)
            .await?
            .ok_or_else(|| AppError::Unauthorized("Invalid recovery key".into()))?;

        let new_salt = Self::generate_salt();
        let new_hash = Self::hash_password(&input.new_password, &new_salt);

        sqlx::query("UPDATE users SET password_hash = ?, salt = ?, updated_at = datetime('now') WHERE id = ?")
            .bind(&new_hash)
            .bind(&new_salt)
            .bind(&user.id)
            .execute(pool)
            .await?;

        let token = Self::create_session(pool, &user.id, true).await?;

        Ok(AuthResponse {
            token,
            username: user.username,
        })
    }

    async fn create_session(
        pool: &SqlitePool,
        user_id: &str,
        remember_me: bool,
    ) -> AppResult<String> {
        sqlx::query("DELETE FROM auth_sessions WHERE user_id = ?")
            .bind(user_id)
            .execute(pool)
            .await?;

        let token = Self::generate_token();
        let expiry = if remember_me {
            "datetime('now', '+30 days')"
        } else {
            "datetime('now', '+12 hours')"
        };

        sqlx::query(&format!(
            "INSERT INTO auth_sessions (token, user_id, expires_at) VALUES (?, ?, {})",
            expiry
        ))
        .bind(&token)
        .bind(user_id)
        .execute(pool)
        .await?;

        Ok(token)
    }
}
