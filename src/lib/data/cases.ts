export type DemoCase = {
  id: string;
  title: string;
  region: string;
  status: "Prototype" | "Partial" | "Example";
  summary: string;
  highlights: string[];
};

export const demoCases: DemoCase[] = [
  {
    id: "AUR-CTA-001",
    title: "Carotid bifurcation review",
    region: "Head & neck (arterial)",
    status: "Prototype",
    summary: "Prototype overlay showing lumen and vessel wall segmentation.",
    highlights: [
      "Overlay opacity control",
      "Region-focused summary metrics",
      "Notes capture for clinical feedback"
    ]
  },
  {
    id: "AUR-CTA-002",
    title: "Coronary arterial workflow",
    region: "Coronary (arterial)",
    status: "Partial",
    summary: "Partial pipeline output used to validate navigation and UI.",
    highlights: ["Case list → viewer → report flow", "Prototype report layout", "Feedback prompt"]
  },
  {
    id: "AUR-CTA-003",
    title: "Peripheral arterial assessment",
    region: "Other arterial region",
    status: "Example",
    summary: "Illustrative example with simulated measurements for usability testing.",
    highlights: ["Before/after toggle", "Measurement panel", "Export-ready layout stub"]
  },
  {
    id: "AUR-CTA-004",
    title: "Arterial plaque hotspot pass",
    region: "Head & neck (arterial)",
    status: "Example",
    summary: "Simulated hotspot markers for review workflow evaluation.",
    highlights: ["Hotspot markers", "Narrative summary", "Reviewer checklist"]
  }
];
