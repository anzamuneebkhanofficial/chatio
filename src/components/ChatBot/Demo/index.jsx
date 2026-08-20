'use client';

/**
 * DemoPanel — Interactive Knowledge Switcher
 *
 * Lets users switch between 4 pre-built business knowledge bases
 * to test how the live chatbot changes its personality, knowledge,
 * and suggestion chips in a temporary session without touching the database.
 */

import { useState, useEffect } from 'react';
import styles from './DemoPanel.module.css';
import { DEMO_PRESETS } from '../lib/demoPresets';
import {
  UtensilsCrossed,
  ShoppingBag,
  Stethoscope,
  Palette,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Clock,
  Info,
} from 'lucide-react';

const DEMO_ITEMS = [
  {
    id: 'restaurant',
    label: 'Restaurant',
    icon: UtensilsCrossed,
    desc: 'Bella Vista Italian Restaurant — handmade pasta, pizzas, wine, reservations.',
    sampleQ: 'What pasta dishes do you have?',
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce',
    icon: ShoppingBag,
    desc: 'TechCart Electronics Store — laptops, shipping times, return policies.',
    sampleQ: 'What is your return policy?',
  },
  {
    id: 'doctor',
    label: 'Medical Clinic',
    icon: Stethoscope,
    desc: 'Wellness First Clinic by Dr. Sarah Ahmed — appointments, fees, clinic hours.',
    sampleQ: 'How do I book an appointment?',
  },
  {
    id: 'designer',
    label: 'Design Agency',
    icon: Palette,
    desc: 'Pixel & Ink Studio — logo design, UI/UX packages, pricing, timeline.',
    sampleQ: 'How much does a logo cost?',
  },
];

export default function DemoPanel() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    // Check if session storage has an active demo
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('chatio_demo_mode');
      if (saved && DEMO_PRESETS[saved]) {
        setActive(saved);
      }
    }
  }, []);

  const switchDemo = (demoId) => {
    setActive(demoId);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chatio_demo_mode', demoId);
      window.dispatchEvent(
        new CustomEvent('chatio:demo_change', {
          detail: { demoId },
        })
      );
    }
  };

  const resetToDefault = () => {
    setActive(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('chatio_demo_mode');
      window.dispatchEvent(
        new CustomEvent('chatio:demo_change', {
          detail: { demoId: 'default' },
        })
      );
    }
  };

  const activePreset = active ? DEMO_PRESETS[active] : null;

  return (
    <div className={styles.wrap}>
      {/* Demo cards */}
      <div className={styles.grid}>
        {DEMO_ITEMS.map((demo) => {
          const Icon = demo.icon;
          const isActive = active === demo.id;
          return (
            <button
              key={demo.id}
              className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
              onClick={() => switchDemo(demo.id)}
              type="button"
            >
              <div className={styles.cardIconWrap}>
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <span className={styles.cardLabel}>{demo.label}</span>
              <p className={styles.cardDesc}>{demo.desc}</p>
              {isActive && (
                <span className={styles.doneTag}>
                  <CheckCircle2 className="w-3 h-3 text-green-400" /> Active in Chat
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Demo Status Banner */}
      {activePreset ? (
        <div className={`${styles.status} ${styles.statusOk}`}>
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-400 shrink-0" />
              <span>
                <strong>{activePreset.name}</strong> active. Open chat and ask: <em>&ldquo;{activePreset.suggestions[0]?.prompt}&rdquo;</em>
              </span>
            </div>
            <button
              onClick={resetToDefault}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline shrink-0 flex items-center gap-1 cursor-pointer"
              title="Reset to default Chatio AI Assistant"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Chatio
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.hint}>
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive demo runs in <strong>temporary session</strong> &mdash; resets automatically on page refresh.</span>
          </div>
        </div>
      )}
    </div>
  );
}
