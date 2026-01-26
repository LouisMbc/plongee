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
  await expect(page.locator('h1')).toContainText('Mon Profil');
  await expect(page.locator('span')).toContainText(pseudo);

  // Déconnexion
  await page.click('button:has-text("Déconnexion")');
  await expect(page).toHaveURL(/\/login/);

  // Connexion
  await page.goto('http://localhost:3000/login');
  await page.getByLabel('Pseudo', { exact: true }).fill(pseudo);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/$/);

  // Aller sur le profil et modifier le profil
  await page.goto('http://localhost:3000/profile');
  await page.click('button:has-text("Modifier mon profil")');
  await expect(page).toHaveURL(/\/profile\/edit/);
  await page.getByLabel('Pseudo *', { exact: true }).fill(`${pseudo}_modif`);
  await page.click('button[type="submit"]:has-text("Enregistrer les modifications")');
  await expect(page.getByLabel('Pseudo *', { exact: true })).toHaveValue(`${pseudo}_modif`);

  // Modifier le mot de passe
  await page.click('button:has-text("Modifier le mot de passe")');
  await page.getByLabel('Mot de passe actuel *', { exact: true }).fill(password);
  await page.getByLabel('Nouveau mot de passe *', { exact: true }).fill(newPassword);
  await page.getByLabel('Confirmer le nouveau mot de passe *', { exact: true }).fill(newPassword);
  await page.click('button[type="submit"]:has-text("Modifier le mot de passe")');
  await expect(page.locator('text=Mot de passe modifié avec succès')).toBeVisible();

  // Déconnexion
  await page.click('button:has-text("Déconnexion")');
  await expect(page).toHaveURL(/\/login/);

  // Connexion avec le nouveau mot de passe
  await page.getByLabel('Pseudo', { exact: true }).fill(`${pseudo}_modif`);
  await page.getByLabel('Mot de passe', { exact: true }).fill(newPassword);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/$/);

  // Aller sur la liste des poissons
  await page.goto('http://localhost:3000/poissons');
  await expect(page.locator('.poisson-card')).toHaveCountGreaterThan(0);

  // Créer une plongée
  await page.goto('http://localhost:3000/plongees/new');
  await page.fill('input[placeholder="Ex: Plongée à la Grotte Bleue"]', 'Plongée Test');
  await page.fill('textarea[placeholder="Décrivez votre plongée..."]', 'Test plongée');
  await page.fill('input[type="datetime-local"]', '2024-06-01T10:00');
  await page.selectOption('select', { label: 'Exploration' });
  await page.fill('input[placeholder="Ex: 25"]', '20');
  await page.fill('input[placeholder="Ex: 45"]', '40');
  await page.fill('input[placeholder="Ex: Marseille, Calanques"]', 'Nice');
  await page.click('button[type="submit"]:has-text("Suivant")');
  await expect(page).toHaveURL(/\/plongees\/\d+\/especes/);

  // Déconnexion finale
  await page.click('button:has-text("Déconnexion")');
  await expect(page).toHaveURL(/\/login/);
});