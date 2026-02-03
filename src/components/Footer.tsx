import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-logo">
            <Image
              src="/logo.png"
              alt="Auron Intelligence"
              width={32}
              height={32}
              style={{ objectFit: "contain", marginRight: 10 }}
            />
            Auron Intelligence
          </div>
          <p className="muted">
            Arterial CT intelligence. Prototype platform for research and evaluation. Not medical advice. Not for
            emergency use.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/security">Security</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Auron Intelligence. All rights reserved.</div>
    </footer>
  );
}
