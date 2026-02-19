// @ts-check
import { test, expect } from '@playwright/test';

test('Parcours utilisateur complet', async ({ page }) => {
  const pseudo = `testuser_${Date.now()}`;
  const password = 'TestPassword123!';
  const newPassword = 'NewPassword456!';
  const nom = 'TestNom';
  const prenom = 'TestPrenom';

  // Inscription
  await page.goto('http://localhost:3000/register');
  await page.getByLabel('Pseudo *', { exact: true }).fill(pseudo);
  await page.getByLabel('Mot de passe *', { exact: true }).fill(password);
  await page.getByLabel('Confirmer le mot de passe *', { exact: true }).fill(password);
  await page.getByLabel('Nom *', { exact: true }).fill(nom);
  await page.getByLabel('Prénom *', { exact: true }).fill(prenom);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/$/);

  // Aller sur le profil
  await page.goto('http://localhost:3000/profile');
  await expect(page.getByRole('heading', { name: 'Mon Profil' })).toBeVisible();
  await expect(page.getByText(pseudo)).toBeVisible(); // Vérifier que le pseudo s'affiche

  // Déconnexion
  await page.click('button:has-text("Déconnexion")');
  await expect(page).toHaveURL(/\/$/);

  // Connexion
  await page.goto('http://localhost:3000/login');
  await page.getByLabel('Pseudo', { exact: true }).fill(pseudo);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/$/);

  // Aller sur le profil et modifier le profil
  await page.goto('http://localhost:3000/profile');
  await page.click('button:has-text("Modifier")');
  await expect(page).toHaveURL(/\/profile\/edit/);
  await page.locator('input[type="text"]').first().fill(`${pseudo}_modif`);
  await page.click('button[type="submit"]:has-text("Enregistrer les modifications")');
  
  // Attendre que la redirection vers /profile soit complète
  await expect(page).toHaveURL(/\/profile$/);
  await page.waitForTimeout(1000); // Attendre que la mise à jour backend soit terminée

  // Déconnexion
  await page.goto('http://localhost:3000/profile');
  await page.click('button:has-text("Déconnexion")');
  await expect(page).toHaveURL(/\/$/);

  // Connexion avec le pseudo modifié (même mot de passe)
  await page.goto('http://localhost:3000/login');
  await page.getByLabel('Pseudo', { exact: true }).fill(`${pseudo}_modif`);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.click('button[type="submit"]');
  
  // Attendre la redirection avec un timeout plus long et vérifier qu'il n'y a pas d'erreur
  await page.waitForTimeout(2000); // Attendre que la requête de login soit traitée
  
  // Vérifier qu'aucun message d'erreur n'est affiché
  const errorMessage = page.locator('.bg-red-100');
  if (await errorMessage.isVisible()) {
    const errorText = await errorMessage.textContent();
    throw new Error(`Erreur de connexion: ${errorText}`);
  }
  
  await expect(page).toHaveURL(/\/$/, { timeout: 10000 });

  // Déconnexion finale
  await page.goto('http://localhost:3000/profile');
  await page.click('button:has-text("Déconnexion")');
  await expect(page).toHaveURL(/\/$/);
});