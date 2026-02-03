export default function SecurityPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="panel">
          <span className="badge">Security</span>
          <h1>Security overview (high level)</h1>
          <p className="muted">
            We apply security practices appropriate for a prototype and controlled testing environment. This page is a
            high-level overview.
          </p>
          <ul className="muted" style={{ marginTop: 16, marginLeft: 18 }}>
            <li>Invite-only demo access via email whitelist.</li>
            <li>Least-privilege internal access controls.</li>
            <li>Separate environments for marketing and submission workflows.</li>
            <li>Ongoing improvements as the platform scales.</li>
          </ul>
          <p className="muted" style={{ marginTop: 12 }}>
            Prototype platform for research and evaluation. Not medical advice. Not for emergency use.
          </p>
        </div>
      </div>
    </main>
  );
}
