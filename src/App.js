import React, { useEffect, useState } from "react";
import "./App.css";

const PIPELINE_STAGES = [
  { id: 1, icon: "🧹", label: "Clean Workspace", status: "done" },
  { id: 2, icon: "📥", label: "Checkout Code", status: "done" },
  { id: 3, icon: "🔍", label: "SonarQube Analysis", status: "done" },
  { id: 4, icon: "✅", label: "Quality Gate", status: "done" },
  { id: 5, icon: "📦", label: "Install Dependencies", status: "done" },
  { id: 6, icon: "🛡️", label: "Trivy File Scan", status: "done" },
  { id: 7, icon: "🐳", label: "Build Docker Image", status: "done" },
  { id: 8, icon: "🔒", label: "Trivy Image Scan", status: "done" },
  { id: 9, icon: "🚀", label: "Push to DockerHub", status: "done" },
  { id: 10, icon: "☸️", label: "Update K8s Manifest", status: "done" },
];

const TECH_STACK = [
  { name: "React.js", role: "Application", color: "#61DAFB" },
  { name: "Jenkins", role: "CI/CD", color: "#D33833" },
  { name: "SonarQube", role: "Code Quality", color: "#4E9BCD" },
  { name: "Trivy", role: "Security Scan", color: "#1904DA" },
  { name: "Docker", role: "Containerization", color: "#2496ED" },
  { name: "Kubernetes", role: "Orchestration", color: "#326CE5" },
  { name: "Argo CD", role: "GitOps", color: "#EF7B4D" },
  { name: "AWS EKS", role: "Cloud", color: "#FF9900" },
];

function TypewriterText({ texts, speed = 80 }) {
  const [display, setDisplay] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    let timeout;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx((i) => (i + 1) % texts.length);
    }

    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts, speed]);

  return (
    <span className="typewriter">
      {display}
      <span className="cursor">|</span>
    </span>
  );
}

function PipelineStage({ stage, delay }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={`pipeline-stage ${visible ? "stage-visible" : ""}`}>
      <div className="stage-icon">{stage.icon}</div>
      <div className="stage-label">{stage.label}</div>
      <div className="stage-check">✓</div>
    </div>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="app">
      {/* NAV */}
      <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
        <div className="nav-brand">
          <span className="nav-bracket">&lt;</span>
          DevSecOps
          <span className="nav-bracket">/&gt;</span>
        </div>
        <div className="nav-links">
          <a href="#pipeline">Pipeline</a>
          <a href="#stack">Stack</a>
          <a href="#about">About</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="hero-content">
          <div className="hero-badge">AWS EKS · GitOps · Automated Delivery</div>
          <h1 className="hero-title">
            Automated
            <br />
            <TypewriterText
              texts={[
                "CI/CD Pipeline",
                "Security Scanning",
                "GitOps Delivery",
                "EKS Deployment",
              ]}
            />
          </h1>
          <p className="hero-sub">
            Jenkins → SonarQube → Trivy → Docker → Kubernetes → Argo CD<br />
            Every push. Every check. Every time.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">10</span>
              <span className="stat-label">Pipeline Stages</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">2</span>
              <span className="stat-label">EKS Replicas</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">8</span>
              <span className="stat-label">Tools Integrated</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll-hint">↓ scroll</div>
      </section>

      {/* PIPELINE */}
      <section className="section pipeline-section" id="pipeline">
        <div className="section-eyebrow">CI/CD Flow</div>
        <h2 className="section-title">Pipeline Stages</h2>
        <p className="section-sub">
          Triggered on every push to <code>main</code> — code never ships without passing every gate.
        </p>
        <div className="pipeline-grid">
          {PIPELINE_STAGES.map((stage, i) => (
            <PipelineStage key={stage.id} stage={stage} delay={i * 100} />
          ))}
        </div>
        <div className="pipeline-arrow">
          <span>Code Push</span>
          <div className="arrow-line" />
          <span>Live on EKS</span>
        </div>
      </section>

      {/* STACK */}
      <section className="section stack-section" id="stack">
        <div className="section-eyebrow">Technology</div>
        <h2 className="section-title">Built With</h2>
        <div className="stack-grid">
          {TECH_STACK.map((tech) => (
            <div
              className="tech-card"
              key={tech.name}
              style={{ "--accent": tech.color }}
            >
              <div className="tech-dot" />
              <div className="tech-name">{tech.name}</div>
              <div className="tech-role">{tech.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="section about-section" id="about">
        <div className="about-inner">
          <div className="section-eyebrow">About This Project</div>
          <h2 className="section-title">End-to-End DevSecOps</h2>
          <p className="about-body">
            This project demonstrates an end-to-end DevSecOps CI/CD pipeline on AWS EKS —
  integrating security throughout the delivery lifecycle. From static code analysis
  and vulnerability scanning to GitOps-based deployment and automated Kubernetes
  rollouts.
          <div className="about-links">
            <a
              href="https://github.com/Heyysri/DevSecOps-CI-CD-Pipeline-Aws-Eks"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              View on GitHub
            </a>
            <a href="https://linkedin.com/in/srikanth-pawar" target="_blank" rel="noreferrer" className="btn btn-ghost">
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <span className="footer-brand">
          <span className="nav-bracket">&lt;</span>DevSecOps<span className="nav-bracket">/&gt;</span>
        </span>
        <span className="footer-copy">Built by Srikanth Sanjay Pawar · Deployed on AWS EKS</span>
      </footer>
    </div>
  );
}
