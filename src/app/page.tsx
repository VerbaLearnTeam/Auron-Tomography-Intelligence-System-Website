import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="badge">Arterial CT intelligence</span>
            <h1>Arterial CT intelligence for fast, consistent vascular review.</h1>
            <p>
              Auron Intelligence is building a prototype platform that turns arterial CT imaging into interactive
              segmentation, measurements, and review-ready outputs.
            </p>
            <div className="nav-cta" style={{ marginBottom: 18 }}>
              <Link className="btn btn-primary" href="/demo">
                Request Demo Access
              </Link>
              <Link className="btn btn-outline" href="/contribute">
                Contribute Scans (Paid)
              </Link>
            </div>
            <p className="muted">
              Prototype platform for research and evaluation. Not medical advice. Not for emergency use.
            </p>
          </div>
          <div className="hero-card">
            <h3>Invite-only prototype walkthrough</h3>
            <p className="muted">
              Testers can explore the workflow end to end: case list, viewer overlays, report summary, and feedback.
            </p>
            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <div className="panel animate-fade-in-up delay-3">
                <strong>What you will see</strong>
                <p className="muted">
                  Guided walkthrough, case navigation, overlay controls, and report-style outputs.
                </p>
              </div>
              <div className="panel animate-fade-in-up delay-4">
                <strong>Data handling</strong>
                <p className="muted">
                  Raw DICOM accepted immediately for contribution. De-identification occurs after receipt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>What Auron does</h2>
          <p className="muted">
            We are building a workflow that helps teams move from raw arterial CT imaging to structured outputs with
            less manual friction and more consistent review.
          </p>
          <div className="cards">
            <div className="card animate-fade-in-up delay-1" style={{ opacity: 0 }}>
              <h3>Ingest and organize</h3>
              <p className="muted">Bring arterial CT data into a controlled intake pipeline for iteration.</p>
            </div>
            <div className="card animate-fade-in-up delay-2" style={{ opacity: 0 }}>
              <h3>Segment and visualize</h3>
              <p className="muted">Generate vessel and lesion overlays for interactive exploration.</p>
            </div>
            <div className="card animate-fade-in-up delay-3" style={{ opacity: 0 }}>
              <h3>Quantify and review</h3>
              <p className="muted">Surface structured outputs and measurements for evaluation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="animate-fade-in-up" style={{ opacity: 0 }}>
            <h2>Why arterial CT intelligence matters</h2>
            <p className="muted">
              Arterial disease review is high-impact and time-intensive. Our goal is to deliver a reliable, navigable
              prototype so clinical teams and partners can evaluate the workflow early.
            </p>
          </div>
          <div className="panel animate-fade-in-up delay-2" style={{ opacity: 0 }}>
            <h3>Prototype transparency</h3>
            <p className="muted">
              Outputs shown in the demo may be simulated or partial while we continue to refine data and models.
            </p>
            <p className="muted">Prototype platform for research and evaluation. Not medical advice. Not for emergency use.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="animate-fade-in-up" style={{ opacity: 0 }}>
            <h2>Built by an international team</h2>
            <p className="muted">
              Auron is an international group of doctors, machine learning experts, healthcare operators, and student
              builders focused on arterial CT intelligence.
            </p>
            <Link className="btn btn-ghost" href="/team">
              Meet the team
            </Link>
          </div>
          <div className="panel animate-fade-in-up delay-2" style={{ opacity: 0 }}>
            <h3>Contribute scans (paid)</h3>
            <p className="muted">
              If you have eligible arterial CT imaging and the right to share it, submit raw DICOM for review. If
              accepted for use, you will receive a prepaid card delivered via email.
            </p>
            <Link className="btn btn-outline" href="/contribute">
              Start submission
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container panel animate-scale-in" style={{ textAlign: "center", opacity: 0 }}>
          <h2>Request access or contribute data</h2>
          <p className="muted">Invite-only demo access. Raw DICOM accepted immediately for contribution.</p>
          <div className="nav-cta" style={{ justifyContent: "center" }}>
            <Link className="btn btn-primary" href="/demo">
              Request Demo Access
            </Link>
            <Link className="btn btn-outline" href="/contribute">
              Contribute Scans (Paid)
            </Link>
            <Link className="btn btn-ghost" href="/contact">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
