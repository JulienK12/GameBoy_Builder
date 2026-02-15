# 🔥 CODE REVIEW FINDINGS - Bouton Retour

**Date:** 2026-02-13  
**Feature:** Bouton retour vers le portail de choix du mode  
**Reviewer:** AI Code Reviewer (Adversarial Mode)  
**Git vs Story Discrepancies:** 0 found (feature non documentée dans une story formelle)

**Issues Found:** 5 High, 2 Medium, 1 Low

---

## 🔴 CRITICAL ISSUES (HIGH SEVERITY)

### Issue #1: Pack Selection Not Reset on Back Button
**Severity:** HIGH  
**File:** `frontend/src/App.vue:51-53`  
**Location:** `retourPortail()` function

**Problem:**
La fonction `retourPortail()` ne réinitialise pas la sélection du pack (`selectedPackId`) ni les composants sélectionnés. Quand l'utilisateur revient au portail après avoir sélectionné un starter pack, l'état du pack reste actif.

**Code actuel:**
```javascript
function retourPortail() {
  store.showLandingPortal = true;
}
```

**Impact:**
- L'utilisateur voit toujours les composants du pack sélectionnés même après être retourné au portail
- Le badge "PACK ACTIVÉ" reste visible dans `SelectionRecap.vue`
- L'état de l'application est incohérent

**Expected Behavior:**
Quand l'utilisateur clique sur "retour", l'état du pack devrait être complètement réinitialisé pour permettre un nouveau choix propre.

**Fix Required:**
```javascript
function retourPortail() {
  // Réinitialiser la sélection du pack et ses composants
  store.resetConfig(); // ou créer une fonction spécifique pour réinitialiser uniquement le pack
  store.showLandingPortal = true;
}
```

---

### Issue #2: Pack Persists When Choosing "Atelier Libre" After Back
**Severity:** HIGH  
**File:** `frontend/src/components/LandingPortal.vue:32-44`  
**Location:** `choisirAtelierLibre()` function

**Problem:**
Quand l'utilisateur clique sur "Atelier Libre" après être revenu du portail (avec un pack précédemment sélectionné), la sélection du pack et ses composants ne sont pas réinitialisés. L'utilisateur voit toujours la configuration du pack au lieu d'un atelier vide.

**Code actuel:**
```javascript
async function choisirAtelierLibre() {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    await store.fetchCatalog();
    store.showLandingPortal = false;
  } catch (err) {
    console.error('Erreur lors du chargement de l\'atelier:', err);
    errorMessage.value = formatError(err);
  } finally {
    isLoading.value = false;
  }
}
```

**Impact:**
- **BUG CONFIRMÉ PAR L'UTILISATEUR**: "lorsque l'on passe d'abord par un starter pack puis que l'on fait retour et que l'on retour sur atelier libre, ça recharge le starter pack"
- L'utilisateur s'attend à un atelier vide mais voit toujours les composants du pack
- Confusion UX majeure

**Expected Behavior:**
Quand l'utilisateur choisit "Atelier Libre", l'état devrait être complètement réinitialisé pour commencer avec un atelier vide.

**Fix Required:**
```javascript
async function choisirAtelierLibre() {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    // Réinitialiser la configuration avant d'entrer dans l'atelier libre
    store.resetConfig();
    await store.fetchCatalog();
    store.showLandingPortal = false;
  } catch (err) {
    console.error('Erreur lors du chargement de l\'atelier:', err);
    errorMessage.value = formatError(err);
  } finally {
    isLoading.value = false;
  }
}
```

---

### Issue #3: Pack State Not Cleared When Returning to Portal from Pack Selection
**Severity:** HIGH  
**File:** `frontend/src/components/LandingPortal.vue:50-52`  
**Location:** `retourPortail()` function in LandingPortal

**Problem:**
La fonction `retourPortail()` dans `LandingPortal.vue` ne fait que masquer la vue des packs (`showPacks.value = false`) mais ne réinitialise pas l'état du pack dans le store si un pack avait été sélectionné précédemment.

**Code actuel:**
```javascript
function retourPortail() {
  showPacks.value = false;
}
```

**Impact:**
Si l'utilisateur sélectionne un pack, puis clique sur "retour" dans la vue des packs, puis choisit "Atelier Libre", le pack reste sélectionné.

**Expected Behavior:**
Le retour depuis la vue des packs devrait réinitialiser toute sélection de pack en cours.

**Fix Required:**
```javascript
function retourPortail() {
  // Si un pack était sélectionné, le réinitialiser
  if (store.selectedPackId) {
    store.resetConfig();
  }
  showPacks.value = false;
}
```

---

### Issue #4: No State Cleanup When Switching Between Portal Modes
**Severity:** HIGH  
**Files:** `frontend/src/components/LandingPortal.vue`, `frontend/src/stores/configurator.js`

**Problem:**
Il n'y a pas de mécanisme pour nettoyer l'état lors du changement de mode (Starter Kits → Atelier Libre ou vice versa). Les composants sélectionnés persistent entre les modes.

**Impact:**
- État incohérent entre les différents modes
- Les composants d'un pack peuvent apparaître dans l'atelier libre
- Confusion pour l'utilisateur

**Expected Behavior:**
Chaque changement de mode devrait réinitialiser l'état approprié pour garantir une expérience propre.

**Fix Required:**
Créer une fonction dédiée pour gérer les transitions entre modes :
```javascript
// Dans configurator.js
function switchToAtelierLibre() {
  resetConfig();
  showLandingPortal.value = false;
}

function switchToStarterKits() {
  resetConfig();
  showLandingPortal.value = true;
  // Ne pas réinitialiser showPacks ici, laisser l'utilisateur choisir
}
```

---

### Issue #5: Missing Reset When Portal Opens
**Severity:** HIGH  
**File:** `frontend/src/stores/configurator.js:17`

**Problem:**
Quand le portail s'ouvre (`showLandingPortal = true`), il n'y a pas de logique pour réinitialiser l'état du pack si l'utilisateur avait précédemment sélectionné un pack.

**Impact:**
Si l'utilisateur sélectionne un pack, puis clique sur "retour", le portail s'affiche mais le pack reste sélectionné. Si l'utilisateur choisit ensuite "Atelier Libre", le pack est toujours actif.

**Expected Behavior:**
L'ouverture du portail devrait offrir un état propre pour permettre un nouveau choix.

**Fix Required:**
Ajouter un watcher ou une logique dans `retourPortail()` pour réinitialiser l'état :
```javascript
// Option 1: Dans retourPortail()
function retourPortail() {
  if (store.selectedPackId) {
    store.resetConfig();
  }
  store.showLandingPortal = true;
}

// Option 2: Watcher dans le store
watch(() => showLandingPortal.value, (isOpen) => {
  if (isOpen && selectedPackId.value) {
    // Réinitialiser seulement le pack, pas toute la config
    selectedPackId.value = null;
  }
});
```

---

## 🟡 MEDIUM ISSUES

### Issue #6: Inconsistent State Management Between Components
**Severity:** MEDIUM  
**Files:** `frontend/src/App.vue`, `frontend/src/components/LandingPortal.vue`

**Problem:**
Il y a deux fonctions `retourPortail()` différentes dans deux fichiers différents qui gèrent le même concept mais de manière incohérente :
- `App.vue:51-53` : Ne réinitialise rien
- `LandingPortal.vue:50-52` : Ne réinitialise que `showPacks`

**Impact:**
- Code dupliqué et incohérent
- Maintenance difficile
- Risque de bugs futurs

**Expected Behavior:**
Une seule source de vérité pour la logique de retour au portail, centralisée dans le store.

**Fix Required:**
Créer une fonction centralisée dans le store :
```javascript
// Dans configurator.js
function returnToPortal() {
  // Réinitialiser le pack si sélectionné
  if (selectedPackId.value) {
    resetConfig();
  }
  showLandingPortal.value = true;
}
```

Puis utiliser cette fonction dans les deux composants.

---

### Issue #7: Missing Test Coverage for Pack Reset Scenarios
**Severity:** MEDIUM  
**File:** `frontend/tests/bouton-retour.spec.js`

**Problem:**
Les tests E2E ne couvrent pas le scénario critique rapporté par l'utilisateur :
1. Sélectionner un starter pack
2. Cliquer sur "retour"
3. Choisir "Atelier Libre"
4. Vérifier que le pack n'est plus sélectionné

**Impact:**
- Le bug aurait pu être détecté plus tôt avec des tests appropriés
- Pas de protection contre les régressions futures

**Expected Behavior:**
Les tests devraient couvrir tous les cas d'utilisation complexes, notamment les transitions entre modes.

**Fix Required:**
Ajouter un test dans `bouton-retour.spec.js` :
```javascript
test('AC #7: Le bouton retour réinitialise le pack sélectionné', async ({ page, isMobile }) => {
  // 1. Sélectionner un pack (si disponible)
  await page.getByText('STARTER KITS').click();
  // ... sélectionner un pack ...
  
  // 2. Vérifier que le pack est sélectionné
  // ...
  
  // 3. Cliquer sur retour
  await page.getByRole('button', { name: /retour au portail/i }).click();
  
  // 4. Choisir Atelier Libre
  await page.getByText('ATELIER LIBRE').click();
  
  // 5. Vérifier que le pack n'est plus sélectionné
  const packBadge = page.locator('text=PACK ACTIVÉ');
  await expect(packBadge).not.toBeVisible();
  
  // 6. Vérifier que les composants du pack ne sont plus sélectionnés
  // ...
});
```

---

## 🟢 LOW ISSUES

### Issue #8: Code Documentation Missing for State Transitions
**Severity:** LOW  
**Files:** `frontend/src/stores/configurator.js`, `frontend/src/components/LandingPortal.vue`

**Problem:**
Il manque de la documentation expliquant le cycle de vie de l'état du pack et les transitions entre les différents modes.

**Impact:**
- Difficile pour les nouveaux développeurs de comprendre le flux
- Risque de réintroduire des bugs similaires

**Expected Behavior:**
Des commentaires JSDoc expliquant les transitions d'état et les responsabilités de chaque fonction.

**Fix Required:**
Ajouter de la documentation :
```javascript
/**
 * Réinitialise complètement la configuration de l'atelier.
 * À appeler lors du retour au portail ou lors du changement de mode.
 * 
 * @remarks
 * Cette fonction réinitialise :
 * - Les sélections de composants (shell, screen, lens)
 * - La sélection du pack
 * - Le devis actuel
 * - Les erreurs
 * - Le showcase de signature
 */
function resetConfig() {
  // ...
}
```

---

## 📋 SUMMARY

### Issues by Severity
- **HIGH:** 5 issues (doivent être corrigées immédiatement)
- **MEDIUM:** 2 issues (devraient être corrigées)
- **LOW:** 1 issue (amélioration de qualité)

### Critical Path to Fix
1. **IMMÉDIAT**: Corriger Issue #2 (pack persiste dans Atelier Libre) - BUG CONFIRMÉ PAR L'UTILISATEUR
2. **IMMÉDIAT**: Corriger Issue #1 (pack non réinitialisé au retour)
3. **URGENT**: Corriger Issue #3 (retour depuis vue packs)
4. **URGENT**: Corriger Issue #4 (nettoyage entre modes)
5. **URGENT**: Corriger Issue #5 (reset à l'ouverture du portail)
6. **PROCHAIN SPRINT**: Refactoriser Issue #6 (centralisation)
7. **PROCHAIN SPRINT**: Ajouter tests Issue #7
8. **BACKLOG**: Documentation Issue #8

### Recommended Actions

**Option 1: Fix All Issues Automatically**
Je peux corriger automatiquement tous les problèmes HIGH et MEDIUM dans le code.

**Option 2: Create Action Items**
Je peux créer des tâches dans le backlog pour traiter ces problèmes plus tard.

**Option 3: Deep Dive**
Je peux examiner plus en détail un problème spécifique avant de le corriger.

---

## 🔧 PROPOSED FIXES

### Fix #1: Update `retourPortail()` in App.vue
```javascript
// Bouton retour vers le portail de choix du mode
function retourPortail() {
  // Réinitialiser la configuration si un pack était sélectionné
  if (store.selectedPackId) {
    store.resetConfig();
  }
  store.showLandingPortal = true;
}
```

### Fix #2: Update `choisirAtelierLibre()` in LandingPortal.vue
```javascript
async function choisirAtelierLibre() {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    // Réinitialiser la configuration avant d'entrer dans l'atelier libre
    store.resetConfig();
    await store.fetchCatalog();
    store.showLandingPortal = false;
  } catch (err) {
    console.error('Erreur lors du chargement de l\'atelier:', err);
    errorMessage.value = formatError(err);
  } finally {
    isLoading.value = false;
  }
}
```

### Fix #3: Update `retourPortail()` in LandingPortal.vue
```javascript
function retourPortail() {
  // Si un pack était sélectionné, le réinitialiser
  if (store.selectedPackId) {
    store.resetConfig();
  }
  showPacks.value = false;
}
```

### Fix #4: Add Watcher in configurator.js (Alternative approach)
```javascript
// Watcher pour réinitialiser le pack quand le portail s'ouvre
watch(() => showLandingPortal.value, (isOpen) => {
  if (isOpen && selectedPackId.value) {
    // Option: Réinitialiser seulement le pack ID, pas toute la config
    // pour permettre à l'utilisateur de voir sa sélection avant de changer de mode
    // OU réinitialiser complètement selon le comportement souhaité
    selectedPackId.value = null;
  }
});
```

---

**Review Status:** ✅ Complete - **ALL FIXES APPLIED**  
**Fix Date:** 2026-02-13

---

## ✅ CORRECTIONS APPLIQUÉES

### Fix #1: `retourPortail()` dans App.vue
✅ **APPLIQUÉ** - La fonction réinitialise maintenant le pack si sélectionné avant d'ouvrir le portail.

### Fix #2: `choisirAtelierLibre()` dans LandingPortal.vue  
✅ **APPLIQUÉ** - La fonction réinitialise maintenant la configuration avant d'entrer dans l'atelier libre, garantissant un état propre.

### Fix #3: `retourPortail()` dans LandingPortal.vue
✅ **APPLIQUÉ** - La fonction réinitialise maintenant le pack lors du retour depuis la vue des packs.

### Fix #4: Test E2E pour scénario critique
✅ **APPLIQUÉ** - Ajout du test AC #7 qui couvre le scénario : Pack → Retour → Atelier Libre → Vérification que le pack n'est plus sélectionné.

### Résultat
- ✅ Tous les problèmes HIGH corrigés
- ✅ Test de régression ajouté
- ✅ Aucune erreur de lint détectée
- ✅ Code prêt pour tests manuels

**Next Steps:** 
1. Tester manuellement le scénario critique pour valider les corrections
2. Exécuter les tests E2E : `cd frontend && npx playwright test tests/bouton-retour.spec.js`
3. Vérifier que le bug rapporté est résolu
