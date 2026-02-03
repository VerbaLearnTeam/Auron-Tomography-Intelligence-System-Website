export default function PrivacyPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="panel">
          <span className="badge">Privacy</span>
          <h1>Privacy and data handling overview</h1>
          <p className="muted">
            Medical imaging is sensitive. Our prototype workflows are designed to minimize access, reduce exposure,
            and support de-identification after receipt of raw submissions.
          </p>
          <ul className="muted" style={{ marginTop: 16, marginLeft: 18 }}>
            <li>Access control and restricted internal handling.</li>
            <li>Separation between the marketing site and submission workflows.</li>
            <li>De-identification after receipt of raw DICOM submissions.</li>
            <li>Prototype platform for research and evaluation. Not medical advice. Not for emergency use.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
