import { prisma } from "@/lib/db/prisma";
import { isAdminFromCookies } from "@/lib/admin/session";
import {
  adminLoginAction,
  adminLogoutAction,
  approveAccessRequestAction,
  rejectAccessRequestAction,
  directInviteAction,
  revokeAllowlistAction,
  reinstateAllowlistAction
} from "./actions";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function AdminPage() {
  const isAdmin = isAdminFromCookies();

  if (!isAdmin) {
    return (
      <main className="section">
        <div className="container panel" style={{ maxWidth: 520 }}>
          <h1>Admin</h1>
          <p className="muted">Enter the admin key to access the dashboard.</p>
          <form action={adminLoginAction} className="form-grid">
            <input className="input" name="admin_key" type="password" placeholder="Admin key" />
            <button className="btn btn-primary" type="submit">
              Sign in
            </button>
          </form>
        </div>
      </main>
    );
  }

  const [pending, approved, revoked] = await Promise.all([
    prisma.accessRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 200
    }),
    prisma.allowlistEntry.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 300
    }),
    prisma.allowlistEntry.findMany({
      where: { status: "revoked" },
      orderBy: { revokedAt: "desc" },
      take: 300
    })
  ]);

  return (
    <main className="section">
      <div className="container">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <h1>Admin dashboard</h1>
            <p className="muted">Pending requests, allowlist management, and direct invites.</p>
          </div>
          <form action={adminLogoutAction}>
            <button className="btn btn-ghost" type="submit">
              Sign out
            </button>
          </form>
        </header>

        <section className="section">
          <div className="panel">
            <h2>Direct invite</h2>
            <form action={directInviteAction} className="form-grid">
              <div className="split">
                <label className="field">
                  <span className="muted">Email</span>
                  <input className="input" name="email" type="email" />
                </label>
                <label className="field">
                  <span className="muted">Invitee type</span>
                  <select className="select" name="invitee_type">
                    <option value="physician">physician</option>
                    <option value="partner">partner</option>
                    <option value="investor">investor</option>
                    <option value="other">other</option>
                  </select>
                </label>
              </div>
              <div className="split">
                <label className="field">
                  <span className="muted">Invited by</span>
                  <input className="input" name="invited_by" />
                </label>
                <label className="field">
                  <span className="muted">Notes</span>
                  <input className="input" name="notes" />
                </label>
              </div>
              <label className="field">
                <span className="muted">
                  <input type="checkbox" name="notify" /> Send invite email
                </span>
              </label>
              <button className="btn btn-primary" type="submit">
                Add to allowlist
              </button>
            </form>
          </div>
        </section>

        <section className="section">
          <h2>Pending demo access requests ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="muted">No pending requests.</p>
          ) : (
            <div className="panel" style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Created</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Institution</th>
                    <th>Country/Region</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((row) => (
                    <tr key={row.id}>
                      <td>{fmt(row.createdAt)}</td>
                      <td>{row.fullName}</td>
                      <td>{row.email}</td>
                      <td>{row.role}</td>
                      <td>{row.institution}</td>
                      <td>{row.countryRegion}</td>
                      <td>
                        <div style={{ display: "grid", gap: 8 }}>
                          <form action={approveAccessRequestAction} className="form-grid">
                            <input type="hidden" name="request_id" value={row.id} />
                            <div className="split">
                              <select className="select" name="invitee_type">
                                <option value="physician">physician</option>
                                <option value="partner">partner</option>
                                <option value="investor">investor</option>
                                <option value="other">other</option>
                              </select>
                              <input className="input" name="reviewed_by" placeholder="Reviewed by" />
                            </div>
                            <input className="input" name="notes" placeholder="Notes (optional)" />
                            <label className="field">
                              <span className="muted">
                                <input type="checkbox" name="notify" defaultChecked /> Email approval
                              </span>
                            </label>
                            <button className="btn btn-primary" type="submit">
                              Approve
                            </button>
                          </form>
                          <form action={rejectAccessRequestAction} className="form-grid">
                            <input type="hidden" name="request_id" value={row.id} />
                            <input className="input" name="reviewed_by" placeholder="Reviewed by" />
                            <button className="btn btn-ghost" type="submit">
                              Reject
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="section">
          <h2>Allowlist - approved ({approved.length})</h2>
          <div className="panel" style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Approved</th>
                  <th>Last login</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.email}</td>
                    <td>{entry.inviteeType}</td>
                    <td>{entry.approvedAt ? fmt(entry.approvedAt) : "-"}</td>
                    <td>{entry.lastLoginAt ? fmt(entry.lastLoginAt) : "-"}</td>
                    <td>
                      <form action={revokeAllowlistAction} className="form-grid">
                        <input type="hidden" name="email" value={entry.email} />
                        <input className="input" name="reason" placeholder="Reason (optional)" />
                        <input className="input" name="revoked_by" placeholder="Revoked by" />
                        <label className="field">
                          <span className="muted">
                            <input type="checkbox" name="notify" /> Email user
                          </span>
                        </label>
                        <button className="btn btn-ghost" type="submit">
                          Revoke
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <h2>Allowlist - revoked ({revoked.length})</h2>
          <div className="panel" style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Revoked</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {revoked.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.email}</td>
                    <td>{entry.inviteeType}</td>
                    <td>{entry.revokedAt ? fmt(entry.revokedAt) : "-"}</td>
                    <td>
                      <form action={reinstateAllowlistAction} className="form-grid">
                        <input type="hidden" name="email" value={entry.email} />
                        <input className="input" name="invited_by" placeholder="Reinstated by" />
                        <button className="btn btn-primary" type="submit">
                          Reinstate
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
