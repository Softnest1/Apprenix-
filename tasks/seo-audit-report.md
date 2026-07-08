# Audit SEO complet — Apprenix

**Date** : 2026-06-25  
**Version auditée** : v1791  
**Scope** : balises `<title>` / meta description, Open Graph, Twitter Cards, H1/H2, JSON-LD schema.org, `robots.txt`, `sitemap.xml`, Google Search Console (GSC).  
**Livrable principal** : ce rapport + fix immédiat du `sitemap.xml` (caractère `&` non échappé).

---

## Résumé exécutif

L'architecture SEO d'Apprenix est **très avancée** : un composant `SEO.tsx` centralisé génère automatiquement titre, description, canonical, hreflang, Open Graph, Twitter Card, Dublin Core, JSON-LD WebPage + fil d'Ariane, et méta-tags anti-scraping IA. Le `robots.txt` et `sitemap.xml` sont structurés et à jour.

**Cependant, deux problèmes bloquants subsistent** après l'audit "100 % humain" :

1. **`index.html` contient encore des dizaines de mentions "IA" et des liens `/aide-ia`** (fallback title/description, JSON-LD Organization/SoftwareApplication/FAQPage, contenu caché SEO). Cela contredit la nouvelle posture "100 % contenu humain" et continue de pointer vers une route obsolète.
2. **Codes de vérification GSC/Bing/Yandex vides** dans `src/config/site.ts` → le site n'est pas vérifiable dans les outils webmasters, bloquant la soumission manuelle du sitemap.

---

## 1. État des balises meta & titres

### 1.1 Composant SEO.tsx

| Élément | État | Commentaire |
|---------|------|-------------|
| `<title>` | ✅ | Concaténation `${title} \| Apprenix`, avec garde-fou anti-doublon si `Apprenix` déjà présent. |
| `meta description` | ✅ | Fallback sur `SITE_DESCRIPTION` si absent. |
| `meta keywords` | ⚠️ | **Défaut contient encore "aide aux devoirs IA", "scanner exercices photo IA", "intelligence artificielle éducation"** à nettoyer. |
| `robots` / `googlebot` | ✅ | `index, follow` par défaut ; `noindex, nofollow` si `noIndex`. |
| `canonical` | ✅ | URL absolue. |
| `hreflang` | ✅ | `fr`, `fr-FR`, `x-default`. |
| Open Graph | ✅ | `og:title`, `og:description`, `og:url`, `og:image` 1200×630, `og:locale` fr_FR + variantes. |
| Twitter Card | ✅ | `summary_large_image` + labels prix/niveaux. |
| Pinterest | ✅ | Rich Pin activé. |
| Dublin Core | ✅ | DC.title, DC.creator, DC.publisher, DC.language, DC.audience. |
| Anti-scraping IA | ✅ | 20 méta-tags `noindex` pour crawlers IA (GPTBot, ClaudeBot, Google-Extended, Anthropic-AI, etc.). |
| JSON-LD WebPage | ✅ | Auto-généré avec `dateModified`, `publisher`, `author`, `image`, `breadcrumb`. |
| JSON-LD BreadcrumbList | ✅ | Auto-généré depuis le `canonical`. |

### 1.2 Couverture des pages

- **74** fichiers page dans `src/pages/**/*.tsx`.
- **73** pages importent `<SEO />`.
- **1 page sans SEO** : `StatusPage.tsx` → ajouter un `<SEO title="..." noIndex />`.

### 1.3 Problèmes de titres

| Page | Titre actuel | Problème | Recommandation |
|------|--------------|----------|----------------|
| `ContactPage.tsx` | `Contacter Apprenix — Support, Suggestions & Signalement \| Apprenix` | Répétition `Apprenix` et `&` non HTML-échappé. | `Contacter Apprenix — Support, suggestions et signalement` (le composant ajoute `\| Apprenix`). |
| `EnseignantsPage.tsx` | `Apprenix pour les Enseignants — Ressources, Outils & Kit RGPD \| Apprenix` | Répétition `Apprenix`, `&`. | `Espace enseignants — ressources, outils et kit RGPD`. |
| `ParentsPage.tsx` | `Apprenix pour les Parents — Sécurisé, Sans Pub & RGPD \| Apprenix` | Répétition `Apprenix`, `&`. | `Espace parents — sécurisé, sans pub et RGPD`. |
| `NouveautesPage.tsx` | `Nouveautés & Mises à Jour Apprenix — Changelog 2026 \| Apprenix` | Répétition `Apprenix`, `&`. | `Nouveautés et mises à jour — changelog 2026`. |
| Landing pages (x6) | 65–78 caractères | Légèrement au-dessus de la limite SERP (~60). | Racourcir les titres les plus longs. |

### 1.4 Problèmes de meta description

| Page | Longueur | Recommandation |
|------|----------|----------------|
| `FlashcardsGratuitPage.tsx` | 193 caractères | Couper après "…tous les niveaux." |
| `MethodeDeTravailPage.tsx` | 184 caractères | Couper après "…Deep Work." |
| `CoursMathsGratuitPage.tsx` | 178 caractères | Couper après "…exercices corrigés." |
| `BrevetMathsPage.tsx` | 167 caractères | Couper après "…calculatrice scientifique." |
| `BacPhiloPage.tsx` | 162 caractères | Couper après "…sujets fréquents." |

> Google tronque généralement au-delà de **155–160 caractères**.

### 1.5 Page sans description personnalisée

- `VisioPage.tsx` : utilise `SITE_DESCRIPTION` par défaut. Ajouter une description dédiée type :  
  *"Classe virtuelle gratuite pour cours à distance, réunions parents-profs et travail en groupe. Sans installation."*

---

## 2. H1 / H2 / structure sémantique

### 2.1 Nombre de H1 par page

| Page | H1 | Statut |
|------|----|--------|
| `AccueilPage.tsx` | 2 | ⚠️ Deux `<h1>` : hero + "Mes outils". Conserver le hero en `<h1>`, passer le second en `<h2>`. |
| `ParentsEspacePage.tsx` | 2 | ⚠️ "Espace Parents" + titre d'onglet. Le second devrait être `<h2>`. |
| `ChansonsEduPage.tsx` | 0 | ⚠️ Ajouter un `<h1>` visuel ou `sr-only` (ex. "Chansons et vidéos éducatives"). |
| `EnseignantsPage.tsx` | 0 | ⚠️ Ajouter un `<h1>` via `PageHero` ou `sr-only`. |
| `TransparencePage.tsx` | 0 | ⚠️ Ajouter un `<h1>`. |
| Landing pages via `LandingHero` | 1 | ✅ Le composant `LandingHero` rend le `title` dans un `<h1>`. |
| Autres pages | 1 | ✅ |

### 2.2 Pages sans H1 détaillées

```
src/pages/ChansonsEduPage.tsx
src/pages/EnseignantsPage.tsx
src/pages/TransparencePage.tsx
```

### 2.3 Utilisation des H2

- `AccueilPage.tsx` : 8 `<h2>` — structure riche, bonne chose.
- `TransparencePage.tsx` : 8 `<h2>` — mais pas de `<h1>` ; hiérarchie invalide.
- `AccessibilitePage.tsx` : 7 `<h2>` — OK avec un `<h1>`.
- `EspaceNiveauPage.tsx` : 6 `<h2>` — OK.

---

## 3. Audit schema.org / JSON-LD

### 3.1 Schémas présents dans `SEO.tsx`

- `WebPage` (ou `Article` si `ogType='article'`) — généré sur chaque page.
- `BreadcrumbList` — auto-généré si le chemin contient plusieurs segments.
- `Organization`, `Person`, `ImageObject`, `EducationalAudience` imbriqués.

### 3.2 Schémas additionnels dans les pages

| Page | Schéma | Commentaire |
|------|--------|-------------|
| `AccueilPage.tsx` | `SoftwareApplication` (EducationApplication) | ✅ |
| `ActualitesPage.tsx` | `Blog` | ✅ |
| `AideDevoirsPage.tsx` | `LearningResource` | ✅ |
| `FlashcardsPage.tsx` | `Course` | ✅ |
| `RessourcesPage.tsx` | `CollectionPage` | ✅ |
| `FaqPage.tsx` | `FAQPage` (injecté via `<SEO jsonLd>`) | ✅ |

### 3.3 Schémas statiques dans `index.html`

| Schéma | Statut | Problème |
|--------|--------|----------|
| `WebSite` + `SearchAction` | ⚠️ | `target.urlTemplate` pointe vers `https://apprenix.xyz/aide-ia?q=...` (route obsolète). |
| `Organization` | ⚠️ | `logo.caption` mentionne "éclair IA" ; `knowsAbout` contient "Intelligence artificielle pédagogique". |
| `EducationalOrganization` | ⚠️ | `hasOfferCatalog` mentionne "Aide aux devoirs IA", "Scanner IA", "explication IA instantanées", "espace IA pédagogique". |
| `SoftwareApplication` | ⚠️ | `description` "aide IA", `featureList` contient "Aide aux devoirs par IA", "Fiches de révision générées par IA", "Scanner d'exercices — photo → analyse IA". |
| `FAQPage` | ⚠️ | Réponses mentionnent "aide IA", "espace IA pédagogique", "L'IA et les ressources s'adaptent", "aide IA". |
| `ItemList` | ⚠️ | Items 1, 4 et 12 pointent vers `/aide-ia` et mentionnent "Aide aux devoirs IA", "Scanner IA", "IA pédagogique". |
| `Person` (Charly Soudan) | ✅ | OK. |

**Recommandation prioritaire** : faire un deuxième passage sur `index.html` pour remplacer `/aide-ia` par `/aide-devoirs` et "IA" par "assistant Apprenix" / "OCR" / "fiches méthode" / "équipe pédagogique" selon le contexte.

### 3.4 Note sur le fallback `index.html`

Les balises statiques de `index.html` (lignes 15–16, 34, 66, 93–109, etc.) sont les **derniers recours** affichés avant hydration React. Elles disent encore :

- `<title>Apprenix — Aide scolaire IA, Flashcards & Révision gratuits</title>`
- `meta description` : "Aide IA, flashcards et révision gratuits..."
- `twitter:title` : "Apprenix — Aide aux devoirs IA gratuite..."

Ces textes apparaissent dans les aperçus de Google Discover, LinkedIn, WhatsApp avant que React ne prenne le relais (et Googlebot peut indexer ce fallback). **À corriger immédiatement.**

---

## 4. `robots.txt` & `sitemap.xml`

### 4.1 `robots.txt`

- ✅ 20 crawlers IA bloqués.
- ✅ Autorise l'indexation générale.
- ✅ Section `Host:` pour Yandex.
- ✅ Sitemap référencés.

### 4.2 `sitemap.xml`

- ✅ XML bien formé (validé par parseur Python).
- ✅ **51 URLs** uniques, pas de doublon.
- ✅ `/aide-ia` supprimé, `/aide-devoirs` présent.
- ✅ `/trouver-enseignant` et `/chansons-educatives` ajoutées.
- ✅ Mentions "IA" nettoyées dans les captions d'images.
- ⚠️ **Fix appliqué pendant l'audit** : remplacement de `&` par `et` dans un `<image:title>` (ligne 402) pour éviter une erreur de parsing XML.

### 4.3 `sitemap-index.xml`

- ✅ Valide, référence `sitemap.xml` avec `lastmod`.

---

## 5. Vérification moteurs (GSC / Bing / Yandex)

**Bloquant** : les constantes suivantes sont vides dans `src/config/site.ts` :

```ts
export const GOOGLE_SITE_VERIFICATION = '';
export const BING_SITE_VERIFICATION    = '';
export const YANDEX_SITE_VERIFICATION  = '';
```

`SEO.tsx` injecte conditionnellement les balises, donc tant qu'elles sont vides, **aucune balise de vérification n'est présente** sur le site.

---

## 6. Recommandations prioritaires

| Priorité | Action | Fichier(s) |
|----------|--------|------------|
| 🔴 **P0** | Remplacer `/aide-ia` par `/aide-devoirs` et nettoyer les mentions "IA" dans `index.html` (title, meta, JSON-LD, contenu caché). | `index.html` |
| 🔴 **P0** | Remplir `GOOGLE_SITE_VERIFICATION` pour GSC. | `src/config/site.ts` |
| 🟠 **P1** | Nettoyer les mots-clés par défaut de `SEO.tsx` et retirer "IA". | `src/components/SEO.tsx` |
| 🟠 **P1** | Corriger les 4 titres avec `Apprenix` dupliqué et `&`. | `ContactPage.tsx`, `EnseignantsPage.tsx`, `ParentsPage.tsx`, `NouveautesPage.tsx` |
| 🟠 **P1** | Raccourcir les descriptions >160 caractères sur les 5 landing pages concernées. | landing pages |
| 🟠 **P1** | Corriger la structure H1 : réduire les doubles H1, ajouter H1 manquants. | `AccueilPage.tsx`, `ParentsEspacePage.tsx`, `ChansonsEduPage.tsx`, `EnseignantsPage.tsx`, `TransparencePage.tsx` |
| 🟡 **P2** | Ajouter un composant `<SEO>` à `StatusPage.tsx`. | `src/pages/StatusPage.tsx` |
| 🟡 **P2** | Ajouter une description dédiée à `VisioPage.tsx`. | `src/pages/VisioPage.tsx` |
| 🟡 **P2** | Remplir `BING_SITE_VERIFICATION` et `YANDEX_SITE_VERIFICATION`. | `src/config/site.ts` |
| 🟢 **P3** | Re-soumettre `sitemap.xml` et `sitemap-index.xml` dans GSC après corrections. | Google Search Console |

---

## 7. Guide — Soumettre le sitemap dans Google Search Console

### Étape 1 : Vérifier la propriété

1. Aller sur [https://search.google.com/search-console](https://search.google.com/search-console).
2. Cliquer **"Ajouter une propriété"**.
3. Choisir **"Préfixe d'URL"** et entrer : `https://apprenix.xyz`.
4. Choisir la méthode **"Balise HTML"**.
5. Copier la valeur du `content="..."` (ex. `abc123...`).
6. Coller cette valeur dans `src/config/site.ts` :

```ts
export const GOOGLE_SITE_VERIFICATION = 'abc123...';
```

7. Commit, push, attendre le déploiement Vercel.
8. Revenir dans GSC et cliquer **"Vérifier"**.

### Étape 2 : Soumettre les sitemaps

1. Dans GSC, aller dans **"Sitemaps"** (menu latéral).
2. Dans le champ "Ajouter un nouveau sitemap", entrer :
   - `sitemap.xml`
   - Cliquer **"Envoyer"**.
3. Répéter avec :
   - `sitemap-index.xml`
4. Vérifier dans **"Couverture"** que les URLs sont indexables.

### Étape 3 : Bing Webmaster Tools (optionnel mais recommandé)

1. Aller sur [https://www.bing.com/webmasters/about](https://www.bing.com/webmasters/about).
2. Ajouter `https://apprenix.xyz`.
3. Méthode **"Balise meta"** → copier la valeur.
4. Coller dans `src/config/site.ts` :

```ts
export const BING_SITE_VERIFICATION = 'votre_code_bing';
```

5. Soumettre `sitemap.xml` dans l'onglet **Sitemaps**.

### Étape 4 : Yandex Webmaster (optionnel)

1. [https://webmaster.yandex.com](https://webmaster.yandex.com) → ajouter le site.
2. Méthode **"Meta tag"**.
3. Coller dans `src/config/site.ts` :

```ts
export const YANDEX_SITE_VERIFICATION = 'votre_code_yandex';
```

### Étape 5 : Vérification post-soumission

- Attendre 24–72 h pour le premier crawl.
- Surveiller GSC > **"Couverture"** pour détecter les erreurs 404/soft-404.
- Surveiller **"Expérience"** > Core Web Vitals.
- Demander une nouvelle indexation des pages critiques via l'outil **"Inspection d'URL"** (`https://apprenix.xyz/aide-devoirs`, `/`, landing pages).

---

## 8. Checklist rapide de validation

- [ ] `index.html` : plus de "IA" dans les meta et JSON-LD, `/aide-ia` remplacé par `/aide-devoirs`.
- [ ] `GOOGLE_SITE_VERIFICATION` renseigné.
- [ ] `SEO.tsx` : keywords par défaut nettoyés de "IA".
- [ ] Titres dupliqués `Apprenix` corrigés dans les 4 pages identifiées.
- [ ] Descriptions >160 caractères raccourcies.
- [ ] Structure H1 corrigée (1 seul `<h1>` par page).
- [ ] `StatusPage.tsx` a un `<SEO />`.
- [ ] `VisioPage.tsx` a une description dédiée.
- [ ] Sitemap XML valide et soumis dans GSC.
- [ ] `robots.txt` reste inchangé (déjà optimal).

---

## Annexe — Inventaire des pages et SEO

| Page | Titre (extrait) | Description | Canonical | H1 | JSON-LD |
|------|-----------------|-------------|-----------|----|---------|
| AccueilPage | Apprenix — Aide scolaire gratuite... | 134 car. | `/` | 2 | SoftwareApplication |
| AideDevoirsPage | Aide aux devoirs gratuite — Fiches méthode... | 152 car. | `/aide-devoirs` | 1 | LearningResource |
| AideDevoirsGratuitPage | Aide aux devoirs gratuite — Toutes matières... | 137 car. | (via route) | 1* | non |
| FlashcardsPage | Flashcards gratuits — Mémorisez 2× plus vite... | 128 car. | `/flashcards` | 1 | Course |
| ScannerPage | Scanner de devoirs — Photo → Correction... | 132 car. | `/scanner` | 1 | non |
| RessourcesPage | Ressources pédagogiques gratuites... | 130 car. | `/ressources` | 1 | CollectionPage |
| FAQPage | FAQ Scolaire 2026... | dynamique | `/faq` | 1 | FAQPage |
| ContactPage | Contacter Apprenix — Support... | 104 car. | `/contact` | 1 | non |
| ParentsPage | Apprenix pour les Parents... | 154 car. | `/parents` | 1 | non |
| EnseignantsPage | Apprenix pour les Enseignants... | 154 car. | `/enseignants` | 0 | non |
| InclusionPage | Inclusion scolaire... | 155 car. | `/inclusion` | 1 | non |
| MissionPage | Notre Mission... | 141 car. | `/mission` | 1 | non |
| TransparencePage | Transparence — Données & Sécurité... | ? | `/transparence` | 0 | non |
| ChansonsEduPage | Chansons & Vidéos Éducatives... | ? | `/chansons-educatives` | 0 | non |
| StatusPage | — | — | — | ? | non |

\* H1 fourni par le composant `LandingHero`.

---

*Rapport généré automatiquement à partir de l'analyse du code source Apprenix. Les corrections de code recommandées devraient être appliquées puis validées par `npm run lint` avant push.*
