# 🔥 CODE REVIEW FINDINGS — Story 5.1

**Date:** 2026-02-13  
**Story:** 5-1-mise-en-avant-des-options-sur-atelier-et-recap  
**Feature:** Mise en avant des options sur atelier et récap (Focus Options)  
**Reviewer:** AI Code Reviewer (Adversarial Mode)  
**Langue:** Français

---

## Git vs Story Discrepancies

**Fichiers modifiés selon la story (File List):**
- `frontend/src/App.vue` — Modifié ✅
- `frontend/src/components/SelectionRecap.vue` — Modifié ✅
- `frontend/tests/focus-options.spec.js` — Nouveau ✅
- `frontend/src/stores/configurator.js` — Aucune modification attendue

**Git reality:**
- `configurator.js` apparaît comme **modifié** (M) — les changements proviennent probablement de la story bouton-retour (resetConfig, etc.). La story 5.1 ne documente pas cette dépendance croisée.

**Discrepancy count:** 1 (documentation incomplète)

---

## Issues Found

**Total:** 2 High, 4 Medium, 2 Low

---

## 🔴 CRITICAL / HIGH ISSUES

### Issue #1: Tests ne couvrent pas le chemin "Atelier Libre" — AC #1 partiellement non implémenté

**Severity:** HIGH  
**File:** `frontend/tests/focus-options.spec.js`  
**AC concerné:** AC #1 — "Étant donné une configuration en cours (**pack ou atelier libre**)"

**Problème:**
Les trois tests E2E passent uniquement par le chemin **Starter Kits → Pack**. L’AC #1 exige que les options soient mises en avant pour une configuration en cours, que ce soit via pack **ou** atelier libre.

**Preuve:**
```javascript
// Tous les tests font:
await page.locator('text=STARTER KITS').click();
await page.locator('text=BUDGET GAMER').first().click();
```

**Impact:**
- Le comportement "Atelier Libre" (sans pack) n’est pas validé par les tests E2E
- Risque de régression si le chemin atelier libre se comporte différemment

**Fix requis:**
Ajouter au moins un test couvrant :
1. Clic sur "ATELIER LIBRE"
2. Attendre le chargement du catalogue
3. Vérifier que RECAP_VIEW est affiché par défaut
4. Vérifier que les options (coque, écran, vitre) sont mises en avant après sélection manuelle

---

### Issue #2: Nommage des tests source de confusion avec Story 4.x

**Severity:** HIGH  
**File:** `frontend/tests/focus-options.spec.js:79, 104, 125`

**Problème:**
Les tests sont nommés `'4.1 — ...'`, `'4.2 — ...'`, `'4.3 — ...'` alors qu’ils appartiennent à la **Story 5.1**. Cela prête à confusion avec la Story 4.1 (Signature Showcase).

**Code actuel:**
```javascript
test('4.1 — RECAP_VIEW est affiché par défaut...', ...);
test('4.2 — Les options (pack, coque, écran, vitre)...', ...);
test('4.3 — Basculement 3D_VIEW / RECAP_VIEW...', ...);
```

**Impact:**
- En cas de debug ou de tri par nom, on peut penser que ces tests concernent Story 4.x
- Mauvaise traçabilité avec la story

**Fix requis:**
Renommer en cohérence avec la Story 5.1 :
- `'5.1 AC#1 — RECAP_VIEW est affiché par défaut...'`
- `'5.1 AC#2 — Les options sont visibles et mises en avant...'`
- `'5.1 AC#3 — Basculement 3D_VIEW / RECAP_VIEW...'`

---

## 🟡 MEDIUM ISSUES

### Issue #3: Conflit mobile — bouton RETOUR vs toggle 3D/Recap

**Severity:** MEDIUM  
**Files:** `frontend/src/App.vue:269-277`, `frontend/src/App.vue:144-160`

**Problème:**
Les Dev Notes de la story indiquent : *"problème d'interaction sur mobile (bouton RETOUR intercepte les clics) - non bloquant"*. Le test 4.3 utilise `force: true` sur mobile pour contourner le problème, mais les utilisateurs réels n’ont pas ce contournement.

**Preuve:**
- Bouton RETOUR mobile : `fixed top-6 left-6 z-[60]` (ligne 270)
- Toggle 3D/Recap : `absolute top-6 left-1/2 -translate-x-1/2` (ligne 145)
- Sur petits écrans, les zones tactiles peuvent se chevaucher ou être trop proches

**Impact:**
- UX dégradée sur mobile : difficulté à basculer vers la vue 3D
- Le problème est connu mais non résolu

**Fix recommandé:**
- Ajuster le positionnement (ex. décaler le RETOUR vers le bas ou réduire sa taille)
- Ou ajouter un `data-testid` au toggle et documenter le workaround dans les tests

---

### Issue #4: configurator.js modifié mais non documenté dans la story

**Severity:** MEDIUM  
**File:** `_bmad-output/implementation-artifacts/5-1-mise-en-avant-des-options-sur-atelier-et-recap.md`

**Problème:**
La story indique « Aucune modification » pour `configurator.js`, alors que git signale des modifications. Ces changements viennent probablement de la story bouton-retour (retourPortail, resetConfig). La story 5.1 ne mentionne pas cette dépendance.

**Impact:**
- Traçabilité incomplète
- Difficile de savoir quels fichiers toucher lors d’un rollback ou d’une review

**Fix recommandé:**
Mettre à jour la section File List ou Dev Agent Record pour préciser : *"configurator.js — modifié par story bouton-retour (dépendance croisée), show3D déjà à false"*.

---

### Issue #5: Badge APERÇU_3D — contraste potentiellement insuffisant (NFR2)

**Severity:** MEDIUM  
**File:** `frontend/src/App.vue:196-199`

**Problème:**
L’AC #3 et les Dev Notes demandent le respect du design system et NFR2 (contraste WCAG AA). Le badge utilise `text-white/60` sur un fond glass (semi-transparent). Un contraste de 60 % peut ne pas atteindre 4.5:1 pour le texte normal.

**Code actuel:**
```html
<span class="text-[8px] font-retro text-white/60 tracking-widest uppercase">APERÇU_3D</span>
```

**Fix recommandé:**
Passer à `text-white/80` ou `text-white` pour améliorer le contraste, ou vérifier le ratio avec un outil comme axe DevTools.

---

### Issue #6: Tests — vérification de classes fragile

**Severity:** MEDIUM  
**File:** `frontend/tests/focus-options.spec.js:90, 96, 151, 160`

**Problème:**
Les tests vérifient la présence de classes Tailwind (`bg-neo-orange`, `bg-neo-purple`) via `expect(recapButtonClasses).toContain('bg-neo-orange')`. Si Tailwind optimise ou renomme les classes (ex. JIT), les tests peuvent casser sans changement fonctionnel.

**Recommandation:**
Préférer des vérifications visuelles ou sémantiques (ex. `aria-pressed`, `data-state`) plutôt que des classes CSS internes.

---

## 🟢 LOW ISSUES

### Issue #7: Documentation JSDoc absente

**Severity:** LOW  
**Files:** `frontend/src/App.vue`, `frontend/src/components/SelectionRecap.vue`

**Problème:**
Les modifications liées à la Story 5.1 (badge APERÇU_3D, hiérarchie visuelle) ne sont pas documentées par des commentaires JSDoc ou des blocs expliquant l’intention.

**Recommandation:**
Ajouter des commentaires courts pour le badge et les classes "Task 3.x - Story 5.1" déjà présentes, afin de faciliter la maintenance.

---

### Issue #8: État vide SelectionRecap — hiérarchie visuelle

**Severity:** LOW  
**File:** `frontend/src/components/SelectionRecap.vue:197-201`

**Problème:**
L’état vide utilise `opacity-40`. L’AC #1 indique que "la configuration soit l’élément principal". En l’absence de sélection, le message "NO SELECTION" pourrait être légèrement plus visible pour respecter la hiérarchie.

**Recommandation:**
Envisager `opacity-60` ou un style plus marqué pour garder une hiérarchie claire même à vide.

---

## 📋 VALIDATION DES AC ET TÂCHES

### Acceptance Criteria

| AC | Statut | Preuve |
|----|--------|--------|
| AC #1 — Options mises en avant (pack **ou** atelier libre) | PARTIAL | ✅ Pack path OK, ❌ Atelier libre non testé |
| AC #2 — RECAP_VIEW par défaut, 3D secondaire avec badge | IMPLEMENTED | show3D=false, badge APERÇU_3D présent |
| AC #3 — Pack, cartes, mods mis en avant, design system | IMPLEMENTED | border-2, shadow-neo, gap-8 respectés |

### Tasks

| Task | Statut | Preuve |
|------|--------|--------|
| Task 1 — RECAP par défaut | DONE | configurator.js:16 show3D = false |
| Task 2.1 — Badge 3D secondaire | DONE | App.vue:194-200, data-testid="3d-preview-badge" |
| Task 2.2 — Réduire surface 3D | OPTIONAL | Non implémenté (optionnel) |
| Task 3 — Hiérarchie visuelle | DONE | SelectionRecap: pack badge, cartes, mods renforcés |
| Task 4 — Tests E2E | PARTIAL | Tests présents mais sans chemin Atelier Libre |

---

## 📋 SUMMARY

### Issues par sévérité
- **HIGH:** 2 (à corriger avant passage en done)
- **MEDIUM:** 4 (recommandé de corriger)
- **LOW:** 2 (amélioration qualité)

### Parcours de correction recommandé
1. **Priorité 1:** Issue #1 — Ajouter test chemin Atelier Libre
2. **Priorité 2:** Issue #2 — Renommer les tests 4.x → 5.1
3. **Priorité 3:** Issue #3 — Traiter ou documenter le conflit mobile RETOUR / toggle
4. **Priorité 4:** Issue #4 — Mettre à jour la story (configurator.js)
5. **Priorité 5:** Issues #5, #6 — Contraste et robustesse des tests
6. **Backlog:** Issues #7, #8 — Documentation et état vide

---

## ✅ CORRECTIONS APPLIQUÉES (2026-02-13)

- **Issue #1** — Test chemin Atelier Libre ajouté ✅
- **Issue #2** — Tests renommés 5.1 AC#1/2/3 ✅
- **Issue #3** — Toggle top-16 sur mobile + data-testid pour sélecteurs robustes ✅
- **Issue #4** — Story documentée (configurator.js dépendance) ✅
- **Issue #5** — Badge contraste text-white/90 ✅
- **Issue #6** — Tests aria-pressed + data-testid (btn-recap-view, btn-3d-view) ✅
- **Issue #7** — JSDoc retourPortail ✅
- **Issue #8** — État vide opacity-70, data-testid="recap-empty-state" ✅

**Tests E2E :** 4 passed (chromium)

Choisissez [1], [2], ou précisez l’issue à traiter en priorité.
