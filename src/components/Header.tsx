import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <span className="logo-mark">
            <Image
              src="/logo.png"
              alt="Auron Intelligence"
              width={28}
              height={28}
              style={{ objectFit: "contain" }}
            />
          </span>
          <span className="logo-text">Auron Intelligence</span>
        </Link>
        <nav className="nav-links">
          <Link href="/platform">Platform</Link>
          <Link href="/demo">Demo</Link>
          <Link href="/team">Team</Link>
          <Link href="/contribute">Contribute Scans</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="nav-cta">
          <Link className="btn btn-outline" href="/contribute">
            Contribute Scans (Paid)
          </Link>
          <Link className="btn btn-primary" href="/demo">
            Request Demo Access
          </Link>
        </div>
      </div>
    </header>
  );
}
