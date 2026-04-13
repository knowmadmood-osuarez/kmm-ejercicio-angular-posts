import { test, expect, Page } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Login as alice and wait for redirect to /posts. */
async function loginAsAlice(page: Page): Promise<void> {
  await page.goto('/login');
  // Wait for Angular hydration — "Bienvenido" heading confirms app is ready
  await expect(page.getByText('Bienvenido')).toBeVisible({ timeout: 15000 });

  // Target native inputs directly to avoid duplicate-id ambiguity with app-input host
  await page.locator('input[name="name"]').fill('alice');
  await page.locator('input[name="password"]').fill('alice123');

  // Wait for Signal Form validation to enable the button
  const submitBtn = page.getByRole('button', { name: 'Acceder' });
  await expect(submitBtn).toBeEnabled({ timeout: 5000 });
  await submitBtn.click();
  await page.waitForURL('**/posts', { timeout: 15000 });
}

/** Navigate to the first post detail from the list. */
async function goToFirstPostDetail(page: Page): Promise<void> {
  // Target only links inside post cards (excludes FAB /posts/new)
  const postCard = page.locator('app-post-card a').first();
  await expect(postCard).toBeVisible({ timeout: 10000 });
  await postCard.click();
  await page.waitForURL(/\/posts\/[\w-]+$/, { timeout: 10000 });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Auth flow', () => {
  test('should redirect to /login when not authenticated', async ({ page }) => {
    await page.goto('/posts');
    await page.waitForURL('**/login');
    await expect(page.getByText('Bienvenido')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Bienvenido')).toBeVisible({ timeout: 15000 });

    await page.locator('input[name="name"]').fill('alice');
    await page.locator('input[name="password"]').fill('wrongpassword');

    const submitBtn = page.getByRole('button', { name: 'Acceder' });
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();

    await expect(page.getByRole('alert')).toContainText('Credenciales inválidas');
  });

  test('should login successfully and show posts list', async ({ page }) => {
    await loginAsAlice(page);
    await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible();
  });

  test('should logout and redirect to /login', async ({ page }) => {
    await loginAsAlice(page);
    await page.getByLabel('Cerrar sesión').click();
    await page.waitForURL('**/login');
    await expect(page.getByText('Bienvenido')).toBeVisible();
  });
});

test.describe('Posts list', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAlice(page);
  });

  test('should display post cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible();
    const firstPost = page.locator('app-post-card a').first();
    await expect(firstPost).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to post detail on card click', async ({ page }) => {
    await goToFirstPostDetail(page);
    await expect(page.getByText('Volver')).toBeVisible();
  });
});

test.describe('Post CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAlice(page);
  });

  test('should create a new post', async ({ page }) => {
    // Navigate to new post form via FAB
    await page.locator('a[href="/posts/new"]').click();
    await page.waitForURL('**/posts/new');

    const uniqueTitle = `E2E Test Post ${Date.now()}`;

    // Fill form — target native inputs inside the custom components
    await page.locator('input[name="title"]').fill(uniqueTitle);
    await page
      .locator('textarea[name="body"]')
      .fill('Este es el contenido del post creado por Playwright para testing automatizado.');
    await page.locator('input[name="tags"]').fill('e2e, playwright');

    const saveBtn = page.getByRole('button', { name: 'Guardar' });
    await expect(saveBtn).toBeEnabled({ timeout: 5000 });
    await saveBtn.click();

    // After create, the app navigates to /posts (list)
    await page.waitForURL('**/posts', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible();
  });

  test('should navigate to edit and update own post', async ({ page }) => {
    // First: create a post
    await page.locator('a[href="/posts/new"]').click();
    await page.waitForURL('**/posts/new');

    const editTitle = `Editable Post ${Date.now()}`;
    await page.locator('input[name="title"]').fill(editTitle);
    await page
      .locator('textarea[name="body"]')
      .fill('Contenido original del post para testing de edición completa.');

    const saveBtn = page.getByRole('button', { name: 'Guardar' });
    await expect(saveBtn).toBeEnabled({ timeout: 5000 });
    await saveBtn.click();

    // After create, we're at /posts. Navigate to the post we just created (first in the list)
    await page.waitForURL('**/posts', { timeout: 10000 });
    await goToFirstPostDetail(page);

    // Should see "Editar post" button (alice owns this post)
    await expect(page.getByRole('button', { name: 'Editar post' })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('button', { name: 'Editar post' }).click();
    await page.waitForURL(/\/posts\/[\w-]+\/edit/, { timeout: 10000 });

    // Update the title
    const updatedTitle = `${editTitle} (updated)`;
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.fill(updatedTitle);

    const saveEditBtn = page.getByRole('button', { name: 'Guardar' });
    await expect(saveEditBtn).toBeEnabled({ timeout: 5000 });
    await saveEditBtn.click();

    // After edit, navigates to /posts (list)
    await page.waitForURL('**/posts', { timeout: 10000 });
  });

  test('should delete own post', async ({ page }) => {
    // First: create a post
    await page.locator('a[href="/posts/new"]').click();
    await page.waitForURL('**/posts/new');

    const deleteTitle = `Deletable Post ${Date.now()}`;
    await page.locator('input[name="title"]').fill(deleteTitle);
    await page
      .locator('textarea[name="body"]')
      .fill('Este post será eliminado durante la prueba e2e automatizada.');

    const saveBtn = page.getByRole('button', { name: 'Guardar' });
    await expect(saveBtn).toBeEnabled({ timeout: 5000 });
    await saveBtn.click();

    // After create, we're at /posts. Navigate to the post (first in list, sorted by newest)
    await page.waitForURL('**/posts', { timeout: 10000 });
    await goToFirstPostDetail(page);

    // Click delete
    await expect(page.getByRole('button', { name: 'Eliminar post' })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('button', { name: 'Eliminar post' }).click();

    // Confirm in dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Confirmar' }).click();

    // Should navigate back to posts list
    await page.waitForURL('**/posts', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible();
  });
});

test.describe('Comments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAlice(page);
  });

  test('should add a comment to a post', async ({ page }) => {
    await goToFirstPostDetail(page);

    // Scroll down to trigger @defer for comments section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for the comment form to appear (it's always at the bottom of the section)
    const commentTextarea = page.locator('textarea[name="body"]');
    await expect(commentTextarea).toBeVisible({ timeout: 15000 });

    const commentBody = `E2E comment ${Date.now()}`;
    await commentTextarea.fill(commentBody);

    const publishBtn = page.getByRole('button', { name: 'Publicar comentario' });
    await expect(publishBtn).toBeEnabled({ timeout: 5000 });
    await publishBtn.click();

    // Comment should appear in the list
    await expect(page.getByText(commentBody)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Ownership protection', () => {
  test('should not show edit/delete on posts by other users', async ({ page }) => {
    await loginAsAlice(page);
    // Post 2 belongs to bruno (userId 2), alice is userId 1
    await page.goto('/posts/2');
    await expect(page.getByText('Volver')).toBeVisible({ timeout: 10000 });

    // Edit/delete buttons should NOT be visible for another user's post
    await expect(page.getByRole('button', { name: 'Editar post' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Eliminar post' })).not.toBeVisible();
  });

  test('should block direct navigation to edit another user post', async ({ page }) => {
    await loginAsAlice(page);
    // Post 2 belongs to bruno — postOwnerGuard redirects to /posts/2 (detail)
    await page.goto('/posts/2/edit');

    // Guard redirects to the detail page of the post (not edit)
    await page.waitForURL('**/posts/2', { timeout: 10000 });
    await expect(page.getByText('Volver')).toBeVisible();
    // Confirm we're NOT on the edit page
    await expect(page.getByRole('button', { name: 'Editar post' })).not.toBeVisible();
  });
});

test.describe('i18n', () => {
  test('should switch language to English', async ({ page }) => {
    await loginAsAlice(page);

    // The language switcher uses role="radio" buttons with lang codes
    const enRadio = page.getByRole('radio', { name: 'en' });
    await expect(enRadio).toBeVisible({ timeout: 5000 });
    await enRadio.click();

    // After switching to English, verify a translated element changed
    // The "Nuevo post" FAB should now say "New post"
    await expect(page.locator('a[href="/posts/new"]')).toContainText('New post', {
      timeout: 5000,
    });
  });
});
