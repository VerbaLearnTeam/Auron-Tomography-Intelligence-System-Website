import ContactPartnershipsForm from "./ContactPartnershipsForm";
import ContactSupportForm from "./ContactSupportForm";

export default function ContactPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="panel" style={{ marginBottom: 24 }}>
          <span className="badge">Contact</span>
          <h1>Contact Auron</h1>
          <p className="muted">
            Reach out for partnerships, testing, or operational questions. Prototype platform for research and
            evaluation. Not medical advice. Not for emergency use.
          </p>
        </div>

        <div className="split">
          <div className="panel">
            <h2>Partnerships</h2>
            <p className="muted">Clinical validation, data collaboration, and technical integration.</p>
            <ContactPartnershipsForm />
          </div>
          <div className="panel">
            <h2>General or support</h2>
            <p className="muted">Questions about demo access or scan submissions.</p>
            <ContactSupportForm />
          </div>
        </div>
      </div>
    </main>
  );
}
