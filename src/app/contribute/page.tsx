import ContributeWizard from "./ContributeWizard";

export const dynamic = "force-dynamic";

export default function ContributePage() {
  const uploadLink = process.env.UPLOAD_LINK_URL || "#";

  return (
    <main className="section">
      <div className="container">
        <div className="panel" style={{ marginBottom: 24 }}>
          <span className="badge">Contribute scans</span>
          <h1>Contribute CT scans (paid) to support research development</h1>
          <p className="muted">
            If you have eligible imaging and the right to share it, you can submit raw DICOM files for review. If
            accepted for use, you will receive a prepaid card delivered via email.
          </p>
          <p className="muted">
            We accept raw DICOM immediately and de-identify after receipt. Prototype platform for research and
            evaluation. Not medical advice. Not for emergency use.
          </p>
        </div>

        <ContributeWizard uploadLink={uploadLink} />
      </div>
    </main>
  );
}
