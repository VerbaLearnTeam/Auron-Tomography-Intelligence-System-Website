const team = [
  {
    name: "Clinical Lead",
    role: "Clinical validation",
    focus: "Imaging review and protocol design",
    bio: "Leads clinical evaluation and ensures prototype workflows align with real-world review patterns."
  },
  {
    name: "ML Engineering Lead",
    role: "Machine learning",
    focus: "Segmentation and modeling",
    bio: "Builds arterial segmentation pipelines and the data workflow used in the prototype."
  },
  {
    name: "Product & Ops",
    role: "Operations",
    focus: "Testing and partnerships",
    bio: "Coordinates tester onboarding, data intake, and prototype feedback loops."
  },
  {
    name: "Research Engineer",
    role: "Engineering",
    focus: "Viewer and reporting UX",
    bio: "Develops the interactive prototype experience and reporting surfaces."
  },
  {
    name: "Data Steward",
    role: "Data handling",
    focus: "Intake and de-identification",
    bio: "Oversees raw DICOM intake workflows and post-receipt de-identification procedures."
  },
  {
    name: "Clinical Advisor",
    role: "Advisory",
    focus: "Arterial imaging expertise",
    bio: "Advises on clinical priorities and helps validate prototype outputs."
  }
];

export default function TeamPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="panel" style={{ marginBottom: 24 }}>
          <span className="badge">Team</span>
          <h1>The team behind Auron</h1>
          <p className="muted">
            An international group spanning clinical expertise, machine learning, and healthcare operations. Partner
            institutions are kept private until formalized.
          </p>
        </div>
        <div className="cards">
          {team.map((member) => (
            <div className="card" key={member.name}>
              <h3>{member.name}</h3>
              <p className="muted">Role: {member.role}</p>
              <p className="muted">Focus: {member.focus}</p>
              <p className="muted">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
