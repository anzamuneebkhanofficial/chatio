import ChatWidget from '@/components/ChatBot/Widget';
import DemoPanel from '@/components/ChatBot/Demo';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>

      {/* ── Navigation ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <a href="#" className={styles.logo}>
            <span className={styles.logoMark}>⬡</span>MyBot
          </a>
          <div className={styles.navLinks}>
            <a href="#demo" className={styles.navLink}>Live Demo</a>
            <a href="#how" className={styles.navLink}>How It Works</a>
            <a href="#reuse" className={styles.navLink}>Reuse</a>
            <a href="/admin" className={styles.navLink} style={{ color: 'var(--accent)' }}>Admin Panel</a>
          </div>
          <a href="#demo" className={styles.navCta}>Try It Free</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero} id="hero">
        <div className={styles.glow} />
        <div className={styles.glow2} />

        <span className={styles.badge}>
          <span className={styles.badgeDot} />
          Smart Switch AI — Gemini × Groq Racing
        </span>

        <h1 className={styles.heroTitle}>
          The AI Chatbot<br />
          <span className={styles.gradient}>Any Website Deserves</span>
        </h1>

        <p className={styles.heroSub}>
          Drop one component into any Next.js project. Train it with your website data.
          Watch it answer every visitor question with precision.
        </p>

        <div className={styles.heroBtns}>
          <a href="#demo" className={styles.btnPrimary}>See Live Demo</a>
          <a href="/admin" className={styles.btnGhost}>Admin Panel</a>
          <a href="#reuse" className={styles.btnGhost}>How to Reuse</a>
        </div>

        <div className={styles.heroStats}>
          {[
            { n: '2', l: 'AI providers racing' },
            { n: '4', l: 'Input formats' },
            { n: '0', l: 'Extra dependencies' },
            { n: '∞', l: 'Websites it can serve' },
          ].map((s, i) => (
            <div key={i} className={styles.stat}>
              <span className={styles.statN}>{s.n}</span>
              <span className={styles.statL}>{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo Section ── */}
      <section className={styles.section} id="demo">
        <div className={styles.container}>
          <div className={styles.secHead}>
            <span className={styles.secTag}>Live Demo</span>
            <h2 className={styles.secTitle}>
              Train It. Test It. <span className={styles.gradient}>Instantly.</span>
            </h2>
            <p className={styles.secSub}>
              Click the chat button in the bottom-right corner. Then switch the demo below
              to train the bot with different website data and see how it responds.
            </p>
          </div>
          <DemoPanel />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="how">
        <div className={styles.container}>
          <div className={styles.secHead}>
            <span className={styles.secTag}>How It Works</span>
            <h2 className={styles.secTitle}>
              Smart Switch <span className={styles.gradient}>Race Mode</span>
            </h2>
          </div>
          <div className={styles.howGrid}>
            {[
              { icon: '🧠', step: '01', title: 'Load Knowledge', desc: 'Upload your website data as a .md, .txt, or .json file — or paste your website URL.' },
              { icon: '⚡', step: '02', title: 'Race Starts', desc: 'Every user question fires both Gemini and Groq simultaneously. No waiting for one to finish.' },
              { icon: '🏆', step: '03', title: 'First Wins', desc: 'Whichever AI responds first delivers the answer. The other is immediately aborted. Zero waste.' },
              { icon: '🎯', step: '04', title: 'Precise Answer', desc: 'The bot answers strictly from your knowledge base. Off-topic questions are politely refused.' },
            ].map((s) => (
              <div key={s.step} className={styles.howCard}>
                <div className={styles.howStep}>{s.step}</div>
                <div className={styles.howIcon}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reuse Section ── */}
      <section className={styles.section} id="reuse">
        <div className={styles.container}>
          <div className={styles.secHead}>
            <span className={styles.secTag}>Reusable Component</span>
            <h2 className={styles.secTitle}>
              Copy. Paste. <span className={styles.gradient}>Done.</span>
            </h2>
            <p className={styles.secSub}>Drop the ChatWidget into any Next.js project in 5 steps.</p>
          </div>
          <div className={styles.stepsGrid}>
            {[
              { n: 1, t: 'Copy the component', d: 'Copy the ChatBot/ folder into your components/ project directory.' },
              { n: 2, t: 'Copy the API routes', d: 'Copy src/app/api/chat/ and src/app/api/train/ to your project.' },
              { n: 3, t: 'Add your knowledge', d: 'Create knowledge/website-data.md with your website information.' },
              { n: 4, t: 'Set API keys', d: 'Add GROQ_API_KEY and GEMINI_API_KEY to your .env.local file.' },
              { n: 5, t: 'Import and done', d: 'Add <ChatWidget botName="Your Bot" /> to your layout. That\'s it.' },
            ].map((s) => (
              <div key={s.n} className={styles.stepCard}>
                <span className={styles.stepN}>{s.n}</span>
                <div>
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>Built by Muhammad Anza Muneeb Khan · Smart Switch AI — Gemini × Groq</p>
          <p className={styles.footerSub}>Zero unnecessary packages · Fully portable · Open to reuse</p>
        </div>
      </footer>

      {/* ── Chatbot ── */}
      <ChatWidget botName="MyBot Assistant" />
    </main>
  );
}
