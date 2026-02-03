import Link from "next/link";
import { demoCases } from "@/lib/data/cases";

export default function ViewerPage({ params }: { params: { caseId: string } }) {
  const caseItem = demoCases.find((item) => item.id === params.caseId);

  if (!caseItem) {
    return (
      <main className="section">
        <div className="container panel">
          <h1>Case not found</h1>
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
          <span className="badge">Viewer</span>
          <h1>{caseItem.title}</h1>
          <p className="muted">{caseItem.summary}</p>
          <p className="muted">Prototype platform for research and evaluation. Not medical advice. Not for emergency use.</p>
        </div>

        <div className="split">
          <div className="panel">
            <h3>Overlay controls</h3>
            <div className="form-grid">
              <label className="field">
                <span className="muted">Overlay</span>
                <select className="select">
                  <option>On</option>
                  <option>Off</option>
                </select>
              </label>
              <label className="field">
                <span className="muted">Opacity</span>
                <input className="input" type="range" min="0" max="100" defaultValue="70" />
              </label>
              <label className="field">
                <span className="muted">Structure</span>
                <select className="select">
                  <option>Vessel wall</option>
                  <option>Lumen</option>
                  <option>Plaque</option>
                </select>
              </label>
            </div>
          </div>
          <div className="panel" style={{ minHeight: 320 }}>
            <h3>Viewer canvas</h3>
            <div
              style={{
                marginTop: 12,
                height: 240,
                borderRadius: 16,
                border: "1px dashed rgba(148, 163, 184, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af"
              }}
            >
              Prototype viewer placeholder
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 24 }}>
          <h3>Summary (prototype)</h3>
          <ul className="muted" style={{ marginLeft: 18 }}>
            {caseItem.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn btn-ghost" href="/cases">
              Back to cases
            </Link>
            <Link className="btn btn-primary" href={`/report/${caseItem.id}`}>
              View report
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
