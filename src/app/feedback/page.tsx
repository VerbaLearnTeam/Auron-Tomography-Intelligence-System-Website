import FeedbackForm from "./FeedbackForm";

export default function FeedbackPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="panel" style={{ marginBottom: 24 }}>
          <span className="badge">Feedback</span>
          <h1>Help us improve the clinical workflow</h1>
          <p className="muted">
            Prototype platform for research and evaluation. Not medical advice. Not for emergency use.
          </p>
        </div>
        <div className="panel">
          <FeedbackForm />
        </div>
      </div>
    </main>
  );
}
