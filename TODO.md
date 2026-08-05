# Fix Global Search "No results found" Issue

## Root Cause

The payments query in `SearchService::global_search` references a non-existent `pay.amount` column, causing the entire search to error out and always display "No results found".

## Steps

- [x] 1. Update `GlobalSearchPayment` struct in `src-tauri/src/models.rs` to remove the invalid `amount` field
- [x] 2. Fix the payments SQL query in `src-tauri/src/services/search.rs` to use `amount_afn`/`amount_usd`
- [x] 3. Rebuild the Rust backend to apply the fix (cargo check passed successfully)
