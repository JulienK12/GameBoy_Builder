# Story 7.1: Migration Database & Backend Assets (Recreated)

Status: done

<!-- Context: Recreated by Smol Agent to ensure exhaustive coverage of asset unification -->

## Story

As an Architect,
I want to unify all static asset serving under the backend (`/assets/`) and migrate remaining database entities (`screens`, `lenses`),
so that we eliminate the split-brain state between frontend/backend and enable the final cleanup (Story 7.2).

## Acceptance Criteria

1.  **Database Uniformity**: `screen_variants` and `lens_variants` paths MUST start with `/assets`.
    -   *Note*: `shells` and `buttons` are already migrated, but a safety check is welcome.
2.  **Asset Physical Sync**: The backend `assets/` directory MUST contain 100% of the images currently in `frontend/public/images/`.
    -   Specific focus on `lenses/` (27 files) and `screens/` (14 files) which might be missing or partial in backend.
3.  **Idempotency**: The migration script MUST be safe to run multiple times (check `NOT LIKE '/assets%'`).
4.  **Verification**: A manual or automated check confirms that browsing Screens and Lenses in the app loads images from `http://localhost:3000/assets/...`.

## Tasks / Subtasks

- [x] **1. Create SQL Migration** (AC: 1, 3)
    - [x] Create `migrations/018_unify_remaining_assets.sql`.
    - [x] Write UPDATE for `screen_variants`: `SET image_url = '/assets' || image_url WHERE image_url NOT LIKE '/assets%'`.
    - [x] Write UPDATE for `lens_variants`: (same logic).
    - [x] Add safety check/update for `button_variants` (just in case).
    - [x] *Note*: `packs` and `expert_mods` found to have no `image_url` data/column, so ignore.

- [x] **2. Asset Synchronization** (AC: 2)
    - [x] **Command**: Use `rsync` or `cp -n` to merge frontend assets into backend.
        -   `cp -r -n frontend/public/images/lenses/* assets/images/lenses/`
        -   `cp -r -n frontend/public/images/screens/* assets/images/screens/`
        -   `cp -r -n frontend/public/images/shells/* assets/images/shells/` (Safety sync)
    - [x] Verify file counts match between source and destination.

- [x] **3. Verification** (AC: 4)
    - [x] Run migration: `sqlx migrate run`.
    - [x] Start backend (`cargo run`) and frontend (`npm run dev`).
    - [x] Go to "Atelier", select "Screens" -> Verify images load.
    - [x] Select "Lenses" -> Verify images load.
    - [x] Check Network tab: Request URL should be `http://localhost:3000/assets/...`.

## Dev Notes

### Current State Analysis (by Smol)
-   **Shells**: Already fixed by `017_fix_all_shell_paths.sql`.
-   **Buttons**: Already using `/assets` via `013` and `014` migrations.
-   **Screens/Lenses**: Currently un-migrated. They likely have relative paths `/images/...`.
-   **Packs/Expert Mods**: No image columns/data found in schema/seed. No action needed.

### File Structure Strategy
-   **Source**: `frontend/public/images/`
-   **Destination**: `assets/images/` (Project Root `assets` folder, mounted by Axum).
-   **Conflict Resolution**: If file exists in destination, keep destination (Backend is truth), UNLESS destination file is smaller/older?
    -   *Guidance*: Use `cp -n` (no clobber) to be safe, or check md5 if paranoid. Given strict control, `cp -n` is likely sufficient as backend should already have some copies.

### References
-   [Backend Static Serving](file:///home/julien/dev/gameboy_builder/docs/architecture-backend.md)
-   [Previous Shell Migration](file:///home/julien/dev/gameboy_builder/migrations/017_fix_all_shell_paths.sql)

## Dev Agent Record

### Agent Model Used
-   Antigravity (Smol)

### Completion Notes List
-   [x] Migration 018 created and applied.
-   [x] Migration 019 created (Fix PNG extensions for Atomic Purple/Kiwi).
-   [x] Lenses/Screens copied to assets.
-   [x] Visual verification passed.
-   [x] Verified `.png` extensions for specified shells.

### File List
-   `migrations/018_unify_remaining_assets.sql`
-   `migrations/019_fix_assets_and_pngs.sql`

