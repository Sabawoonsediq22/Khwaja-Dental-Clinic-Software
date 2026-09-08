interface BackendError {
  code?: string;
  message?: string;
}

const AUTH_ERROR_MAP: Record<string, string> = {
  "invalid username or password": "auth.invalidCredentials",
  "invalid or expired session": "auth.invalidSession",
  "invalid recovery key": "auth.invalidRecoveryKey",
  "current password is incorrect": "auth.incorrectCurrentPassword",
  "user already exists": "auth.userAlreadyExists",
  "database is locked": "auth.databaseLocked",
};

export function translateAuthError(raw: string, t: (key: string) => string): string {
  const lower = raw.toLowerCase();

  // Try JSON format first
  try {
    const parsed: BackendError = JSON.parse(raw);
    if (parsed.message) {
      const msgLower = parsed.message.toLowerCase();
      for (const [key, translationKey] of Object.entries(AUTH_ERROR_MAP)) {
        if (msgLower.includes(key)) {
          return t(translationKey);
        }
      }
      return parsed.message;
    }
  } catch {
    // Not JSON
  }

  // Match against known error substrings
  for (const [key, translationKey] of Object.entries(AUTH_ERROR_MAP)) {
    if (lower.includes(key)) {
      return t(translationKey);
    }
  }

  return raw;
}
