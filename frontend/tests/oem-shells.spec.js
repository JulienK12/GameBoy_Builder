import { test, expect } from '@playwright/test';

test('Display OEM Shell Images', async ({ page }) => {
    // 1. Go to the homepage
    await page.goto('/');

    // 2. Wait for the catalog to load (selector for the gallery grid or similar)
    // We can wait for a specific element that appears when the catalog is loaded.
    // Based on VariantGallery.vue, we can look for ".glass-card" or similar elements.
    // Or better, wait for the network request to complete if possible, but UI element is safer.
    await page.waitForSelector('[data-variant-id]', { state: 'visible', timeout: 30000 });

    // 3. Filter by "Shell" category (it should be the default, but let's be safe)
    // Assuming there's a way to select the category if it's not default.
    // For now, let's assume default is Shells.

    // 4. Filter by "Marque" -> "Nintendo" (or equiv for OEM) if necessary,
    // or just look for any OEM shell.
    // In VariantGallery.vue, brands are computed.
    // Let's filter by clicking the "Marque" filter if possible, or just scrolling.
    // Actually, let's just look for a specific known OEM ID or name.
    // Migration 016 used IDs like 'VAR_SHELL_GBC_OEM_GRAPE'.

    // Find the element for the Grape shell
    // Find the element for the Grape shell (Desktop Grid View)
    // We select the one that has 'flex-col' class which distinguishes it from the mobile 'w-[100px]' one
    const grapeShellCard = page.locator('div.flex-col[data-variant-id="VAR_SHELL_GBC_OEM_GRAPE"]');
    await expect(grapeShellCard).toBeVisible();

    // 5. Check the image inside the card
    const image = grapeShellCard.locator('img');
    await expect(image).toBeVisible();

    // Get the src attribute
    const src = await image.getAttribute('src');
    console.log('Image SRC:', src);

    // Verify it contains the correct path structure
    expect(src).toContain('/assets/images/shells/');

    // Verify it's an absolute URL (starts with http) to ensure it's pointing to backend
    expect(src).toMatch(/^http/);

    // 6. Verify the image actually loads (naturalWidth > 0)
    // We can use evaluate to check the DOM property
    const isLoaded = await image.evaluate((img) => {
        return img.complete && img.naturalWidth > 0;
    });

    expect(isLoaded).toBe(true);
});
