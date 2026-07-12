'use client';

/**
 * DemoPanel — Training Demo Switcher
 *
 * Lets users switch between 4 pre-built demo knowledge bases to
 * instantly see how the chatbot changes its behavior.
 *
 * Uses the /api/train endpoint to switch knowledge source.
 * No external dependencies.
 */

import { useState } from 'react';
import styles from './DemoPanel.module.css';

const DEMOS = [
  {
    id: 'restaurant',
    label: 'Restaurant',
    emoji: '🍕',
    file: '/demos/restaurant.md',
    desc: 'Bella Vista Italian Restaurant — menu, hours, reservations, dietary options.',
    sampleQ: 'What pasta dishes do you have?',
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce',
    emoji: '🛒',
    file: '/demos/ecommerce.md',
    desc: 'TechCart Electronics Store — products, shipping, returns, payment methods.',
    sampleQ: 'What is your return policy?',
  },
  {
    id: 'doctor',
    label: 'Medical Clinic',
    emoji: '🏥',
    file: '/demos/doctor.md',
    desc: 'Wellness First Clinic by Dr. Sarah Ahmed — services, appointments, fees.',
    sampleQ: 'How do I book an appointment?',
  },
  {
    id: 'designer',
    label: 'Designer',
    emoji: '🎨',
    file: '/demos/designer.md',
    desc: 'Pixel & Ink Studio — logo design, social media, UI/UX, pricing, process.',
    sampleQ: 'How much does a logo cost?',
  },
];

export default function DemoPanel() {
  const [active, setActive] = useState(null);
  const [status, setStatus] = useState(null); // null | 'loading' | {ok, msg, demo}

  const switchDemo = async (demo) => {
    if (active === demo.id && status?.ok) return; // already trained
    setStatus('loading');
    setActive(demo.id);

    try {
      // Fetch the local demo file content and send as text to train API
      const fileRes = await fetch(demo.file);
      if (!fileRes.ok) throw new Error(`Could not load demo file: ${demo.file}`);
      const text = await fileRes.text();

      const res = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Train failed');

      setStatus({ ok: true, msg: `Bot trained with "${demo.label}" data. Open the chat and try asking: "${demo.sampleQ}"`, demo: demo.id });
    } catch (err) {
      setStatus({ ok: false, msg: err.message });
    }
  };

  return (
    <div className={styles.wrap}>
      {/* Demo cards */}
      <div className={styles.grid}>
        {DEMOS.map((demo) => {
          const isActive = active === demo.id;
          const isDone = isActive && status?.ok;
          return (
            <button
              key={demo.id}
              className={`${styles.card} ${isActive ? styles.cardActive : ''} ${isDone ? styles.cardDone : ''}`}
              onClick={() => switchDemo(demo)}
              disabled={status === 'loading'}
            >
              <span className={styles.cardEmoji}>{demo.emoji}</span>
              <span className={styles.cardLabel}>{demo.label}</span>
              <p className={styles.cardDesc}>{demo.desc}</p>
              {isDone && <span className={styles.doneTag}>✓ Active</span>}
            </button>
          );
        })}
      </div>

      {/* Status */}
      {status === 'loading' && (
        <div className={styles.status}>
          <span className={styles.loader} />
          Training chatbot with new data...
        </div>
      )}
      {status && status !== 'loading' && (
        <div className={`${styles.status} ${status.ok ? styles.statusOk : styles.statusErr}`}>
          {status.ok ? '✅' : '❌'} {status.msg}
        </div>
      )}

      {/* Hint */}
      {!status && (
        <p className={styles.hint}>
          Click a card above to instantly train the chatbot with that website's data.
          Then open the chat in the bottom-right corner to test it.
        </p>
      )}
    </div>
  );
}
