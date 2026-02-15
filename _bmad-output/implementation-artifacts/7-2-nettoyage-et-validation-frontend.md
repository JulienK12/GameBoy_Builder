# Story 7.2: Nettoyage et Validation Frontend

Status: ready-for-dev

## Story

As a Developer,
I want to remove duplicated assets from the frontend and validate that the application correctly consumes images from the backend,
so that I reduce the build size, eliminate "split-brain" asset management, and ensure a cleaner architecture.

## Acceptance Criteria

1.  **Backend Consumption Verification**: The application MUST display all product images (shells, screens, lenses, buttons) correctly by loading them from the backend URL (`http://localhost:3000/assets/...`).
2.  **Asset Cleanup**: The following directories and files MUST be deleted from the frontend:
    -   `frontend/public/images/shells/`
    -   `frontend/public/images/screens/`
    -   `frontend/public/images/lenses/`
3.  **Orphan Check**: No code in the frontend should reference local `/images/` paths for product assets.
4.  **Non-Regression**: The application UI must NOT show any broken image icons (404s) during navigation of the catalog.
5.  **UI Icons Preservation**: Pure UI icons (like category headers in `constants.js` pointing to `src/assets/icons/`) MUST be preserved as they are part of the interface.

## Tasks / Subtasks

- [x] **1. Pre-Cleanup Verification** (AC: 1, 4)
    - [x] Run the app and verify in the Network tab that images for Shells, Screens, and Lenses are served from `http://localhost:3000/assets/...`.
    - [x] Specifically verify "Atomic Purple" and "Kiwi" shells use `.png` extensions (handled by `getShellImageUrl` in `backend.js`).
- [x] **2. Asset Removal** (AC: 2)
    - [x] Delete `frontend/public/images/shells/`.
    - [x] Delete `frontend/public/images/screens/`.
    - [x] Delete `frontend/public/images/lenses/`.
- [x] **3. Code Cleanup & Scan** (AC: 3, 5)
    - [x] Grep for `/images/` in `frontend/src` and `frontend/public`.
    - [x] Replace any remaining local references with calls to the backend API helpers (`getShellImageUrl`, etc.) or ensure they are correctly handled by `formatImageUrl`.
- [x] **4. Final Validation** (AC: 4)
    - [x] Run `npx playwright test tests/oem-shells.spec.js` and `tests/asset-serving.spec.js`.

## Dev Notes

### Architecture & Patterns
-   **Backend Asset Serving**: The backend (Rust/Axum) mounts the `assets/` folder and serves it at `/assets`.
-   **Frontend API Helpers**: `frontend/src/api/backend.js` contains the logic to build these URLs. Ensure all components use these helpers instead of hardcoded strings.
-   **PNG vs JPG**: Story 7.1 introduced `.png` for Atomic Purple and Kiwi. The helper `getShellImageUrl` handles this logic.

### References
-   [Backend Asset Config](file:///home/julien/dev/gameboy_builder/docs/architecture-backend.md)
-   [Story 7.1 Learnings](file:///home/julien/dev/gameboy_builder/_bmad-output/implementation-artifacts/7-1-migration-database-backend-assets.md)

## Dev Agent Record
 
 ### Agent Model Used
- Gemini 2.0 Flash (Antigravity)
 
 ### Completion Notes List
- Verified asset serving from backend via Playwright.
- Removed redundant directories: `frontend/public/images/{shells,screens,lenses}`.
- Updated `backend.js` documentation.
- All tests passing on Chromium.
 
 ### File List
- `frontend/src/api/backend.js`
- `frontend/tests/asset-serving.spec.js` (Updated selectors & portal bypass)
- `frontend/public/images/shells/` [DELETED]
- `frontend/public/images/screens/` [DELETED]
- `frontend/public/images/lenses/` [DELETED]
