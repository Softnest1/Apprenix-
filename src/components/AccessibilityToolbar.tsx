/**
 * AccessibilityToolbar v3 — WCAG 2.1 AA/AAA · RGAA 4.1 · Maximum
 *
 * Couverture complète :
 *  - Taille texte (3 niveaux + TV/cinéma)
 *  - Contraste élevé / très élevé (WCAG AA/AAA)
 *  - Mode sombre / clair (toggle)
 *  - Fonds personnalisés (crème, bleu, gris)
 *  - Polices : Atkinson, OpenDyslexic, Luciole, Arial
 *  - Interligne réglable (1.5 → 2.5)
 *  - Daltonisme (protanopie, deutéranopie, tritanopie)
 *  - Animations réduites
 *  - Espacement élargi WCAG 1.4.12
 *  - Mode projecteur 3 niveaux (proche / classe / cinéma)
 *  - Navigation clavier / TV D-pad info
 *  - Persistance localStorage
 *  - data-attributes sur <html> — zéro !important
 */

import {
  Accessibility,
  BookOpen,
  Contrast,
  Eye,
  Monitor,
  MoveHorizontal,
  Presentation,
  RotateCcw,
  Sun,
  Moon,
  Type,
  X,
  ZoomIn,
} from 'lucide-react';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface A11yPrefs {
  fontSize:        0 | 1 | 2 | 3;   // 0=normal, 1=grand, 2=très grand, 3=TV/cinéma
  highContrast:    boolean;          // Contraste élevé WCAG AA (4.5:1)
  veryHighContrast:boolean;          // Contraste très élevé WCAG AAA (7:1)
  bgColor:         'default' | 'cream' | 'lightblue' | 'lightgray';
  dyslexiaFont:    boolean;          // Atkinson Hyperlegible
  openDyslexic:    boolean;          // OpenDyslexic
  lucioleFont:     boolean;          // Luciole (basse vision)
  arialFont:       boolean;          // Arial (lisibilité universelle)
  lineHeight:      1.5 | 1.8 | 2.0 | 2.5;
  reducedMotion:   boolean;
  wideSpacing:     boolean;          // Espacement élargi WCAG 1.4.12
  daltonism:       'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  presentation:    boolean | 'class' | 'cinema'; // false=off, true=mode salle, 'class'=classe, 'cinema'=TV/cinéma
  darkMode:        'auto' | 'light' | 'dark';
}

const STORAGE_KEY = 'apprenix_a11y_v3';
export const DEFAULT_PREFS: A11yPrefs = {
  fontSize:         0,
  highContrast:     false,
  veryHighContrast: false,
  bgColor:          'default',
  dyslexiaFont:     false,
  openDyslexic:     false,
  lucioleFont:      false,
  arialFont:        false,
  lineHeight:       1.5,
  reducedMotion:    false,
  wideSpacing:      false,
  daltonism:        'none',
  presentation:     false,
  darkMode:         'auto',
};

// ─── Chargement depuis localStorage (migration v2 → v3) ──────────────────────
function loadPrefs(): A11yPrefs {
  try {
    // Migrer l'ancienne clé v2 si présente
    const rawV2 = localStorage.getItem('apprenix_a11y_v2');
    const rawV3 = localStorage.getItem(STORAGE_KEY);
    const raw   = rawV3 ?? rawV2;
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

// ─── Appliquer les prefs via data-attributes sur <html> ──────────────────────
export function applyPrefs(prefs: A11yPrefs) {
  const html  = document.documentElement;
  const root  = document.getElementById('root');

  // ① Taille du texte
  html.setAttribute('data-a11y-fontsize', String(prefs.fontSize));

  // ② Contraste (priorité : veryHigh > high > normal)
  if (prefs.veryHighContrast) {
    html.setAttribute('data-a11y-contrast', 'veryhigh');
  } else if (prefs.highContrast) {
    html.setAttribute('data-a11y-contrast', 'high');
  } else {
    html.setAttribute('data-a11y-contrast', 'normal');
  }

  // ③ Fond de page
  if (prefs.bgColor !== 'default') {
    html.setAttribute('data-a11y-bg', prefs.bgColor);
  } else {
    html.removeAttribute('data-a11y-bg');
  }

  // ④ Police (priorité : arialFont > lucioleFont > openDyslexic > dyslexiaFont)
  if (prefs.arialFont) {
    html.setAttribute('data-a11y-font', 'arial');
  } else if (prefs.lucioleFont) {
    html.setAttribute('data-a11y-font', 'luciole');
  } else if (prefs.openDyslexic) {
    html.setAttribute('data-a11y-font', 'opendyslexic');
  } else if (prefs.dyslexiaFont) {
    html.setAttribute('data-a11y-font', 'atkinson');
  } else {
    html.setAttribute('data-a11y-font', 'default');
  }

  // ⑤ Interligne
  if (prefs.lineHeight !== 1.5) {
    html.setAttribute('data-a11y-lineheight', 'custom');
    html.style.setProperty('--user-line-height', String(prefs.lineHeight));
  } else {
    html.removeAttribute('data-a11y-lineheight');
    html.style.removeProperty('--user-line-height');
  }

  // ⑥ Animations
  html.setAttribute('data-a11y-motion',
    prefs.reducedMotion || !!prefs.presentation ? 'reduced' : 'normal');

  // ⑦ Espacement
  html.setAttribute('data-a11y-spacing',
    prefs.wideSpacing || !!prefs.presentation ? 'wide' : 'normal');

  // ⑧ Mode projecteur — 3 niveaux
  if (prefs.presentation === 'cinema') {
    html.setAttribute('data-a11y-presentation', 'cinema');
  } else if (prefs.presentation === 'class') {
    html.setAttribute('data-a11y-presentation', 'class');
  } else if (prefs.presentation === true) {
    html.setAttribute('data-a11y-presentation', 'true');
  } else {
    html.setAttribute('data-a11y-presentation', 'false');
  }

  // ⑨ Daltonisme (filtre SVG sur #root)
  if (root) {
    if (prefs.daltonism !== 'none') {
      root.setAttribute('data-a11y-daltonism', prefs.daltonism);
    } else {
      root.removeAttribute('data-a11y-daltonism');
    }
  }

  // ⑩ Mode sombre
  if (prefs.darkMode === 'dark') {
    html.classList.add('dark');
  } else if (prefs.darkMode === 'light') {
    html.classList.remove('dark');
  } else {
    // 'auto' — respecter le système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.classList.toggle('dark', prefersDark);
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface A11yPrefsContextValue {
  prefs: A11yPrefs;
  setPrefs: (next: Partial<A11yPrefs> | ((p: A11yPrefs) => A11yPrefs)) => void;
}
const A11yPrefsContext = createContext<A11yPrefsContextValue | null>(null);

export const A11yPrefsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefsState] = useState<A11yPrefs>(loadPrefs);

  const setPrefs = useCallback((next: Partial<A11yPrefs> | ((p: A11yPrefs) => A11yPrefs)) => {
    setPrefsState(prev => {
      const updated = typeof next === 'function' ? next(prev) : { ...prev, ...next };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  useEffect(() => { applyPrefs(prefs); }, [prefs]);

  // Raccourci F7 — Mode projecteur (cycle: off → salle → classe → cinéma → off)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F7' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setPrefs(p => {
          if (!p.presentation) return { ...p, presentation: true };
          if (p.presentation === true) return { ...p, presentation: 'class' };
          if (p.presentation === 'class') return { ...p, presentation: 'cinema' };
          return { ...p, presentation: false };
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPrefs]);

  return (
    <A11yPrefsContext.Provider value={{ prefs, setPrefs }}>
      {children}
    </A11yPrefsContext.Provider>
  );
};

export function useA11yPrefs(): A11yPrefsContextValue {
  const ctx = useContext(A11yPrefsContext);
  if (!ctx) return { prefs: DEFAULT_PREFS, setPrefs: () => {} };
  return ctx;
}

// ─── Toggle switch interne ────────────────────────────────────────────────────
const Toggle: React.FC<{
  icon: React.ReactNode;
  label: string;
  desc: string;
  active: boolean;
  onToggle: () => void;
}> = ({ icon, label, desc, active, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={active}
    onClick={onToggle}
    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors"
    style={{
      background:   active ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--muted))',
      border:       `2px solid ${active ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
    }}
  >
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
      style={{
        background: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.2)',
        color:      active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
      }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
      <p className="text-xs text-muted-foreground leading-tight mt-0.5">{desc}</p>
    </div>
    <div
      className="shrink-0 relative rounded-full"
      style={{
        width: 40, height: 22,
        background: active ? 'hsl(var(--primary))' : 'hsl(var(--border))',
        transition: 'background 150ms',
      }}
      aria-hidden="true"
    >
      <div
        className="absolute top-[3px] rounded-full bg-white shadow-sm"
        style={{
          width: 16, height: 16,
          left: active ? 21 : 3,
          transition: 'left 150ms',
        }}
      />
    </div>
  </button>
);

// ─── Panneau d'accessibilité ──────────────────────────────────────────────────
export const A11yPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { prefs, setPrefs } = useA11yPrefs();
  const panelRef = useRef<HTMLDivElement>(null);

  const tog = (key: keyof A11yPrefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }));

  const reset = () => {
    setPrefs(DEFAULT_PREFS);
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem('apprenix_a11y_v2'); } catch {}
  };

  const hasChanges = JSON.stringify(prefs) !== JSON.stringify(DEFAULT_PREFS);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => { panelRef.current?.focus({ preventScroll: true }); }, []);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Options d'accessibilité"
      className="flex flex-col rounded-t-2xl md:rounded-2xl outline-none"
      style={{
        background: 'hsl(var(--card))',
        border:     '1px solid hsl(var(--border))',
        boxShadow:  '0 20px 60px rgba(0,0,0,0.25)',
        width:      '100%',
        maxWidth:   440,
        maxHeight:  'min(92dvh, 720px)',
      }}
    >
      {/* En-tête */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-2xl shrink-0"
        style={{ background: 'hsl(var(--primary))', borderBottom: '1px solid hsl(var(--primary-foreground) / 0.15)' }}
      >
        <div className="flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
          <span className="font-bold text-primary-foreground">Accessibilité</span>
          <span className="text-xs text-primary-foreground/70 font-medium">WCAG 2.1 AA/AAA</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center rounded-lg transition-colors"
          style={{
            minWidth: 44, minHeight: 44,
            background: 'hsl(var(--primary-foreground) / 0.15)',
            border:     '1px solid hsl(var(--primary-foreground) / 0.3)',
            color:      'hsl(var(--primary-foreground))',
          }}
          aria-label="Fermer le panneau d'accessibilité"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Contenu scrollable */}
      <div
        className="overflow-y-auto overscroll-contain flex-1 px-4 py-4 space-y-3"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}
      >

        {/* ① Taille du texte */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Taille du texte</p>
        <div className="grid grid-cols-4 gap-2">
          {([
            { lvl: 0, label: 'A',    desc: 'Normal (16px)' },
            { lvl: 1, label: 'A+',   desc: 'Grand (20px)' },
            { lvl: 2, label: 'A++',  desc: 'Très grand (24px)' },
            { lvl: 3, label: 'TV',   desc: 'TV/Projecteur (28px)' },
          ] as { lvl: 0|1|2|3; label: string; desc: string }[]).map(({ lvl, label, desc }) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setPrefs({ fontSize: lvl })}
              aria-pressed={prefs.fontSize === lvl}
              aria-label={desc}
              className="rounded-xl font-bold border-2 transition-colors"
              style={{
                minHeight: 52,
                fontSize:  lvl === 0 ? 14 : lvl === 1 ? 16 : lvl === 2 ? 19 : 22,
                background:   prefs.fontSize === lvl ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                borderColor:  prefs.fontSize === lvl ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                color:        prefs.fontSize === lvl ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ② Mode sombre */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Thème</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { val: 'auto',  icon: <Monitor className="w-4 h-4" />, label: 'Auto',  desc: 'Système' },
            { val: 'light', icon: <Sun     className="w-4 h-4" />, label: 'Clair', desc: 'Mode jour' },
            { val: 'dark',  icon: <Moon    className="w-4 h-4" />, label: 'Sombre',desc: 'Mode nuit' },
          ] as { val: 'auto'|'light'|'dark'; icon: React.ReactNode; label: string; desc: string }[]).map(({ val, icon, label, desc }) => (
            <button
              key={val}
              type="button"
              onClick={() => setPrefs({ darkMode: val })}
              aria-pressed={prefs.darkMode === val}
              aria-label={desc}
              className="flex flex-col items-center justify-center gap-1 rounded-xl py-2.5 border-2 text-xs font-semibold transition-colors"
              style={{
                minHeight: 56,
                background:  prefs.darkMode === val ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--muted))',
                borderColor: prefs.darkMode === val ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                color:       prefs.darkMode === val ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* ③ Contraste */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Contraste</p>
        <div className="space-y-2">
          <Toggle
            icon={<Contrast className="w-4 h-4" />}
            label="Contraste élevé"
            desc="WCAG AA — ratio ≥ 4.5:1 · lisible en plein soleil"
            active={prefs.highContrast && !prefs.veryHighContrast}
            onToggle={() => setPrefs({ highContrast: !prefs.highContrast, veryHighContrast: false })}
          />
          <Toggle
            icon={<Contrast className="w-4 h-4" />}
            label="Contraste très élevé"
            desc="WCAG AAA — ratio ≥ 7:1 · noir pur sur blanc pur"
            active={prefs.veryHighContrast}
            onToggle={() => setPrefs({ veryHighContrast: !prefs.veryHighContrast, highContrast: false })}
          />
        </div>

        {/* ④ Fond de page */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Fond de page</p>
        <div className="grid grid-cols-4 gap-2">
          {([
            { val: 'default',   label: 'Défaut',   style: { background: 'hsl(var(--background))', border: '2px solid hsl(var(--border))' } },
            { val: 'cream',     label: 'Crème',    style: { background: '#FFFBF0', border: '2px solid #e8d9a0' } },
            { val: 'lightblue', label: 'Bleu',     style: { background: '#EEF6FF', border: '2px solid #b3d4f5' } },
            { val: 'lightgray', label: 'Gris',     style: { background: '#F5F5F5', border: '2px solid #d0d0d0' } },
          ] as { val: A11yPrefs['bgColor']; label: string; style: React.CSSProperties }[]).map(({ val, label, style }) => (
            <button
              key={val}
              type="button"
              onClick={() => setPrefs({ bgColor: val })}
              aria-pressed={prefs.bgColor === val}
              aria-label={`Fond ${label}`}
              className="rounded-xl text-xs font-semibold transition-all"
              style={{
                minHeight: 48,
                outlineOffset: 2,
                outline: prefs.bgColor === val ? '3px solid hsl(var(--primary))' : 'none',
                color: '#333',
                ...style,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ⑤ Vision */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Vision</p>
        <div className="space-y-2">
          <Toggle
            icon={<Eye className="w-4 h-4" />}
            label="Réduire les animations"
            desc="Supprime transitions et effets cinétiques"
            active={prefs.reducedMotion}
            onToggle={() => tog('reducedMotion')}
          />
        </div>

        {/* ⑥ Daltonisme */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Daltonisme</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { val: 'none',         label: 'Aucun',       desc: 'Vision normale' },
            { val: 'protanopia',   label: 'Protanopie',  desc: 'Déficit rouge' },
            { val: 'deuteranopia', label: 'Deutéranopie',desc: 'Déficit vert' },
            { val: 'tritanopia',   label: 'Tritanopie',  desc: 'Déficit bleu' },
          ] as { val: A11yPrefs['daltonism']; label: string; desc: string }[]).map(({ val, label, desc }) => (
            <button
              key={val}
              type="button"
              onClick={() => setPrefs({ daltonism: val })}
              aria-pressed={prefs.daltonism === val}
              className="flex flex-col items-start px-3 py-2.5 rounded-xl border-2 text-left transition-colors"
              style={{
                background:  prefs.daltonism === val ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--muted))',
                borderColor: prefs.daltonism === val ? 'hsl(var(--primary))' : 'hsl(var(--border))',
              }}
            >
              <span className="text-xs font-semibold text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>

        {/* ⑦ Police */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Police de caractères</p>
        <div className="space-y-2">
          <Toggle
            icon={<Type className="w-4 h-4" />}
            label="Atkinson Hyperlegible"
            desc="Dyslexie légère à modérée — lettres bien distinctes"
            active={prefs.dyslexiaFont && !prefs.openDyslexic && !prefs.lucioleFont && !prefs.arialFont}
            onToggle={() => setPrefs({ dyslexiaFont: !prefs.dyslexiaFont, openDyslexic: false, lucioleFont: false, arialFont: false })}
          />
          <Toggle
            icon={<BookOpen className="w-4 h-4" />}
            label="OpenDyslexic"
            desc="Bas alourdi — dyslexie sévère"
            active={prefs.openDyslexic}
            onToggle={() => setPrefs({ openDyslexic: !prefs.openDyslexic, dyslexiaFont: false, lucioleFont: false, arialFont: false })}
          />
          <Toggle
            icon={<Eye className="w-4 h-4" />}
            label="Luciole"
            desc="Basse vision — lisibilité maximale certifiée INJA"
            active={prefs.lucioleFont}
            onToggle={() => setPrefs({ lucioleFont: !prefs.lucioleFont, dyslexiaFont: false, openDyslexic: false, arialFont: false })}
          />
          <Toggle
            icon={<Type className="w-4 h-4" />}
            label="Arial"
            desc="Lisibilité universelle — police familière"
            active={prefs.arialFont}
            onToggle={() => setPrefs({ arialFont: !prefs.arialFont, dyslexiaFont: false, openDyslexic: false, lucioleFont: false })}
          />
        </div>

        {/* ⑧ Interligne */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Interligne</p>
        <div className="grid grid-cols-4 gap-2">
          {([1.5, 1.8, 2.0, 2.5] as A11yPrefs['lineHeight'][]).map(lh => (
            <button
              key={lh}
              type="button"
              onClick={() => setPrefs({ lineHeight: lh })}
              aria-pressed={prefs.lineHeight === lh}
              aria-label={`Interligne ${lh}`}
              className="rounded-xl text-xs font-semibold border-2 transition-colors"
              style={{
                minHeight: 44,
                background:  prefs.lineHeight === lh ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                borderColor: prefs.lineHeight === lh ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                color:       prefs.lineHeight === lh ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
              }}
            >
              ×{lh}
            </button>
          ))}
        </div>

        {/* ⑨ Espacement */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Espacement</p>
        <div className="space-y-2">
          <Toggle
            icon={<MoveHorizontal className="w-4 h-4" />}
            label="Espacement élargi"
            desc="Interlignes et espacement augmentés — WCAG 1.4.12"
            active={prefs.wideSpacing}
            onToggle={() => tog('wideSpacing')}
          />
        </div>

        {/* ⑩ Mode projecteur — 3 niveaux */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Projecteur / TV / Cinéma</p>
        <div className="grid grid-cols-1 gap-2">
          <Toggle
            icon={<Presentation className="w-4 h-4" />}
            label="Mode salle (22 px)"
            desc="Enseignant en salle · 2–3 m · F7 pour basculer"
            active={prefs.presentation === true}
            onToggle={() => setPrefs({ presentation: prefs.presentation === true ? false : true })}
          />
          <Toggle
            icon={<Presentation className="w-4 h-4" />}
            label="Mode classe / projecteur (28 px)"
            desc="Projecteur numérique · 4–6 m · F7×2"
            active={prefs.presentation === 'class'}
            onToggle={() => setPrefs({ presentation: prefs.presentation === 'class' ? false : 'class' })}
          />
          <Toggle
            icon={<Monitor className="w-4 h-4" />}
            label="Mode TV / cinéma (38 px)"
            desc="TV 4K, home cinema, grand projecteur · > 6 m · F7×3"
            active={prefs.presentation === 'cinema'}
            onToggle={() => setPrefs({ presentation: prefs.presentation === 'cinema' ? false : 'cinema' })}
          />
          {prefs.presentation && (
            <p className="text-xs px-3 py-2 rounded-xl bg-muted border border-border text-foreground">
              💡 <kbd className="font-mono bg-background border border-border rounded px-1">F7</kbd> pour
              cycler entre les niveaux (salle → classe → cinéma → off)
            </p>
          )}
        </div>

        {/* ⑪ Navigation clavier / TV */}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 pt-1">Navigation clavier & TV</p>
        <p className="text-xs px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground">
          <strong>Tab · Entrée · Flèches</strong> — aucune souris requise.
          <span className="block mt-1 text-muted-foreground">
            <kbd className="font-mono bg-background border border-border rounded px-1">Alt+1</kbd> contenu ·{' '}
            <kbd className="font-mono bg-background border border-border rounded px-1">F7</kbd> projecteur ·{' '}
            <kbd className="font-mono bg-background border border-border rounded px-1">Esc</kbd> fermer
          </span>
          <span className="block mt-1 text-muted-foreground">
            TV / Télécommande : D-pad focus ring renforcé automatiquement.
          </span>
        </p>

        {/* ⑫ Réinitialiser */}
        {hasChanges && (
          <button
            type="button"
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 rounded-xl font-medium border-2 transition-colors"
            style={{
              minHeight: 48,
              borderColor: 'hsl(var(--border))',
              background:  'hsl(var(--muted))',
              color:       'hsl(var(--foreground))',
            }}
            aria-label="Réinitialiser toutes les options d'accessibilité"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Réinitialiser tout
          </button>
        )}

        <a
          href="/accessibilite"
          className="block text-center text-xs underline underline-offset-2 py-2 text-primary"
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
        >
          Déclaration d'accessibilité RGAA 4.1 →
        </a>
      </div>
    </div>
  );
};

// ─── FAB flottant — bouton ♿ toujours visible ─────────────────────────────────
export const AccessibilityFab: React.FC = () => {
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Ouvrir les options d'accessibilité"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="fixed z-[9000] flex items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50"
        style={{
          bottom:     'max(80px, calc(70px + env(safe-area-inset-bottom, 0px)))',
          right:      16,
          width:      48,
          height:     48,
          background: 'hsl(var(--primary))',
          color:      'hsl(var(--primary-foreground))',
          border:     '2px solid hsl(var(--primary-foreground) / 0.2)',
        }}
      >
        <Accessibility className="w-5 h-5" aria-hidden="true" />
        <ZoomIn className="w-2.5 h-2.5 absolute bottom-0.5 right-0.5" aria-hidden="true" />
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[9001] flex items-end md:items-center justify-center md:p-6"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', touchAction: 'none' }}
          onClick={handleBackdrop}
          aria-hidden="false"
        >
          <div className="w-full flex justify-center px-0 md:px-0">
            <A11yPanel onClose={() => setOpen(false)} />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

// ─── Export default no-op — rétrocompatibilité ───────────────────────────────
const AccessibilityToolbar: React.FC = () => null;
export default AccessibilityToolbar;

// ─── AccessibilityHeaderBtn — bouton intégré header/sidebar ──────────────────
export const AccessibilityHeaderBtn: React.FC<{
  className?: string;
  iconOnly?: boolean;
}> = ({ className = '', iconOnly = false }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Ouvrir les options d'accessibilité"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={className}
      >
        <Accessibility className="w-4 h-4 shrink-0" aria-hidden="true" />
        {!iconOnly && <span>Accessibilité</span>}
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[9001] flex items-end md:items-center justify-center md:p-6"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', touchAction: 'none' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full flex justify-center">
            <A11yPanel onClose={() => setOpen(false)} />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

