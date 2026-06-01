import type { Segment } from "@/components/SegmentedControl";
import type { TeamMember } from "@/components/TeamShowcase";
import type { CarouselItem } from "@/components/RulerCarousel";

export type ChamberRailItem = {
  label: string;
  value: string;
};

export type ChamberIntroData = {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  railItems: ChamberRailItem[];
};

export type ProcessStepData = {
  id: string;
  num: string;
  label: string;
  tagline: string;
  body: string;
  tags: string[];
  stateLabel: string;
  stateValue: string;
  statusLine: string;
};

export const HOMEPAGE_ACHIEVEMENTS: CarouselItem[] = [
  {
    id: 1,
    badge: "Runner-up · 2nd Place",
    title: "NHA Hackathon — Problem Statement 2",
    subtitle: "National Health Authority",
    description:
      "Radiological image-based correlation — built an AI pipeline to detect anomalies across radiology scans, correlating findings across modalities to surface fraud patterns in health claim submissions.",
    year: "2026",
    meta: "PS-02 · Radiology",
    recordId: "ARC-PS02-2026",
    authority: "NHA VERIFIED",
    recordStatus: "FILE OPENED",
  },
  {
    id: 2,
    badge: "3rd Place",
    title: "NHA Hackathon — Problem Statement 3",
    subtitle: "National Health Authority",
    description:
      "Document forgery detection — engineered a multi-modal verification system to identify tampered or forged medical documents, combining OCR, layout analysis, and anomaly scoring.",
    year: "2026",
    meta: "PS-03 · Document Integrity",
    recordId: "ARC-PS03-2026",
    authority: "NHA VERIFIED",
    recordStatus: "SEALED RECORD",
  },
  {
    id: 3,
    badge: "Coming Soon",
    title: "More Achievements Incoming",
    subtitle: "Kantaka Śodhana",
    description:
      "We are actively competing, publishing, and deploying. Watch this space.",
    year: "2026–",
    meta: "TBA",
    recordId: "ARC-NEXT-2026",
    authority: "PENDING ENTRY",
    recordStatus: "AWAITING FILING",
  },
];

export const HOMEPAGE_TEAM_MEMBERS: TeamMember[] = [
  { id: "1", name: "Member 1", role: "Founder & CEO", image: "", unitCode: "KS-01", mission: "Systems command across fraud-response strategy and platform direction.", capability: "Fraud strategy" },
  { id: "2", name: "Member 2", role: "CTO", image: "", unitCode: "KS-02", mission: "Infrastructure control for deployment, resilience, and backend systems.", capability: "Platform engineering" },
  { id: "3", name: "Member 3", role: "ML Engineer", image: "", unitCode: "KS-03", mission: "Model tuning, anomaly correlation, and inference pipeline behavior.", capability: "Model intelligence" },
  { id: "4", name: "Member 4", role: "Full-Stack Developer", image: "", unitCode: "KS-04", mission: "Frontend-to-backend integration and operator-facing workflow delivery.", capability: "Interface systems" },
  { id: "5", name: "Member 5", role: "Data Scientist", image: "", unitCode: "KS-05", mission: "Evidence preparation, feature analysis, and signal interpretation.", capability: "Data forensics" },
  { id: "6", name: "Member 6", role: "DevOps Engineer", image: "", unitCode: "KS-06", mission: "Runtime governance, observability, and incident rollback control.", capability: "Runtime governance" },
];

export const STACK_SEGMENTS: Segment[] = [
  { id: "data", label: "Data Pipelines" },
  { id: "training", label: "Training" },
  { id: "deployment", label: "Deployment" },
];

export const STACK_CONTENT: Record<
  string,
  { tech: string; items: { name: string; desc: string }[] }
> = {
  data: {
    tech: "Kafka · Airflow · DVC",
    items: [
      { name: "Kafka", desc: "Real-time event streaming at millions of events/sec with sub-10ms latency." },
      { name: "Airflow", desc: "Orchestrated ETL DAGs with dependency resolution, retries, and alerting." },
      { name: "DVC", desc: "Data version control — reproducible pipelines, dataset lineage, remote storage." },
    ],
  },
  training: {
    tech: "MLflow · Ray Tune · PyTorch",
    items: [
      { name: "MLflow", desc: "Experiment tracking, model registry, and artifact management across runs." },
      { name: "Ray Tune", desc: "Distributed hyperparameter optimization across GPU clusters with ASHA scheduler." },
      { name: "PyTorch", desc: "Custom architectures for tabular fraud detection, vision, and document AI." },
    ],
  },
  deployment: {
    tech: "BentoML · KServe · Kubernetes",
    items: [
      { name: "BentoML", desc: "Packaged inference services with built-in batching and model versioning." },
      { name: "KServe", desc: "Serverless inference on Kubernetes — autoscaling, canary rollouts, A/B testing." },
      { name: "Kubernetes", desc: "Container orchestration with Prometheus + Grafana monitoring and drift detection." },
    ],
  },
};

export const HOMEPAGE_PROCESS_STEPS: ProcessStepData[] = [
  {
    id: "ingest",
    num: "01",
    label: "Ingest",
    tagline: "Any source. Real-time.",
    body: "Kafka streams at millions of events/sec with sub-10ms latency. Airflow orchestrates ETL DAGs. DVC versions every dataset snapshot — full reproducibility from raw event to feature vector.",
    tags: ["Kafka", "Airflow", "DVC"],
    stateLabel: "Ingress State",
    stateValue: "Stream Captured",
    statusLine: "INGESTION CHANNEL ONLINE",
  },
  {
    id: "detect",
    num: "02",
    label: "Detect",
    tagline: "Sub-50ms. Explainable.",
    body: "PyTorch models served via BentoML with auto-batching for throughput. SHAP values computed inline — every prediction ships with its reasoning. Ray Tune searches for better models in the background.",
    tags: ["BentoML", "PyTorch", "SHAP"],
    stateLabel: "Threat Signal",
    stateValue: "Flagged",
    statusLine: "ANOMALY CORRELATION ENGAGED",
  },
  {
    id: "trace",
    num: "03",
    label: "Trace",
    tagline: "Full lineage. Always.",
    body: "MLflow logs every experiment, metric, and artifact. You can always answer: what data trained this model, what version is live, and why did it fire on that event.",
    tags: ["MLflow", "DVC", "Lineage"],
    stateLabel: "Chain Of Custody",
    stateValue: "Verified",
    statusLine: "LINEAGE GRAPH RESOLVED",
  },
  {
    id: "govern",
    num: "04",
    label: "Govern",
    tagline: "Drift detected. Auto-rollback.",
    body: "Prometheus + Grafana monitor model performance in real time. Automated rollback fires when metrics degrade past threshold. KServe canary deployments test new versions on 5% traffic before full release.",
    tags: ["Prometheus", "KServe", "Grafana"],
    stateLabel: "Control Surface",
    stateValue: "Guarded",
    statusLine: "POLICY ENFORCEMENT ARMED",
  },
];

export const HOMEPAGE_CHAMBERS: Record<string, ChamberIntroData> = {
  process: {
    id: "process",
    index: "01",
    eyebrow: "Chamber 01 // Evidence Flow",
    title: "The Process",
    description: "Live forensic routing from ingest to governed response. The board stays operational, but the framing now reads like an active trace room instead of a polite feature section.",
    railItems: [
      { label: "State", value: "Active Trace" },
      { label: "Mode", value: "Biometric" },
      { label: "Uptime", value: "24/7" },
    ],
  },
  stack: {
    id: "stack",
    index: "02",
    eyebrow: "Chamber 02 // Systems Registry",
    title: "What We Build",
    description: "Each subsystem is still the same stack content, but the chamber now reads like a classified systems matrix instead of ordinary tabs on a product page.",
    railItems: [
      { label: "Registry", value: "Loaded" },
      { label: "Scope", value: "Pipeline" },
      { label: "Surface", value: "Structured" },
    ],
  },
  wins: {
    id: "wins",
    index: "03",
    eyebrow: "Chamber 03 // Verified Records",
    title: "Achievements",
    description: "Recognition stays in the same module, but the surrounding language and pacing present it as filed evidence rather than a generic carousel of wins.",
    railItems: [
      { label: "Archive", value: "Indexed" },
      { label: "Authority", value: "NHA" },
      { label: "Status", value: "Filed" },
    ],
  },
  useCases: {
    id: "use-cases",
    index: "04",
    eyebrow: "Chamber 04 // Classified Archive",
    title: "Use Cases",
    description: "Real-world deployments where fraud was identified, traced, and neutralized. Each dossier represents a live operation — from incident detection to governed resolution.",
    railItems: [
      { label: "Scope", value: "Multi-Sector" },
      { label: "Status", value: "Active" },
      { label: "Clearance", value: "Verified" },
    ],
  },
  team: {
    id: "team",
    index: "05",
    eyebrow: "Chamber 05 // Operating Unit",
    title: "Our Team",
    description: "Same team element, stronger worldbuilding. Operators are framed as part of the system, not as a detached About page.",
    railItems: [
      { label: "Personnel", value: "6 Units" },
      { label: "Mission", value: "Shared" },
      { label: "Status", value: "Ready" },
    ],
  },
  contact: {
    id: "contact",
    index: "06",
    eyebrow: "Chamber 06 // Secure Channel",
    title: "Initiate Contact",
    description: "The form remains functional, but the chamber now behaves like a transmission point rather than the place where the narrative gives up and becomes ordinary UI.",
    railItems: [
      { label: "Channel", value: "Secure" },
      { label: "Priority", value: "High" },
      { label: "Response", value: "<24h" },
    ],
  },
};
