import Link from "next/link";

export default function PlatformPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="panel" style={{ marginBottom: 24 }}>
          <span className="badge">Platform</span>
          <h1>A workflow designed for arterial CT evaluation</h1>
          <p className="muted">
            Auron is building an interactive experience that brings ingestion, visualization, and quantitative review
            into one coherent prototype workflow.
          </p>
          <p className="muted">Prototype platform for research and evaluation. Not medical advice. Not for emergency use.</p>
        </div>

        <section className="section">
          <h2>How it works (prototype stage)</h2>
          <div className="cards">
            <div className="card">
              <h3>Intake and quality checks</h3>
              <p className="muted">We receive imaging data and confirm format consistency and usability.</p>
            </div>
            <div className="card">
              <h3>Segmentation pipeline</h3>
              <p className="muted">Arterial structures are segmented and prepared for interactive viewing.</p>
            </div>
            <div className="card">
              <h3>Interactive review</h3>
              <p className="muted">Users explore overlays and outputs in a viewer designed for rapid navigation.</p>
            </div>
            <div className="card">
              <h3>Structured outputs</h3>
              <p className="muted">The system summarizes findings into report-style outputs for evaluation.</p>
            </div>
          </div>
          <p className="muted" style={{ marginTop: 12 }}>
            Outputs shown in the prototype may be simulated or partially automated depending on case readiness.
          </p>
        </section>

        <section className="section split">
          <div>
            <h2>What physician testers can evaluate</h2>
            <ul className="muted" style={{ marginLeft: 18 }}>
              <li>Whether the UI matches clinical review instincts.</li>
              <li>Whether overlays are presented clearly and controllably.</li>
              <li>Whether the report view answers the questions you would actually ask.</li>
              <li>Where the workflow feels slow, confusing, or missing context.</li>
            </ul>
            <Link className="btn btn-primary" href="/demo" style={{ marginTop: 16, display: "inline-flex" }}>
              Request Demo Access
            </Link>
          </div>
          <div className="panel">
            <h3>Current focus</h3>
            <p className="muted">
              We are focused on arterial CT intelligence and building prototypes that support real-world validation.
              Specific partner programs are kept private until formalized.
            </p>
            <h3 style={{ marginTop: 18 }}>Data handling principles</h3>
            <ul className="muted" style={{ marginLeft: 18 }}>
              <li>Access control and least-privilege internal handling.</li>
              <li>Separation of the public marketing site from submission workflows.</li>
              <li>De-identification after receipt of raw DICOM submissions.</li>
            </ul>
            <Link className="btn btn-ghost" href="/privacy" style={{ marginTop: 12, display: "inline-flex" }}>
              Read privacy overview
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
