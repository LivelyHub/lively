import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// TODO(day 1): swap these for the real demo-video and repo URLs before submitting.
const DEMO_URL = '#demo'
const REPO_URL = 'https://github.com/OkToRen/lively-landing'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Star-burst micro-celebration on the primary CTA (fires once per click). */
function burst(e: MouseEvent<HTMLAnchorElement>) {
  if (prefersReducedMotion()) return
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const star = document.createElement('span')
  star.className = 'star-burst'
  star.setAttribute('aria-hidden', 'true')
  star.style.left = `${e.clientX - rect.left - 12}px`
  star.style.top = `${e.clientY - rect.top - 12}px`
  btn.appendChild(star)
  setTimeout(() => star.remove(), 460)
}

/** N12 — banner retracts on scroll-down, returns on scroll-up, dismissible. */
function Nav() {
  const [compact, setCompact] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > 48 && y > lastY.current) setCompact(true)
      else if (y < lastY.current || y <= 48) setCompact(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const dismiss = () => {
    document.documentElement.style.setProperty('--banner-h', '0px')
    setDismissed(true)
  }

  return (
    <header
      className={`nav${compact && !dismissed ? ' is-compact' : ''}${dismissed ? ' is-dismissed' : ''}`}
    >
      <div className="nav__banner">
        <p className="nav__banner-text">
          Built at Garuda Hacks 7.0 · Health track ·{' '}
          <a href={DEMO_URL}>watch the demo →</a>
        </p>
        <button
          type="button"
          className="nav__banner-x"
          aria-label="Dismiss announcement"
          onClick={dismiss}
        >
          ×
        </button>
      </div>
      <div className="nav__bar">
        <div className="nav__bar-inner">
          <a className="brand" href="#top" aria-label="Lively, back to top">
            <img
              className="brand__logo"
              src="/logo.png"
              alt=""
              width={32}
              height={32}
            />
            Lively
          </a>
          <nav className="nav__links" aria-label="Sections">
            <a className="nav__link" href="#how">
              How it works
            </a>
            <a className="nav__link" href="#companions">
              Companions
            </a>
            <a className="btn btn--sm" href="#judges">
              For judges
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

/** Streak counter — ticks up from 0 on view-enter, once. Sample product data. */
function Streak() {
  const numRef = useRef<HTMLSpanElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const played = useRef(false)
  const target = 12

  useEffect(() => {
    const el = numRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played.current) return
        played.current = true
        io.disconnect()
        if (prefersReducedMotion()) {
          el.textContent = String(target)
          return
        }
        const t0 = performance.now()
        const dur = 1200
        const ease = (t: number) => 1 - Math.pow(1 - t, 4)
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / dur)
          el.textContent = String(Math.round(ease(p) * target))
          if (p < 1) requestAnimationFrame(tick)
          else cardRef.current?.classList.add('is-done')
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="streak duo__proof" ref={cardRef}>
      <span className="mono-label">Ibu Sri · day streak</span>
      <div className="streak__num-wrap">
        <span className="streak__num" ref={numRef} aria-hidden="true">
          0
        </span>
        <span className="visually-hidden">{target}</span>
        <span className="streak__unit">days</span>
      </div>
      <div className="streak__week" role="img" aria-label="Six of seven days done this week">
        {[1, 1, 1, 1, 1, 1, 0].map((done, i) => (
          <span key={i} className={`streak__day${done ? '' : ' streak__day--off'}`} />
        ))}
      </div>
      <span className="alert">Ibu mentioned knee pain · read the chat</span>
    </div>
  )
}

function App() {
  return (
    <div id="top">
      <Nav />

      <main>
        {/* Hero — H2 split diptych, 7/5, proof = chat card */}
        <section className="section hero">
          <div className="hero__copy">
            <h1 className="reveal" style={{ '--i': 0 } as React.CSSProperties}>
              Five minutes of strength, <span className="hl">sent as a text.</span>
            </h1>
            <p className="hero__lede reveal" style={{ '--i': 1 } as React.CSSProperties}>
              Lively coaches Indonesian elders through a short daily strength
              routine over WhatsApp, the app they already open every day. No
              install, no account, no new interface to learn. Family follows
              along from their own phone.
            </p>
            <div className="hero__ctas reveal" style={{ '--i': 2 } as React.CSSProperties}>
              <a className="btn" href={DEMO_URL} onClick={burst}>
                Watch the demo
              </a>
              <a className="link-cta" href={REPO_URL}>
                Browse the repo →
              </a>
            </div>
          </div>
          <figure
            className="chat reveal"
            style={{ '--i': 3, margin: 0 } as React.CSSProperties}
            aria-label="Sample WhatsApp conversation between Mbak Asih and an elder"
          >
            <div className="chat__head">
              <span className="mono-label">Chat · Mbak Asih</span>
              <span className="mono-label">07:30</span>
            </div>
            <p className="bubble bubble--in">
              Selamat pagi, Bu Sri! Sudah siap latihan 5 menit hari ini? Kita
              mulai dari duduk-berdiri, pelan-pelan saja.
              <span className="bubble__time">07:30</span>
            </p>
            <p className="bubble bubble--out">
              Siap, Asih. Mulai ya.
              <span className="bubble__time">07:31</span>
            </p>
            <p className="bubble bubble--in">
              Hebat, Bu! Itu hari ke-12 berturut-turut. Nanti siang jangan lupa
              obat tekanan darahnya, ya.
              <span className="bubble__time">07:38</span>
            </p>
          </figure>
        </section>

        {/* Problem — proof left, text right */}
        <section className="section section--band band--green" id="problem">
          <div>
            <header className="head-hang">
              <h2>Elders don’t install apps.</h2>
            </header>
            <div className="duo">
              <div className="steps duo__proof">
                <div>
                  <span className="mono-label">To use a health app</span>
                  <ol>
                    <li>Find the app store</li>
                    <li>Create an account</li>
                    <li>Verify an email address</li>
                    <li>Learn a new interface</li>
                    <li>Remember to open it, daily</li>
                  </ol>
                </div>
                <hr className="steps__divider" />
                <div>
                  <span className="mono-label">To use Lively</span>
                  <p className="steps__one">Reply to a message.</p>
                </div>
              </div>
              <div className="duo__text">
                <p>
                  Indonesia is ageing, and the health-literacy gap between
                  urban and rural families keeps widening. The elders who most
                  need daily strength work are the least likely to install
                  anything new. But they already text, every day, on WhatsApp.
                  Lively meets them there.
                </p>
                <p>
                  The coaching isn’t vibes: it’s built around the 30-second
                  Chair Stand test, a standard fall-risk assessment, turned
                  into a five-minute daily routine.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works — two alternating diptychs */}
        <section className="section" id="how">
          <header className="head-hang">
            <h2>Two sides, one habit.</h2>
            <p>The elder texts. The family watches the streak grow.</p>
          </header>

          <div className="duo">
            <div className="day duo__proof">
              <span className="mono-label">A day with Lively</span>
              <div className="day__row">
                <span className="day__time">07:30</span>
                <span className="day__what">
                  <b>Latihan.</b> Five minutes of chair stands, counted rep by
                  rep in plain Indonesian.
                </span>
              </div>
              <div className="day__row">
                <span className="day__time">12:00</span>
                <span className="day__what">
                  <b>Obat.</b> A medicine reminder that reads like a text from
                  family, not a notification.
                </span>
              </div>
              <div className="day__row">
                <span className="day__time">17:00</span>
                <span className="day__what">
                  <b>Kabar.</b> A check-in question: how the knees feel, how
                  the day went.
                </span>
              </div>
            </div>
            <div className="duo__text">
              <span className="mono-label duo__kicker">For elders</span>
              <h3>Pure WhatsApp. Texts that feel human.</h3>
              <p>
                No links to tap, no menus, no tiny buttons. The companion
                writes like a person, waits like a person, and celebrates
                day 12 like it matters. Because it does.
              </p>
            </div>
          </div>

          <div className="duo duo--flip">
            <Streak />
            <div className="duo__text">
              <span className="mono-label duo__kicker">For family</span>
              <h3>The streak is the game. And the signal.</h3>
              <p>
                The Lively app is where family sets up the companion, follows
                progress, and reads the chat. Every completed session feeds a
                streak the whole family can see: gentle, visible, shared.
              </p>
              <p>
                And when something is off, when the chat goes quiet or pain
                comes up, the family gets a safety alert instead of finding
                out weeks later.
              </p>
            </div>
          </div>
        </section>

        {/* Companions — F6 2-up color-shift cards */}
        <section className="section section--band band--lavender" id="companions">
          <div>
            <header className="head-hang">
              <h2>Pick who does the texting.</h2>
            </header>
            <div className="companions">
              <article className="companion">
                <span className="mark" aria-hidden="true" />
                <h3>Mbak Asih</h3>
                <p>
                  Warm and patient. Checks in like a favourite niece, never
                  rushes a rep, and remembers what you told her yesterday.
                </p>
              </article>
              <article className="companion companion--budi">
                <span className="mark mark--budi" aria-hidden="true" />
                <h3>Mas Budi</h3>
                <p>
                  Brisk and cheerful. Counts your chair stands out loud and
                  treats every finished session like a small win. His too.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section cta" id="judges">
          <div className="cta__inner">
            <h2>Judges, press play.</h2>
            <p>
              Three minutes: the elder’s WhatsApp, the family app, and the
              fall-risk assessment behind both.
            </p>
            <div className="cta__buttons">
              <a className="btn" href={DEMO_URL} onClick={burst}>
                Watch the demo
              </a>
              <a className="btn btn--outline" href={REPO_URL}>
                Read the repo
              </a>
            </div>
            <p className="cta__aside">
              Built in one weekend. The bot replies faster than we do.
            </p>
          </div>
        </section>
      </main>

      {/* Footer — Ft8 marquee */}
      <footer className="foot-marquee" aria-label="Footer">
        <div className="foot-marquee__track" aria-hidden="true">
          <span>
            LIVELY · GARUDA HACKS 7.0 · HEALTH TRACK · LIVELY · GARUDA HACKS
            7.0 · HEALTH TRACK ·
          </span>
          <span>
            LIVELY · GARUDA HACKS 7.0 · HEALTH TRACK · LIVELY · GARUDA HACKS
            7.0 · HEALTH TRACK ·
          </span>
        </div>
        <p className="foot-meta">
          <span>Lively · Garuda Hacks 7.0 · Health track</span>
          <span>MIT licensed</span>
        </p>
      </footer>
    </div>
  )
}

export default App
