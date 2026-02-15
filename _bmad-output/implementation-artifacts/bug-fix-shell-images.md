# Bug Fix: Display OEM Shell Images

Status: done

## Story
As a User,
I want to see the correct images for OEM shells in the configurator,
So that I can select the appearance I want.

## Acceptance Criteria
1. **Given** the configurator is loaded,
   **When** I view the list of shells,
   **Then** the OEM shell images (e.g., Atomic Purple, Grape) should be displayed, not broken links.

2. **Given** the backend serves images from `/assets/images/shells/`,
   **When** the frontend requests an image,
   **Then** the URL should be absolute (pointing to the backend port 3000) or correctly proxied, not relative to the frontend port 5173.

## tasks
- [x] **Database Fix**
  - [x] Create migration to prepend `/assets` to OEM shell image URLs in `shell_variants` table.
- [x] **Frontend Fix**
  - [x] Update `formatImageUrl` in `frontend/src/api/backend.js` to prepend `API_URL` to relative paths.

## Dev Agent Record
- **File List**:
  - `migrations/016_fix_oem_shell_paths.sql`
  - `frontend/src/api/backend.js`
