import DemoMagicLinkSignIn from "./DemoMagicLinkSignIn";
import DemoAccessRequestForm from "./DemoAccessRequestForm";

export const dynamic = "force-dynamic";

export default function DemoPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="panel" style={{ marginBottom: 24 }}>
          <span className="badge">Demo</span>
          <h1>Demo the Auron prototype workflow</h1>
          <p className="muted">
            Invite-only prototype for physician testers, partners, and investors. Prototype platform for research and
            evaluation. Not medical advice. Not for emergency use.
          </p>
        </div>

        <section className="section split">
          <div className="panel">
            <h2>Sign in (approved emails)</h2>
            <p className="muted">
              Enter your email to receive a magic sign-in link. If you arrived via an approval link, your email is
              pre-filled.
            </p>
            <DemoMagicLinkSignIn />
          </div>
          <div className="panel" id="request-access">
            <h2>Request demo access</h2>
            <p className="muted">
              If approved, you will receive an email when your address is whitelisted and you can sign in.
            </p>
            <DemoAccessRequestForm />
          </div>
        </section>
      </div>
    </main>
  );
}
