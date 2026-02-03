import Link from "next/link";
import { demoCases } from "@/lib/data/cases";

export default function ReportPage({ params }: { params: { caseId: string } }) {
  const caseItem = demoCases.find((item) => item.id === params.caseId);

  if (!caseItem) {
    return (
      <main className="section">
        <div className="container panel">
          <h1>Report not found</h1>
          <Link className="btn btn-ghost" href="/cases">
            Back to cases
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <div className="panel" style={{ marginBottom: 24 }}>
          <span className="badge">Report</span>
          <h1>Report view (prototype)</h1>
          <p className="muted">Case ID: {caseItem.id}</p>
          <p className="muted">Prototype platform for research and evaluation. Not medical advice. Not for emergency use.</p>
        </div>

        <div className="cards">
          <div className="card">
            <h3>Case overview</h3>
            <p className="muted">{caseItem.title}</p>
            <p className="muted">Region: {caseItem.region}</p>
          </div>
          <div className="card">
            <h3>Outputs summary</h3>
            <p className="muted">Prototype measurements and overlays for review.</p>
          </div>
          <div className="card">
            <h3>Measurements (prototype)</h3>
            <ul className="muted" style={{ marginLeft: 18 }}>
              <li>Example metric: 2.4 mm</li>
              <li>Example metric: 38% coverage</li>
              <li>Example metric: 0.9 similarity</li>
            </ul>
          </div>
          <div className="card">
            <h3>Observations</h3>
            <p className="muted">Placeholders for reviewer notes and context.</p>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn btn-ghost" href={`/viewer/${caseItem.id}`}>
            Back to viewer
          </Link>
          <Link className="btn btn-primary" href="/feedback">
            Submit feedback
          </Link>
        </div>
      </div>
    </main>
  );
}
