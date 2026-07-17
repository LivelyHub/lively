function PrivacyPage() {
  return (
    <div id="top">
      <header className="legal-bar">
        <a className="brand" href="/" aria-label="Lively, back to the landing page">
          <img className="brand__logo" src="/logo.png" alt="" width={32} height={32} />
          Lively
        </a>
        <a className="link-cta" href="/">
          Back to the site →
        </a>
      </header>

      <main className="section legal">
        <span className="mono-label">Effective 17 July 2026</span>
        <h1>Privacy policy</h1>
        <p className="legal__lede">
          This page explains what data the Lively landing site collects and
          why. The short version: we count visits so we can tell whether the
          page works, and that is it.
        </p>

        <h2>What this policy covers</h2>
        <p>
          This policy covers the Lively landing website only. The Lively
          product itself, the WhatsApp companion and the family app, handles
          health-related conversations and is covered by its own terms shared
          with pilot participants directly.
        </p>

        <h2>Analytics</h2>
        <p>
          We use analytics for one purpose: understanding how the page is
          used so we can improve it. The data we look at is aggregate and
          includes:
        </p>
        <ul>
          <li>Pages viewed and time of visit</li>
          <li>The site that referred you here</li>
          <li>Browser family, device type, and screen size</li>
          <li>Country-level location, derived from your IP address</li>
        </ul>
        <p>
          We do not use analytics cookies, we do not build visitor profiles,
          and we do not track you across other websites. IP addresses are used
          transiently to derive the country and are not stored with the
          analytics data we review.
        </p>

        <h2>What we do not collect</h2>
        <p>
          The landing site has no accounts, no sign-up forms, and no payment
          flows. We never receive your name, phone number, email address, or
          any health information through this site.
        </p>

        <h2>Third parties</h2>
        <p>
          The page loads its typefaces from Google Fonts. When your browser
          requests those font files, Google receives your IP address as part
          of the request, as it would for any file served from their servers.
          See Google's own privacy policy for how they handle it.
        </p>

        <h2>Retention</h2>
        <p>
          Aggregate analytics are kept for as long as we run the project so we
          can compare traffic over time. Because the data is aggregate, it
          cannot be traced back to you, and there is nothing to delete on a
          per-person basis.
        </p>

        <h2>Your choices</h2>
        <p>
          If you block analytics with a browser extension or your browser's
          built-in protections, the site works exactly the same. Nothing on
          the page depends on analytics loading.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy go to{' '}
          <a href="mailto:darrenharyanto@gmail.com">darrenharyanto@gmail.com</a>.
          We answer fastest during hackathon season, which is always.
        </p>

        <h2>Changes</h2>
        <p>
          If we change how the site handles data, for example by adding a
          different analytics tool, we will update this page and the effective
          date at the top before the change goes live.
        </p>
      </main>

      <footer className="foot-marquee" aria-label="Footer">
        <p className="foot-meta">
          <span>Lively · Garuda Hacks 7.0 · Health track</span>
          <span>MIT licensed</span>
        </p>
      </footer>
    </div>
  )
}

export default PrivacyPage
