# Test Automation Summary - Bouton Retour

**Date:** 2026-02-13  
**Feature:** Bouton retour vers le portail de choix du mode  
**Backlog Item:** #2

## Tests Générés

### E2E Tests (Playwright)

- [x] `frontend/tests/bouton-retour.spec.js` - Tests E2E complets pour le bouton retour

**6 tests couvrant les critères d'acceptation :**

1. **AC #1:** Le bouton retour est visible dans l'atelier (mode expert) - Desktop uniquement
   - Vérifie que le bouton apparaît après avoir cliqué sur "ATELIER LIBRE"
   - Skip automatique sur mobile (header caché avec `hidden lg:block`)

2. **AC #2:** Le bouton retour n'est pas visible sur le LandingPortal
   - Vérifie que le bouton n'apparaît pas quand le portail est affiché

3. **AC #3:** Le clic sur le bouton retour affiche le LandingPortal - Desktop uniquement
   - Teste la navigation complète : atelier → bouton retour → portail
   - Vérifie que les options du portail sont visibles après le retour

4. **AC #4:** Le bouton retour fonctionne depuis l'atelier avec un pack sélectionné - Desktop uniquement
   - Teste le retour même après avoir sélectionné des composants

5. **AC #5:** Le bouton retour est accessible (aria-label présent) - Desktop uniquement
   - Vérifie la présence de l'attribut `aria-label` pour l'accessibilité

6. **AC #6:** Le bouton retour est caché sur mobile (responsive)
   - Confirme que le bouton n'est pas visible sur mobile (comportement attendu)

## Coverage

- **UI Features:** 1/1 couvert (bouton retour)
- **Critères d'acceptation:** 6/6 couverts
- **Responsive:** Testé (desktop + mobile)
- **Accessibilité:** Testé (aria-label)

## Patterns Utilisés

- **Framework:** Playwright (standard du projet)
- **Mocking:** API calls mockées (catalog, quote, expert-mods)
- **Locators:** Utilisation de `getByRole` et `getByText` (semantic locators)
- **Skip conditionnel:** Utilisation de `test.skip(isMobile)` pour les tests desktop-only

## Résultats Attendus

Tous les tests devraient passer une fois le serveur de développement démarré (`npm run dev`).

**Pour exécuter les tests :**
```bash
cd frontend
npm run dev  # Dans un terminal séparé
npx playwright test tests/bouton-retour.spec.js
```

## Notes

- Les tests desktop-only utilisent `test.skip(isMobile)` pour éviter les échecs sur mobile où le header est caché
- Le test AC #6 vérifie explicitement que le bouton est caché sur mobile (comportement attendu)
- Tous les tests utilisent des mocks pour éviter les dépendances au backend réel

## Next Steps

- ✅ Tests générés et prêts à être exécutés
- ⏳ Exécuter les tests une fois le serveur démarré
- ⏳ Ajouter aux tests CI/CD si nécessaire
- ✅ Coverage complète des critères d'acceptation
