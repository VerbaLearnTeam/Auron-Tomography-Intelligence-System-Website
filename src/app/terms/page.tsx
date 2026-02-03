export default function TermsPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="panel">
          <span className="badge">Terms</span>
          <h1>Terms and disclaimers</h1>
          <p className="muted">
            This page summarizes key terms for prototype access and scan submissions. It is not medical advice.
          </p>
          <div className="cards" style={{ marginTop: 18 }}>
            <div className="card">
              <h3>Prototype disclaimer</h3>
              <p className="muted">
                The Auron prototype is provided for research evaluation and usability testing. It does not provide
                medical advice, diagnosis, or treatment, and it is not intended for emergency use.
              </p>
            </div>
            <div className="card">
              <h3>Raw DICOM submissions</h3>
              <p className="muted">
                Scan submissions may include personal medical information. By submitting, you acknowledge we may
                briefly handle identifiable data during intake and that we de-identify after receipt.
              </p>
            </div>
            <div className="card">
              <h3>Payment terms</h3>
              <p className="muted">
                If your submission is accepted for use, you will receive a prepaid card delivered via email. Acceptance
                is based on imaging quality and relevance to development needs.
              </p>
            </div>
            <div className="card">
              <h3>Confidentiality</h3>
              <p className="muted">
                Access to submissions is limited to authorized team members involved in intake and de-identification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
