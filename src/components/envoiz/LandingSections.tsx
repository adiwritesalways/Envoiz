import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  Handshake,
  Layers3,
  LifeBuoy,
  LockKeyhole,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import "./landing-sections.css";

const features = [
  {
    icon: FileText,
    number: "01",
    title: "Invoices that look like you",
    copy: "Build a polished invoice in minutes. Add line items, set terms, and send a clear next step to your client.",
  },
  {
    icon: Users,
    number: "02",
    title: "Clients, not spreadsheets",
    copy: "Keep the people behind every project close by, with contact details, invoice history, and balances in one place.",
  },
  {
    icon: CircleDollarSign,
    number: "03",
    title: "Statuses that stay clear",
    copy: "Mark invoices paid, due, overdue, or draft so your records stay clear without a payment layer.",
  },
  {
    icon: BellRing,
    number: "04",
    title: "Follow-ups without the fuss",
    copy: "See what is due and what needs attention. A timely nudge is easier when the details are already there.",
  },
];

function MiniSidebar({ active }: { active: string }) {
  return (
    <aside className="mini-sidebar">
      <div className="mini-brand">
        <b>E</b>
        <span>envoiz</span>
      </div>
      <div className="mini-search">
        <Search size={11} /> Search
      </div>
      <small className="mini-caption">WORKSPACE</small>
      {["Overview", "Invoices", "Clients", "Reports"].map((item, index) => (
        <div className={`mini-nav ${active === item ? "is-active" : ""}`} key={item}>
          <i>
            {
              [<Layers3 key="o" />, <FileText key="i" />, <Users key="c" />, <FileText key="r" />][
                index
              ]
            }
          </i>
          {item}
          {item === "Invoices" && <em>6</em>}
        </div>
      ))}
      <div className="mini-sidebar-foot">
        Envoiz Studio
        <br />
        <small>Freelancer plan</small>
      </div>
    </aside>
  );
}

function PreviewFrame({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`preview-card ${className}`}>
      <div className="preview-label">
        <span>
          <i />
          {label}
        </span>
        <span className="preview-window">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="preview-screen">{children}</div>
    </article>
  );
}

function ProductStoryCopy({
  title,
  copy,
  detail,
}: {
  title: string;
  copy: string;
  detail: string;
}) {
  return (
    <div className="product-story-copy">
      <h3>{title}</h3>
      <p>{copy}</p>
      <span>
        <Check size={13} />
        {detail}
      </span>
    </div>
  );
}

function OverviewPreview() {
  return (
    <PreviewFrame label="01 / Overview" className="gallery-overview">
      <div className="mini-app">
        <MiniSidebar active="Overview" />
        <div className="mini-main">
          <div className="mini-top">
            <b>Good morning, Jordan</b>
            <span className="mini-button">
              <Plus size={10} /> New invoice
            </span>
          </div>
          <div className="mini-metrics">
            {[
              ["Collected this month", "$10,430"],
              ["Outstanding", "$8,050"],
              ["Invoices issued", "06"],
            ].map(([label, value]) => (
              <div key={label}>
                <small>{label}</small>
                <b>{value}</b>
                <span>↗ &nbsp;8.4%</span>
              </div>
            ))}
          </div>
          <div className="mini-chart">
            <div className="mini-panel-title">
              Revenue overview <small>Last 6 months</small>
            </div>
            <div className="mini-bars">
              {[38, 53, 42, 68, 55, 82, 63, 92, 70, 84, 58, 76].map((h, i) => (
                <i key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="mini-months">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
          <div className="mini-payment">
            <span className="mini-check">
              <Check size={12} />
            </span>
            <span>
              <b>Invoice marked paid</b>
              <small>Halcyon Goods · via bKash</small>
            </span>
            <strong>$1,780</strong>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

function InvoicePreview() {
  const rows = [
    ["INV-2025-041", "Northlight Studio", "$4,850", "Overdue"],
    ["INV-2025-040", "Fieldnote Co.", "$3,200", "Pending"],
    ["INV-2025-039", "Halcyon Goods", "$1,780", "Paid"],
    ["INV-2025-038", "Parallel Works", "$6,250", "Paid"],
  ];
  return (
    <PreviewFrame label="02 / Invoice list" className="gallery-invoices">
      <div className="mini-app">
        <MiniSidebar active="Invoices" />
        <div className="mini-main">
          <div className="mini-top">
            <b>Invoices</b>
            <span className="mini-button">
              <Plus size={10} /> New invoice
            </span>
          </div>
          <div className="mini-summary">
            <span>
              <small>Total invoiced</small>
              <b>$19,440</b>
            </span>
            <span>
              <small>Due this week</small>
              <b>$8,050</b>
            </span>
            <span>
              <small>Paid</small>
              <b>$10,430</b>
            </span>
          </div>
          <div className="mini-table">
            <div className="mini-table-head">
              <span>INVOICE / CLIENT</span>
              <span>AMOUNT</span>
              <span>STATUS</span>
            </div>
            {rows.map(([id, client, amount, status]) => (
              <div className="mini-row" key={id}>
                <span>
                  <b>{id}</b>
                  <small>{client}</small>
                </span>
                <strong>{amount}</strong>
                <em className={`mini-status ${status.toLowerCase()}`}>{status}</em>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

function CreatePreview() {
  return (
    <PreviewFrame label="04 / Create invoice" className="create-preview">
      <div className="create-window">
        <div className="create-top">
          <span>← &nbsp; Invoices</span>
          <span>Draft · saved just now</span>
        </div>
        <div className="create-heading">
          <span className="create-mark">E</span>
          <div>
            <small>NEW DOCUMENT</small>
            <b>Create an invoice</b>
          </div>
        </div>
        <div className="create-fields">
          <div className="create-field">
            <small>CLIENT</small>
            <b>
              Northlight Studio <ChevronRight size={12} />
            </b>
          </div>
          <div className="create-two">
            <div className="create-field">
              <small>INVOICE NUMBER</small>
              <b>INV-2025-042</b>
            </div>
            <div className="create-field">
              <small>ISSUE DATE</small>
              <b>Jun 23, 2025</b>
            </div>
          </div>
          <div className="create-line">
            <span>DESCRIPTION</span>
            <span>QTY</span>
            <span>RATE</span>
            <span>AMOUNT</span>
          </div>
          <div className="create-line detail">
            <b>Brand identity design</b>
            <span>1</span>
            <span>$2,400</span>
            <strong>$2,400</strong>
          </div>
          <div className="create-line detail">
            <b>Creative direction</b>
            <span>1</span>
            <span>$850</span>
            <strong>$850</strong>
          </div>
          <div className="create-total">
            <span>Total due</span>
            <b>$3,250.00</b>
          </div>
          <div className="create-actions">
            <span>
              <CreditCard size={12} /> Card, bank transfer, bKash
            </span>
            <b>
              <Send size={11} /> Send invoice
            </b>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

function ClientsPreview() {
  return (
    <PreviewFrame label="03 / Clients & invoice history" className="gallery-clients">
      <div className="mini-app">
        <MiniSidebar active="Clients" />
        <div className="mini-main">
          <div className="mini-top">
            <b>Clients</b>
            <span className="mini-button">
              <Plus size={10} /> Add client
            </span>
          </div>
          <div className="client-summary">
            <div className="client-initial">NS</div>
            <div>
              <small>CLIENT PROFILE</small>
              <b>Northlight Studio</b>
              <span>Maya Chen · maya@northlight.studio</span>
            </div>
            <BadgeCheck size={17} />
          </div>
          <div className="client-kpis">
            <span>
              <small>Lifetime invoiced</small>
              <b>$12,840</b>
            </span>
            <span>
              <small>Outstanding</small>
              <b>$4,850</b>
            </span>
            <span>
              <small>Last invoice</small>
              <b>Jun 12</b>
            </span>
          </div>
          <div className="mini-panel-title client-payment-title">
            Recent invoices <small>View history&nbsp; →</small>
          </div>
          <div className="client-pay-row">
            <i>
              <Check size={11} />
            </i>
            <span>
              <b>INV-2025-039</b>
              <small>Jun 18 · bKash</small>
            </span>
            <strong>
              $1,780 <em>Completed</em>
            </strong>
          </div>
          <div className="client-pay-row">
            <i className="pending-mark">
              <Clock3 size={11} />
            </i>
            <span>
              <b>INV-2025-040</b>
              <small>Jun 20 · Card</small>
            </span>
            <strong>
              $3,200 <em className="waiting">Processing</em>
            </strong>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

export default function LandingSections() {
  return (
    <div className="landing-sections">
      <section
        className="landing-section features-section"
        id="features"
        aria-labelledby="features-title"
      >
        <div className="section-intro">
          <h2 id="features-title">
            Less admin.
            <br />
            <span>More making.</span>
          </h2>
          <p>
            Good work deserves a smoother way to invoice. Envoiz keeps the busywork close at hand
            and the important details in view.
          </p>
        </div>
        <div className="feature-list">
          {features.map(({ icon: Icon, number, title, copy }) => (
            <article className="feature-item" key={number}>
              <span className="feature-number">{number}</span>
              <span className="feature-icon">
                <Icon size={19} strokeWidth={1.7} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
              <ArrowUpRight className="feature-arrow" size={17} />
            </article>
          ))}
        </div>
      </section>

      <section className="why-section" id="why-envoiz" aria-labelledby="why-title">
        <div className="why-copy">
          <h2 id="why-title">
            Built for the work
            <br />
            you actually do.
          </h2>
          <p className="why-lede">
            Not a finance department in disguise. Just a thoughtful workspace for independent people
            doing good work.
          </p>
          <div className="why-points">
            <div>
              <span>
                <Handshake size={17} />
              </span>
              <p>
                <b>For real relationships</b>
                <small>Client context stays attached to every invoice.</small>
              </p>
            </div>
            <div>
              <span>
                <LockKeyhole size={17} />
              </span>
              <p>
                <b>Clear by default</b>
                <small>Know what’s paid, what’s pending, and what needs a nudge.</small>
              </p>
            </div>
            <div>
              <span>
                <LifeBuoy size={17} />
              </span>
              <p>
                <b>Flexible as you grow</b>
                <small>From your first client to your next small team.</small>
              </p>
            </div>
          </div>
        </div>
        <div className="why-art" aria-label="A simplified invoice being paid">
          <div className="paper-orbit orbit-one" />
          <div className="paper-orbit orbit-two" />
          <div className="why-note">
            <div className="why-note-head">
              <b>ENVOIZ</b>
              <span>INVOICE</span>
            </div>
            <div className="why-note-rule" />
            <small>INVOICE FOR</small>
            <b>Northlight Studio</b>
            <div className="why-note-lines">
              <i />
              <i />
              <i />
            </div>
            <div className="why-note-total">
              <span>TOTAL DUE</span>
              <b>$4,850.00</b>
            </div>
          </div>
          <div className="paid-stamp">
            <Check size={15} /> Paid on time
          </div>
          <span className="float-token token-one">
            <CreditCard size={17} />
          </span>
          <span className="float-token token-two">
            <Sparkles size={17} />
          </span>
        </div>
      </section>

      <section className="gallery-section" id="product" aria-labelledby="gallery-title">
        <div className="gallery-heading">
          <div>
            <h2 id="gallery-title">
              Your business,
              <br />
              in good order.
            </h2>
          </div>
          <p>
            One clear place to see what’s happening, send what’s next, and keep good client
            relationships moving.
          </p>
        </div>
        <div className="preview-grid">
          <div className="product-row">
            <ProductStoryCopy
              title="Everything in view."
              copy="See what came in, what is outstanding, and what needs your attention—all in one clear overview."
              detail="Invoices and their current status together"
            />
            <OverviewPreview />
          </div>
          <div className="product-row is-reverse">
            <InvoicePreview />
            <ProductStoryCopy
              title="Invoices, on track."
              copy="Create clear invoices and follow each one from draft to paid, without losing track of what is due."
              detail="Paid, pending, and overdue at a glance"
            />
          </div>
          <div className="product-row">
            <ProductStoryCopy
              title="Clients, close by."
              copy="Keep contact details and recent invoice history together for every working relationship."
              detail="The context behind every project"
            />
            <ClientsPreview />
          </div>
          <div className="product-row is-reverse">
            <CreatePreview />
            <ProductStoryCopy
              title="From your work to their inbox."
              copy="Add a client, list the work, and send a polished invoice that is ready to save and download."
              detail="A clear path from draft to invoice"
            />
          </div>
        </div>
        <a className="gallery-link" href="/dashboard">
          Explore the workspace <ArrowRight size={15} />
        </a>
      </section>

      <section className="faq-section" id="faq" aria-labelledby="faq-title">
        <div className="faq-intro">
          <h2 id="faq-title">
            A few things
            <br />
            worth knowing.
          </h2>
          <p>New to Envoiz? Here are the details people usually ask about.</p>
          <a href="#contact">
            Still curious? Talk to us <ArrowRight size={14} />
          </a>
        </div>
        <div className="faq-list">
          <details>
            <summary>
              Who is Envoiz for?
              <span />
            </summary>
            <p>
              Envoiz is made for freelancers, studios, and small agencies who want a calmer way to
              create invoices and stay close to clients.
            </p>
          </details>
          <details>
            <summary>
              Does Envoiz process payments?
              <span />
            </summary>
            <p>
              No. Envoiz creates and manages invoices. You can manually mark an invoice as paid,
              due, or overdue to keep your records current.
            </p>
          </details>
          <details>
            <summary>
              Can I keep track of overdue invoices?
              <span />
            </summary>
            <p>
              Yes. Your invoice list and overview make paid, due, overdue, and draft invoices easy
              to tell apart at a glance.
            </p>
          </details>
          <details>
            <summary>
              How does pricing work?
              <span />
            </summary>
            <p>
              Start with the demo workspace to explore the product. Plan details can be tailored to
              how your team works—get in touch and we’ll help you find the right fit.
            </p>
          </details>
          <details>
            <summary>
              Can I manage more than one client?
              <span />
            </summary>
            <p>
              Absolutely. Keep client contact details, lifetime invoicing, outstanding balances, and
              recent activity together in your workspace.
            </p>
          </details>
        </div>
      </section>

      <section className="final-cta" id="contact">
        <div className="cta-orbit" aria-hidden="true" />
        <div className="cta-copy">
          <h2>
            Make room for
            <br />
            the work you love.
          </h2>
          <p>Bring your invoices and clients into one calmer workspace.</p>
          <div className="cta-actions">
            <a className="button button-dark" href="/dashboard">
              Open your workspace <ArrowRight size={16} />
            </a>
            <a className="cta-text-link" href="mailto:hello@envoiz.studio">
              Talk to our team <ChevronRight size={15} />
            </a>
          </div>
        </div>
        <div className="cta-side">
          <span className="cta-seal">
            <Check size={24} />
          </span>
          <b>
            Less chasing.
            <br />
            More doing.
          </b>
          <small>Simple invoicing for independent work.</small>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-top">
          <BrandLogo className="landing-footer-logo" />
          <a className="footer-back" href="#top">
            Back to top ↑
          </a>
        </div>
        <div className="footer-bottom">
          <span>© 2025 Envoiz Studio. Made for independent work.</span>
          <div>
            <a href="#features">Features</a>
            <a href="#product">Product</a>
            <a href="#faq">FAQ</a>
            <a href="mailto:hello@envoiz.studio">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
