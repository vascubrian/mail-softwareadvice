import { Link } from "react-router-dom";
import "./Landing.css";

const workflow = [
  "Import leads",
  "AI verify & qualify (optional)",
  "Personalize",
  "Send outreach",
  "Track engagement",
];
const features = [
  [
    "Lead Management",
    "Import and organize prospects in one reliable workspace.",
  ],
  [
    "Lead Source",
    "Connect Apollo for leads or upload the lead files your team already uses.",
  ],
  [
    "AI Verification",
    "Research companies when your AI integration is enabled.",
  ],
  ["Lead Qualification", "Identify prospects that match your target profile."],
  ["Personalized Outreach", "Create relevant email content for each audience."],
  ["Campaign Management", "Build and control outreach campaigns safely."],
  ["Email Tracking", "Follow delivery and engagement activity."],
  ["Reporting", "Understand lead and campaign performance."],
];
const steps = [
  [
    "01",
    "Bring your leads",
    "Connect Apollo for leads or upload a CSV or Excel file containing your existing prospect data.",
  ],
  [
    "02",
    "Review and qualify",
    "Check contact information, company details, duplicates, and lead quality before saving.",
  ],
  [
    "03",
    "Start focused outreach",
    "Create personalized campaigns and track engagement from one dashboard.",
  ],
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-shell landing-nav">
          <Link
            className="landing-brand"
            to="/"
            aria-label="Mail Software Advice home"
          >
            <img src="/mail-software-advice-logo.png" alt="" />
            <span>
              Mail Software <strong>Advice</strong>
            </span>
          </Link>
          <Link className="button button-outline button-small" to="/login">
            Login
          </Link>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="landing-shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">A smarter outreach workspace</p>
              <h1>
                Find. Research.
                <br />
                Personalize. Engage.
                <br />
                <span>Start conversations.</span>
              </h1>
              <p className="hero-description">
                Import, qualify and engage the right prospects from one
                workspace. Use your existing lead files today and enable
                AI-powered research and lead discovery when your integrations
                are ready.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary" to="/login">
                  Login <span aria-hidden="true">→</span>
                </Link>
                <a className="text-link" href="#how-it-works">
                  See how it works
                </a>
              </div>
            </div>
            <div className="workflow-wrap" aria-label="Outreach workflow">
              <div className="workflow-card">
                <div className="workflow-heading">
                  <div>
                    <strong>Outreach workflow</strong>
                    <small>From file to conversation</small>
                  </div>
                  <span className="complete-mark">✓</span>
                </div>
                <ol>
                  {workflow.map((label, index) => (
                    <li
                      key={label}
                      className={index === workflow.length - 1 ? "active" : ""}
                    >
                      <span className="workflow-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <strong>{label}</strong>
                      {index < workflow.length - 1 && (
                        <i aria-hidden="true">↓</i>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Product workflow">
          <div className="landing-shell trust-grid">
            {[
              "Import leads",
              "Verify companies",
              "Qualify prospects",
              "Personalize outreach",
              "Track results",
            ].map((label, index) => (
              <div key={label}>
                <span>0{index + 1}</span>
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="how-it-works">
          <div className="landing-shell">
            <div className="section-heading centered">
              <p className="eyebrow">How it works</p>
              <h2>From your lead file to focused outreach.</h2>
              <p>
                A simple, review-first workflow that keeps you in control at
                every step.
              </p>
            </div>
            <div className="step-grid">
              {steps.map(([number, title, body]) => (
                <article className="step-card" key={number}>
                  <span className="step-number">{number}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section features-section">
          <div className="landing-shell">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">Capabilities</p>
                <h2>Built for focused outreach.</h2>
              </div>
              <p>
                Start with the tools you already have. Add verification and
                discovery providers only when they create value.
              </p>
            </div>
            <div className="feature-grid">
              {features.map(([title, body], index) => (
                <article className="feature" key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="cta-section">
          <div className="landing-shell">
            <div className="cta">
              <div>
                <p className="eyebrow light">Ready to get started?</p>
                <h2>Turn lead data into real conversations.</h2>
                <p>
                  Import your prospects, qualify the right opportunities and
                  manage outreach from one workspace.
                </p>
              </div>
              <Link className="button button-light" to="/login">
                Login <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="landing-shell">
          <div className="landing-brand">
            <img src="/mail-software-advice-logo.png" alt="" />
            <span>Mail Software Advice</span>
          </div>
          <p>Lead generation and outreach, in one focused workspace.</p>
        </div>
      </footer>
    </div>
  );
}
