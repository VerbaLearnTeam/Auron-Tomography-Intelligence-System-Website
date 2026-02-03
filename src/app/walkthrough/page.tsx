import Link from "next/link";

export default function WalkthroughPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="panel" style={{ marginBottom: 24 }}>
          <span className="badge">Walkthrough</span>
          <h1>Guided prototype walkthrough</h1>
          <p className="muted">
            You will explore the platform in a short sequence: cases → viewer → overlays → report → feedback.
          </p>
          <p className="muted">Prototype platform for research and evaluation. Not medical advice. Not for emergency use.</p>
        </div>
        <div className="cards">
          <div className="card">
            <h3>1. Select a case</h3>
            <p className="muted">Choose a sample arterial CT case to explore the workflow.</p>
          </div>
          <div className="card">
            <h3>2. Review overlays</h3>
            <p className="muted">Toggle segmentation overlays and review prototype measurements.</p>
          </div>
          <div className="card">
            <h3>3. Read the report</h3>
            <p className="muted">See a report-style summary suitable for evaluation and iteration.</p>
          </div>
          <div className="card">
            <h3>4. Leave feedback</h3>
            <p className="muted">Share what felt most useful and what is missing.</p>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <Link className="btn btn-primary" href="/cases">
            Start walkthrough
          </Link>
        </div>
      </div>
    </main>
  );
}
