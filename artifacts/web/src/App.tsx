import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHealthCheck } from "@workspace/api-client-react";

const queryClient = new QueryClient();

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="copy-btn">
      {copied ? "✓ Copied" : "Copy URL"}
    </button>
  );
}

function StatusBadge() {
  const { data, isLoading, isError } = useHealthCheck({
    query: { refetchInterval: 30000 },
  });

  if (isLoading) {
    return <span className="status-badge status-loading">● Checking…</span>;
  }
  if (isError || !data) {
    return <span className="status-badge status-error">● Offline</span>;
  }
  return <span className="status-badge status-ok">● Online</span>;
}

function App() {
  const serverUrl = window.location.origin;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="logo">🔬</div>
          <div className="header-text">
            <h1 className="site-title">QA Copilot Server</h1>
            <p className="site-subtitle">AI-powered QA analysis for your browser sessions</p>
          </div>
          <StatusBadge />
        </header>

        {/* Hero */}
        <section className="hero">
          <div className="hero-inner">
            <h2 className="hero-heading">Your personal QA AI, hosted and ready</h2>
            <p className="hero-desc">
              This server analyzes recorded browser sessions from the QA Copilot Chrome
              extension using AI — so you get structured bug reports, test steps, and
              recommendations without needing your own OpenAI key.
            </p>
          </div>
        </section>

        {/* Setup */}
        <section className="setup-section">
          <h2 className="section-title">Connect the Extension</h2>
          <p className="section-desc">
            Configure the QA Copilot Chrome extension to use this server in three steps.
          </p>

          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-body">
                <div className="step-title">Open extension settings</div>
                <div className="step-detail">
                  Click the QA Copilot icon in your Chrome toolbar, then click the{" "}
                  <strong>⚙ Settings</strong> tab.
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-num">2</div>
              <div className="step-body">
                <div className="step-title">Select Server mode</div>
                <div className="step-detail">
                  Click <strong>🖥 Server (free)</strong> — this routes analysis through
                  this server instead of requiring your own API key.
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-num">3</div>
              <div className="step-body">
                <div className="step-title">Enter your server URL</div>
                <div className="step-detail">
                  Paste the URL below into the <strong>Server URL</strong> field and click{" "}
                  <strong>Save</strong>.
                </div>
                <div className="url-row">
                  <code className="url-code">{serverUrl}</code>
                  <CopyButton text={serverUrl} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section">
          <h2 className="section-title">What you get</h2>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">🐛</div>
              <div className="feature-title">Bug Detection</div>
              <div className="feature-detail">
                AI spots console errors, API failures, broken flows, and slow calls
                automatically.
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">📋</div>
              <div className="feature-title">Test Steps</div>
              <div className="feature-detail">
                Every session becomes a reproducible step-by-step test case you can
                share with your team.
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">💡</div>
              <div className="feature-title">Recommendations</div>
              <div className="feature-detail">
                Actionable suggestions for improving coverage, validations, and UX
                quality.
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🔑</div>
              <div className="feature-title">No Key Needed</div>
              <div className="feature-detail">
                AI analysis runs on this server — no OpenAI account or billing required
                from you.
              </div>
            </div>
          </div>
        </section>

        {/* API */}
        <section className="api-section">
          <h2 className="section-title">API Endpoint</h2>
          <p className="section-desc">
            The extension posts sessions directly to this endpoint. You can also call it
            from your own tools.
          </p>
          <div className="api-block">
            <div className="api-method">POST</div>
            <code className="api-path">{serverUrl}/api/analyze</code>
          </div>
          <div className="api-desc">
            Accepts a recorded session (actions array + sessionStart timestamp) and
            returns a JSON report with <code>summary</code>, <code>bugs</code>,{" "}
            <code>testSteps</code>, <code>recommendations</code>, and{" "}
            <code>coverage</code>.
          </div>
        </section>

        <footer className="footer">
          <p>QA Copilot Server · Powered by OpenAI via Replit AI Integrations</p>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
