import { createFileRoute } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import LandingSections from "@/components/envoiz/LandingSections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Envoiz — Invoice better, faster, and paid on time" },
      {
        name: "description",
        content:
          "The modern invoicing tool designed specifically for freelancers, studios, and agencies. Create polished invoices, save them securely, and download them in seconds.",
      },
      { property: "og:title", content: "Envoiz — Invoice better, faster, and paid on time" },
      {
        property: "og:description",
        content:
          "The modern invoicing tool designed specifically for freelancers, studios, and agencies.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="envoiz-card" id="top">
      <div className="orb" aria-hidden="true">
        <svg viewBox="0 0 1354 900" fill="none">
          <g stroke="rgba(30,40,60,.13)" strokeDasharray="3 5">
            <circle cx="677" cy="445" r="360" />
            <circle cx="677" cy="445" r="480" />
            <circle cx="677" cy="445" r="610" />
          </g>
          <g stroke="#5b7cf0" strokeWidth="1.1" opacity=".8" strokeLinecap="round">
            <circle
              cx="677"
              cy="445"
              r="360"
              strokeDasharray="150 99999"
              transform="rotate(-132 677 445)"
            />
            <circle
              cx="677"
              cy="445"
              r="480"
              strokeDasharray="160 99999"
              transform="rotate(-42 677 445)"
            />
            <circle
              cx="677"
              cy="445"
              r="610"
              strokeDasharray="130 99999"
              transform="rotate(168 677 445)"
            />
            <circle
              cx="677"
              cy="445"
              r="610"
              strokeDasharray="140 99999"
              transform="rotate(12 677 445)"
            />
          </g>
        </svg>
        <div className="orbit-icon" style={{ left: 43, top: 230 }}>
          <svg viewBox="0 0 24 24">
            <path d="M12 3 2.5 7l9.5 4 9.5-4z" fill="#ff4d5e" />
            <path d="m2.5 7 9.5 4v9.5L2.5 16.5z" fill="#2d7ff9" />
            <path d="m21.5 7-9.5 4v9.5l9.5-4z" fill="#ffbf00" />
          </svg>
        </div>
        <div className="orbit-icon" style={{ left: 317, top: 272 }}>
          <svg viewBox="0 0 24 24">
            <circle cx="7.5" cy="7.5" r="3.6" fill="#36c5f0" />
            <circle cx="16.5" cy="7.5" r="3.6" fill="#2eb67d" />
            <circle cx="7.5" cy="16.5" r="3.6" fill="#e01e5a" />
            <circle cx="16.5" cy="16.5" r="3.6" fill="#ecb22e" />
          </svg>
        </div>
        <div className="orbit-icon" style={{ left: 159, top: 449 }}>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10.5" fill="#ffd23f" />
            <text
              x="12"
              y="17"
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="#15181d"
              fontFamily="Inter,sans-serif"
            >
              ৳
            </text>
          </svg>
        </div>
        <div className="orbit-icon" style={{ left: 944, top: 209 }}>
          <svg viewBox="0 0 24 24">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#2b7bff" />
                <stop offset="1" stopColor="#6a3df5" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#g1)" />
            <text
              x="12"
              y="17"
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="#fff"
              fontFamily="Inter,sans-serif"
            >
              $
            </text>
          </svg>
        </div>
        <div className="orbit-icon" style={{ left: 1125, top: 338 }}>
          <svg viewBox="0 0 24 24">
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#ff4fa3" />
                <stop offset=".55" stopColor="#8a5cf6" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10.5" fill="url(#g2)" />
            <path
              d="m7.5 12.5 3 3 6-7"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <div className="orbit-icon" style={{ left: 1244, top: 507 }}>
          <svg
            viewBox="0 0 24 24"
            stroke="#5b4bdb"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          >
            <path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6" />
          </svg>
        </div>
      </div>

      <nav className="site-nav">
        <a className="brand" href="#top">
          <BrandLogo className="brand-logo" />
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#why-envoiz">Why Envoiz</a>
          <a href="#product">Product</a>
          <a href="#faq">FAQ</a>
          <span className="nav-separator" />
          <a href="/login">Sign in</a>
          <a className="button button-dark" href="#contact">
            Contact us
          </a>
        </div>
      </nav>

      <div className="hero-scene">
        <section className="hero">
          <div className="social-proof">
            <span className="avatars">
              <i style={{ background: "linear-gradient(135deg,#7aa7d8,#2d4a7a)" }} />
              <i style={{ background: "linear-gradient(135deg,#e8b36a,#8a5a22)" }} />
              <i style={{ background: "linear-gradient(135deg,#f0c9a8,#a36a47)" }} />
            </span>
            24K+ <small>(freelancers &amp; studios)</small>
          </div>
          <h1>
            Invoice better,
            <br />
            faster, and paid on time
          </h1>
          <p className="hero-copy">
            The modern invoicing tool designed specifically for freelancers, studios, and agencies.
            Create polished invoices, save them securely, and download them in seconds.
          </p>
          <div className="hero-actions">
            <a className="button button-dark" href="/signup">
              Get Started
            </a>
            <a className="button button-gray" href="/dashboard/overview">
              See Demo
            </a>
          </div>
        </section>

        <div className="dashboard" aria-hidden="true">
          <aside className="dash-sidebar">
            <div className="sidebar-logo">
              <img src="/envoiz-brand-mark-cropped.png" alt="" />
              envoiz
              <span />
            </div>
            <div className="search-placeholder">Search…</div>
            <div className="menu-label">MAIN MENU</div>
            <div className="menu-item active">Dashboard</div>
            <div className="menu-item">
              Invoices<em>76</em>
            </div>
            <div className="menu-item">Clients</div>
            <div className="menu-item">
              Reports<em>3</em>
            </div>
          </aside>
          <div className="dashboard-main">
            <div className="dashboard-top">
              <h2>Dashboard</h2>
              <div className="dashboard-tools">
                <span className="dash-pill">+ New Invoice</span>
                <span className="dash-dot" />
                <span className="dash-dot" />
                <span className="user-avatar" />
              </div>
            </div>
            <div className="overview">
              <div className="overview-header">
                <div className="overview-title">
                  OVERVIEW<small>Last sync: Just now</small>
                </div>
                <div className="overview-tools">
                  <span className="filter-chip">Monthly ▾</span>
                  <span className="filter-chip">Oct 01 - Oct 31, 2026</span>
                  <span className="dash-pill">+ Create Invoice</span>
                </div>
              </div>
              <div className="stats">
                <div className="stat">
                  <p>
                    <i style={{ background: "#2f6bff" }} />
                    Total Invoiced
                  </p>
                  <b>$48.2K</b>
                  <u>+12%</u>
                  <em>from last month</em>
                </div>
                <div className="stat">
                  <p>
                    <i style={{ background: "#2f9e55" }} />
                    Invoices Paid
                  </p>
                  <b>112</b>
                  <u>+4%</u>
                  <em>from last month</em>
                </div>
                <div className="stat">
                  <p>
                    <i style={{ background: "#e8a43a" }} />
                    Pending
                  </p>
                  <b>43</b>
                  <u>+4%</u>
                  <em>from last month</em>
                </div>
                <div className="stat">
                  <p>
                    <i style={{ background: "#e8763a" }} />
                    Due This Week
                  </p>
                  <b>4</b>
                  <u className="negative">-2%</u>
                  <em>from last month</em>
                </div>
                <div className="stat">
                  <p>
                    <i style={{ background: "#9aa0a8" }} />
                    Overdue
                  </p>
                  <b>15</b>
                  <u className="negative">-2%</u>
                  <em>from last month</em>
                </div>
              </div>
            </div>
            <div className="dashboard-ghost">
              <span>INVOICE OVERVIEW</span>
              <span>RECENT INVOICES &nbsp; October 15</span>
            </div>
          </div>
        </div>
      </div>

      <LandingSections />
    </main>
  );
}