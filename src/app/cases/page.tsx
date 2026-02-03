import Link from "next/link";
import { demoCases } from "@/lib/data/cases";

export default function CasesPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="panel" style={{ marginBottom: 24 }}>
          <span className="badge">Cases</span>
          <h1>Prototype cases</h1>
          <p className="muted">
            Select a case to explore the workflow. Some outputs may be simulated placeholders.
          </p>
          <p className="muted">Prototype platform for research and evaluation. Not medical advice. Not for emergency use.</p>
        </div>

        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Region</th>
                <th>Status</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {demoCases.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.region}</td>
                  <td>{item.status}</td>
                  <td>
                    <Link className="btn btn-ghost" href={`/viewer/${item.id}`}>
                      Open viewer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
