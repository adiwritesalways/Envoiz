import React from "react";
import { Link } from "@tanstack/react-router";
import { EnvoizLogoSvg } from "./EnvoizLogoSvg";
import "./EnvoizHero.css";

export function EnvoizHero() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="envoiz-hero-wrap">
      {/* Orb Background with SVG concentric circles and floating icons */}
      <div className="envoiz-orb" aria-hidden="true">
        <svg viewBox="0 0 1354 900" fill="none">
          <g stroke="rgba(66,29,36,.09)" strokeDasharray="3 5">
            <circle cx="677" cy="445" r="360" />
            <circle cx="677" cy="445" r="480" />
            <circle cx="677" cy="445" r="610" />
          </g>
          <g stroke="#714cb6" strokeWidth="1.1" opacity=".5" strokeLinecap="round">
            <circle cx="677" cy="445" r="360" strokeDasharray="150 99999" transform="rotate(-132 677 445)" />
            <circle cx="677" cy="445" r="480" strokeDasharray="160 99999" transform="rotate(-42 677 445)" />
            <circle cx="677" cy="445" r="610" strokeDasharray="130 99999" transform="rotate(168 677 445)" />
            <circle cx="677" cy="445" r="610" strokeDasharray="140 99999" transform="rotate(12 677 445)" />
          </g>
        </svg>
        <div className="envoiz-orbit-icon envoiz-orbit-icon-1" style={{ left: "43px", top: "230px" }}>
          <svg viewBox="0 0 24 24">
            <path d="M12 3 2.5 7l9.5 4 9.5-4z" fill="#ff4d5e" />
            <path d="m2.5 7 9.5 4v9.5L2.5 16.5z" fill="#2d7ff9" />
            <path d="m21.5 7-9.5 4v9.5l9.5-4z" fill="#ffbf00" />
          </svg>
        </div>
        <div className="envoiz-orbit-icon envoiz-orbit-icon-2" style={{ left: "317px", top: "272px" }}>
          <svg viewBox="0 0 24 24">
            <circle cx="7.5" cy="7.5" r="3.6" fill="#36c5f0" />
            <circle cx="16.5" cy="7.5" r="3.6" fill="#2eb67d" />
            <circle cx="7.5" cy="16.5" r="3.6" fill="#e01e5a" />
            <circle cx="16.5" cy="16.5" r="3.6" fill="#ecb22e" />
          </svg>
        </div>
        <div className="envoiz-orbit-icon envoiz-orbit-icon-3" style={{ left: "159px", top: "449px" }}>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10.5" fill="#ffd23f" />
            <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="700" fill="#15181d" fontFamily="Inter,sans-serif">
              ৳
            </text>
          </svg>
        </div>
        <div className="envoiz-orbit-icon envoiz-orbit-icon-4" style={{ left: "944px", top: "209px" }}>
          <svg viewBox="0 0 24 24">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#2b7bff" />
                <stop offset="1" stopColor="#6a3df5" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#g1)" />
            <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">
              $
            </text>
          </svg>
        </div>
        <div className="envoiz-orbit-icon envoiz-orbit-icon-5" style={{ left: "1125px", top: "338px" }}>
          <svg viewBox="0 0 24 24">
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#ff4fa3" />
                <stop offset=".55" stopColor="#8a5cf6" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10.5" fill="url(#g2)" />
            <path d="m7.5 12.5 3 3 6-7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <div className="envoiz-orbit-icon envoiz-orbit-icon-6" style={{ left: "1244px", top: "507px" }}>
          <svg viewBox="0 0 24 24" stroke="#5b4bdb" strokeWidth="2.4" strokeLinecap="round" fill="none">
            <path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6" />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="envoiz-site-nav" aria-label="Main Navigation">
        <Link className="envoiz-brand" to="/">
          <span className="envoiz-brand-icon-wrap">
            <EnvoizLogoSvg size={38} withBackground={false} />
          </span>
          <span className="envoiz-brand-name">Envoiz</span>
        </Link>
        <div className="envoiz-nav-links">
          <a href="#product" onClick={(e) => handleNavClick(e, "product")}>
            Features
          </a>
          <a href="#features" onClick={(e) => handleNavClick(e, "features")}>
            How It Works
          </a>
          <a href="#pricing" onClick={(e) => handleNavClick(e, "pricing")}>
            Pricing
          </a>
          <a href="#testimonials" onClick={(e) => handleNavClick(e, "testimonials")}>
            Testimonials
          </a>
          <span className="envoiz-nav-separator"></span>
          <Link to="/resources/support" className="envoiz-btn envoiz-btn-dark">
            Contact us
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <section className="envoiz-hero" aria-labelledby="envoiz-hero-title">
        <div className="envoiz-social-proof">
          <span className="envoiz-avatars">
            <i style={{ background: "linear-gradient(135deg,#7aa7d8,#2d4a7a)" }}></i>
            <i style={{ background: "linear-gradient(135deg,#e8b36a,#8a5a22)" }}></i>
            <i style={{ background: "linear-gradient(135deg,#f0c9a8,#a36a47)" }}></i>
          </span>
          24K+ <small>(freelancers &amp; studios)</small>
        </div>
        <h1 id="envoiz-hero-title">
          Invoice better,<br />faster, and paid on time
        </h1>
        <p className="envoiz-hero-copy">
          The modern invoicing tool designed specifically for freelancers, studios, and agencies.
          Create, send, and collect payments by card, bKash, or Nagad — from draft to paid.
        </p>
        <div className="envoiz-hero-actions">
          <Link to="/dashboard" className="envoiz-btn envoiz-btn-dark" data-testid="button-hero-get-started">
            Get Started
          </Link>
          <Link to="/dashboard" className="envoiz-btn envoiz-btn-gray" data-testid="button-hero-see-demo">
            See Demo
          </Link>
        </div>
      </section>

      {/* Dashboard Preview Component */}
      <Link to="/dashboard" className="envoiz-preview-dashboard" aria-label="Open Interactive Dashboard Demo">
        <aside className="envoiz-dash-sidebar">
          <div className="envoiz-sidebar-logo">
            <img src="/envoiz-brand-mark-cropped.png" alt="" />
            <span>Envoiz</span>
            <span style={{ width: "16px", height: "16px", marginLeft: "auto", border: "1px solid var(--envoiz-line)", borderRadius: "4px", background: "#fff" }}></span>
          </div>
          <div className="envoiz-search-placeholder">Search…</div>
          <div className="envoiz-menu-label">MAIN MENU</div>
          <div className="envoiz-menu-item active">Dashboard</div>
          <div className="envoiz-menu-item">Invoices<em>76</em></div>
          <div className="envoiz-menu-item">Clients</div>
          <div className="envoiz-menu-item">Payments<em>21</em></div>
          <div className="envoiz-menu-item">Reports<em>3</em></div>
        </aside>
        <div className="envoiz-dashboard-main">
          <div className="envoiz-dashboard-top">
            <h2>Dashboard</h2>
            <div className="envoiz-dashboard-tools">
              <span className="envoiz-dash-pill">+ New Invoice</span>
              <span className="envoiz-dash-dot"></span>
              <span className="envoiz-dash-dot"></span>
              <span className="envoiz-user-avatar"></span>
            </div>
          </div>
          <div className="envoiz-overview-block">
            <div className="envoiz-overview-header">
              <div className="envoiz-overview-title">
                OVERVIEW
                <small>Last sync: Just now</small>
              </div>
              <div className="envoiz-overview-tools">
                <span className="envoiz-filter-chip">Monthly ▾</span>
                <span className="envoiz-filter-chip">Oct 01 - Oct 31, 2026</span>
                <span className="envoiz-dash-pill">+ Create Invoice</span>
              </div>
            </div>
            <div className="envoiz-stats-grid">
              <div className="envoiz-stat">
                <p><i style={{ background: "#2f6bff" }}></i>Total Invoiced</p>
                <b>$48.2K</b>
                <u>+12%</u>
                <em>from last month</em>
              </div>
              <div className="envoiz-stat">
                <p><i style={{ background: "#2f9e55" }}></i>Invoices Paid</p>
                <b>112</b>
                <u>+4%</u>
                <em>from last month</em>
              </div>
              <div className="envoiz-stat">
                <p><i style={{ background: "#e8a43a" }}></i>Pending</p>
                <b>43</b>
                <u>+4%</u>
                <em>from last month</em>
              </div>
              <div className="envoiz-stat">
                <p><i style={{ background: "#e8763a" }}></i>Due This Week</p>
                <b>4</b>
                <u className="negative">-2%</u>
                <em>from last month</em>
              </div>
              <div className="envoiz-stat">
                <p><i style={{ background: "#9aa0a8" }}></i>Overdue</p>
                <b>15</b>
                <u className="negative">-2%</u>
                <em>from last month</em>
              </div>
            </div>
          </div>
          <div className="envoiz-dashboard-ghost">
            <span>REVENUE OVERVIEW</span>
            <span>PAYMENT CALENDAR &nbsp; October 15</span>
          </div>
        </div>
      </Link>

      {/* Trusted By Logos */}
      <section className="envoiz-trusted">
        <h3>Trusted by teams at leading companies</h3>
        <div className="envoiz-logo-row">
          <span className="envoiz-logo-northlight">Northlight</span>
          <span className="envoiz-logo-kiln">kiln.</span>
          <span className="envoiz-logo-parallel">PARALLEL</span>
          <span className="envoiz-logo-halcyon">Halcyon</span>
          <span className="envoiz-logo-fieldnote">fieldnote</span>
          <span className="envoiz-logo-brightside">Brightside</span>
          <span className="envoiz-logo-ostrich">OSTRICH &amp; CO</span>
          <span className="envoiz-logo-moss">moss</span>
        </div>
      </section>
    </div>
  );
}
