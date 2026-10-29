import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { currencyOptions, defaultCurrency } from "@/lib/envoiz";
import { CompanyOnboardingWizard } from "@/components/envoiz/CompanyOnboardingWizard";
import { InvoiceFormDialog } from "@/components/envoiz/InvoiceFormDialog";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Filter,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

type Invoice = {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  exchangeRateToUsd?: number | null;
  status: "Draft" | "Paid" | "Due" | "Overdue";
  items?: { name: string; quantity: number; unitPrice: number }[];
  notes?: string;
};

type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  currencyTotals: Record<string, number>;
  lastInvoiceDate: string;
};

const navItems = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "invoices", label: "Invoices", icon: FileText },
  { key: "clients", label: "Clients", icon: Users },
  { key: "settings", label: "Settings", icon: Settings },
];

const money = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const totalInProfileCurrency = (
  invoices: Invoice[],
  currency: string,
  rates: Record<string, number>,
) => {
  let total = 0;
  const profileRateToUsd = currency === "USD" ? 1 : rates.USD;
  for (const invoice of invoices) {
    if (invoice.currency === currency) {
      total += invoice.amount;
      continue;
    }
    if (invoice.exchangeRateToUsd && profileRateToUsd) {
      total += (invoice.amount * invoice.exchangeRateToUsd) / profileRateToUsd;
      continue;
    }
    const sourceRate = rates[invoice.currency];
    if (!sourceRate) return null;
    total += invoice.amount / sourceRate;
  }
  return total;
};

const formatProfileCurrencyTotal = (
  invoices: Invoice[],
  currency: string,
  rates: Record<string, number>,
) => {
  const total = totalInProfileCurrency(invoices, currency, rates);
  return total === null ? "—" : money(total, currency);
};

const formatCurrencyBreakdown = (totals: Record<string, number>) => {
  const entries = Object.entries(totals);
  return entries.length
    ? entries.map(([currency, amount]) => money(amount, currency)).join(" · ")
    : "—";
};

const shortDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function Status({ children }: { children: string }) {
  return (
    <span
      className={`status status-${children.toLowerCase()}`}
      data-testid={`status-${children.toLowerCase()}`}
    >
      <i />
      {children}
    </span>
  );
}

function pageDescription(section: string) {
  const descriptions: Record<string, string> = {
    invoices: "Create, track, and follow up on every invoice.",
    clients: "A clear view of the people you work with.",
    reports: "Understand your cash flow and momentum.",
    settings: "Make Envoiz work the way your business does.",
  };
  return descriptions[section] ?? "";
}

export function DashboardApp({ initialSection = "overview" }: { initialSection?: string }) {
  const navigate = useNavigate();
  const { user, refreshSession, signOut } = useAuth();
  const [section, setSection] = useState(
    navItems.some((item) => item.key === initialSection) ? initialSection : "overview",
  );
  const [mobileNav, setMobileNav] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workspaceClients, setWorkspaceClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All invoices");
  const [showNew, setShowNew] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [invoiceRefreshKey, setInvoiceRefreshKey] = useState(0);
  const [clientSearch, setClientSearch] = useState("");
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [period, setPeriod] = useState("Last 6 months");
  const [settings, setSettings] = useState({
    businessName: user?.user_metadata?.company_name || user?.user_metadata?.full_name || "",
    email:
      user?.app_metadata?.provider === "github"
        ? String(user.user_metadata?.company_email || "")
        : user?.email || "",
    currency: String(user?.user_metadata?.default_currency || defaultCurrency),
  });
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    [String(user?.user_metadata?.default_currency || defaultCurrency)]: 1,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const profileFileRef = useRef<HTMLInputElement>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    const loadInvoices = async () => {
      const { data, error } = await supabase
        .from("envoiz_invoices")
        .select(
          "id, invoice_number, client_name, client_email, issue_date, due_date, currency, exchange_rate_to_usd, payment_status, envoiz_invoice_items(product, quantity, unit_price)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Unable to load invoices", error);
        if (active) setInvoices([]);
        return;
      }
      if (!active) return;
      const rows = data ?? [];
      setInvoices(
        rows.map((row: any) => {
          const items = (row.envoiz_invoice_items ?? []).map((item: any) => ({
            name: item.product,
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unit_price) || 0,
          }));
          const amount = items.reduce(
            (sum: number, item: { quantity: number; unitPrice: number }) =>
              sum + item.quantity * item.unitPrice,
            0,
          );
          const rawStatus = String(row.payment_status || "Draft");
          const status: Invoice["status"] =
            rawStatus === "Pending"
              ? "Due"
              : ["Draft", "Paid", "Due", "Overdue"].includes(rawStatus)
                ? (rawStatus as Invoice["status"])
                : "Due";
          return {
            id: String(row.id),
            number: String(row.invoice_number),
            clientId: String(row.client_name || ""),
            clientName: String(row.client_name || "Client"),
            issueDate: String(row.issue_date || ""),
            dueDate: String(row.due_date || ""),
            amount,
            currency: String(row.currency || settings.currency || "USD"),
            exchangeRateToUsd:
              row.exchange_rate_to_usd === null ? null : Number(row.exchange_rate_to_usd),
            status,
            items,
            notes: String(row.notes || ""),
          };
        }),
      );
      const byClient = new Map<string, Client>();
      rows.forEach((row: any) => {
        const company = String(row.client_name || "Client");
        const items = row.envoiz_invoice_items ?? [];
        const amount = items.reduce(
          (sum: number, item: any) =>
            sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
          0,
        );
        const rowCurrency = String(row.currency || settings.currency || "USD");
        const current = byClient.get(company) ?? {
          id: company,
          name: company,
          company,
          email: String(row.client_email || ""),
          currencyTotals: {},
          lastInvoiceDate: String(row.issue_date || ""),
        };
        current.currencyTotals[rowCurrency] = (current.currencyTotals[rowCurrency] || 0) + amount;
        current.lastInvoiceDate = String(row.issue_date || current.lastInvoiceDate);
        byClient.set(company, current);
      });
      setWorkspaceClients(Array.from(byClient.values()));
    };
    void loadInvoices();
    return () => {
      active = false;
    };
  }, [user?.id, invoiceRefreshKey, settings.currency]);

  useEffect(() => {
    if (!user) return;
    const githubAccount = user.app_metadata?.provider === "github";
    const savedCurrency = String(user.user_metadata?.default_currency || defaultCurrency);
    setSettings((previous) => ({
      ...previous,
      businessName: String(user.user_metadata?.company_name || user.user_metadata?.full_name || ""),
      email: githubAccount ? String(user.user_metadata?.company_email || "") : user.email || "",
      currency: String(user.user_metadata?.default_currency || defaultCurrency),
    }));
  }, [user]);

  useEffect(() => {
    const profileCurrency = settings.currency || defaultCurrency;
    let active = true;
    setExchangeRates({ [profileCurrency]: 1 });

    void fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(profileCurrency)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load exchange rates.");
        const data = await response.json();
        if (data.result !== "success" || !data.rates)
          throw new Error("Unable to load exchange rates.");
        if (active) setExchangeRates({ ...data.rates, [profileCurrency]: 1 });
      })
      .catch((error) => {
        console.warn("Unable to load exchange rates for dashboard metrics.", error);
      });

    return () => {
      active = false;
    };
  }, [settings.currency]);

  async function saveProfileSettings() {
    if (!user) return;
    setSavingProfile(true);
    try {
      const githubAccount = user.app_metadata?.provider === "github";
      const companyEmail = githubAccount ? settings.email.trim() : user.email || "";
      const { error } = await supabase.auth.updateUser({
        data: {
          company_name: settings.businessName.trim() || null,
          full_name: settings.businessName.trim() || null,
          ...(githubAccount && !user.user_metadata?.company_email
            ? { company_email: companyEmail || null }
            : {}),
        },
      });
      if (error) throw error;
      await refreshSession();
      toast.success("Profile saved to your account.");
    } catch (error) {
      console.error("Unable to save profile settings", error);
      toast.error("Unable to save your profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function uploadProfilePicture(file: File) {
    if (!user) return;
    setUploadingProfile(true);
    try {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      ) {
        throw new Error("Choose a JPG, PNG, or WebP image smaller than 5 MB.");
      }
      const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
      const path = `${user.id}/profile-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl },
      });
      if (updateError) throw updateError;
      await refreshSession();
    } catch (error) {
      console.error("Unable to upload profile picture", error);
    } finally {
      setUploadingProfile(false);
    }
  }

  async function deleteAccount() {
    if (!user || deletingAccount) return;
    if (
      !window.confirm(
        "Delete your Envoiz account and all invoices permanently? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeletingAccount(true);
    try {
      const { error } = await supabase.rpc("delete_user");
      if (error) throw error;
      await signOut();
      toast.success("Your account has been deleted.");
      await navigate({ to: "/" });
    } catch (error) {
      console.error("Unable to delete account", error);
      toast.error("Unable to delete your account. Please try again.");
    } finally {
      setDeletingAccount(false);
    }
  }

  const visibleInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const match = `${invoice.number} ${invoice.clientName}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return match && (filter === "All invoices" || invoice.status === filter);
      }),
    [invoices, search, filter],
  );

  const visibleClients = useMemo(
    () =>
      workspaceClients.filter((client) =>
        `${client.name} ${client.company} ${client.email}`
          .toLowerCase()
          .includes(clientSearch.toLowerCase()),
      ),
    [clientSearch, workspaceClients],
  );

  const title = navItems.find((item) => item.key === section)?.label ?? "Overview";
  const profileName = String(
    user?.user_metadata?.company_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Your workspace",
  );
  const profileAvatar =
    typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : "";
  const profileInitials = profileName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleGo(target: string) {
    const key = target.replace(/^\/dashboard\/?/, "") || "overview";
    setSection(key);
    void navigate({ to: target as never });
  }

  function openSavedInvoice(invoice: Invoice) {
    setShowNew(false);
    setEditingInvoiceId(invoice.id);
  }

  const exportInvoices = () => {
    const escapeCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [
      ["Invoice number", "Client", "Issue date", "Due date", "Currency", "Amount", "Status"],
      ...invoices.map((invoice) => [
        invoice.number,
        invoice.clientName,
        invoice.issueDate,
        invoice.dueDate,
        invoice.currency,
        invoice.amount,
        invoice.status,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "envoiz-invoices.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice CSV downloaded.");
  };

  return (
    <main className="workspace" data-testid="dashboard-workspace">
      <CompanyOnboardingWizard />
      <aside className={`workspace-sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <a href="/" className="workspace-brand" data-testid="link-home">
          <img className="brand-mark" src="/envoiz-brand-mark-cropped.png" alt="" />
          <span>
            envoiz<small>INVOICING WORKSPACE</small>
          </span>
        </a>
        <a href="/" className="back-home" data-testid="link-back-home">
          <ArrowDownLeft size={15} /> Back to envoiz.com
        </a>
        <div className="workspace-switch">
          <span className="workspace-monogram">ES</span>
          <span>
            <b>{profileName}</b>
            <small>Freelancer plan</small>
          </span>
        </div>
        <p className="side-label">WORKSPACE</p>
        <nav className="workspace-nav" aria-label="Dashboard navigation">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              type="button"
              key={key}
              onClick={() => {
                setSection(key);
                setMobileNav(false);
                void navigate({
                  to: (key === "overview" ? "/dashboard" : `/dashboard/${key}`) as never,
                });
              }}
              className={`workspace-nav-link ${section === key ? "selected" : ""}`}
              data-testid={`nav-${key}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {key === "invoices" && <em>6</em>}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="help-card">
            <span className="help-icon">
              <LifeBuoy size={17} />
            </span>
            <b>Need a hand?</b>
            <p>Our support team is here to help.</p>
            <button onClick={() => window.alert("Help center preview")} data-testid="button-help">
              Visit help center <ChevronRight size={13} />
            </button>
          </div>
          <div className="profile-row">
            <span className="profile-avatar">{profileInitials}</span>
            <span>
              <b>{profileName}</b>
              <small>Owner account</small>
            </span>
          </div>
        </div>
      </aside>

      {mobileNav && (
        <button
          type="button"
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}

      <section className="workspace-main">
        <header className="workspace-header">
          <button
            type="button"
            className="mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileNav(true)}
            data-testid="button-mobile-menu"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <b>{title}</b>
          </div>
          <div className="header-actions">
            <span className="local-note">Synced workspace</span>
            <button
              type="button"
              className="icon-button"
              aria-label="Notifications"
              onClick={() => window.alert("You are all caught up.")}
              data-testid="button-notifications"
            >
              <Bell size={18} />
              <i />
            </button>
            <button
              type="button"
              className="profile-picture-button"
              onClick={() => profileFileRef.current?.click()}
              title="Change profile picture"
              disabled={uploadingProfile}
            >
              {profileAvatar ? (
                <img className="profile-avatar header-avatar" src={profileAvatar} alt="Profile" />
              ) : (
                <span className="profile-avatar header-avatar">{profileInitials}</span>
              )}
            </button>
            <input
              ref={profileFileRef}
              hidden
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadProfilePicture(file);
                event.currentTarget.value = "";
              }}
            />
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {section === "overview" ? "MONDAY, JUNE 23, 2025" : "YOUR BUSINESS, AT A GLANCE"}
              </p>
              <h1>{section === "overview" ? "Good morning, Jordan" : title}</h1>
              <p className="page-subtitle">
                {section === "overview"
                  ? "Here’s where your business stands today."
                  : pageDescription(section)}
              </p>
            </div>
            <div className="heading-actions">
              {section !== "settings" && (
                <button
                  type="button"
                  className="quiet-button"
                  onClick={exportInvoices}
                  data-testid="button-export"
                >
                  <Download size={15} /> Export
                </button>
              )}
              {["overview", "invoices"].includes(section) && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setShowNew(true)}
                  data-testid="button-new-invoice"
                >
                  <Plus size={16} /> New invoice
                </button>
              )}
            </div>
          </div>

          {section === "overview" && (
            <Overview
              invoices={invoices}
              currency={settings.currency}
              rates={exchangeRates}
              onOpenInvoice={openSavedInvoice}
              onGo={handleGo}
            />
          )}
          {section === "invoices" && (
            <InvoicePage
              invoices={visibleInvoices}
              search={search}
              setSearch={setSearch}
              filter={filter}
              setFilter={setFilter}
              currency={settings.currency}
              rates={exchangeRates}
              onOpenInvoice={openSavedInvoice}
              onNew={() => setShowNew(true)}
            />
          )}
          {section === "clients" && (
            <ClientsPage
              clients={visibleClients}
              search={clientSearch}
              setSearch={setClientSearch}
              onOpenClient={setActiveClient}
            />
          )}
          {section === "reports" && (
            <ReportsPage invoices={invoices} period={period} setPeriod={setPeriod} />
          )}
          {section === "settings" && (
            <SettingsPage
              settings={settings}
              setSettings={setSettings}
              emailLocked={
                user?.app_metadata?.provider !== "github" ||
                Boolean(user?.user_metadata?.company_email)
              }
              onSaveProfile={saveProfileSettings}
              savingProfile={savingProfile}
              onDeleteAccount={deleteAccount}
              deletingAccount={deletingAccount}
              onCurrencyChange={async (currency) => {
                if (!user) return;
                const { error } = await supabase.auth.updateUser({
                  data: { default_currency: currency },
                });
                if (error) {
                  console.error("Unable to save default currency", error);
                  toast.error("Unable to save the default currency.");
                  return;
                }
                setSettings((previous) => ({ ...previous, currency }));
                await refreshSession();
                toast.success("Default currency saved.");
              }}
            />
          )}
        </div>
      </section>

      <InvoiceFormDialog
        open={showNew || Boolean(editingInvoiceId)}
        invoiceId={editingInvoiceId}
        onOpenChange={(isOpen) => {
          setShowNew(isOpen && !editingInvoiceId);
          if (!isOpen) setEditingInvoiceId(null);
        }}
        onSaved={() => setInvoiceRefreshKey((key) => key + 1)}
      />
      {activeClient && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveClient(null);
          }}
        >
          <section className="modal-panel detail-panel">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">CLIENT PROFILE</p>
                <h2>{activeClient.company}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close client details"
                onClick={() => setActiveClient(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="client-profile">
              <span className="client-avatar">
                {activeClient.company
                  .split(/\s/)
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <b>{activeClient.name}</b>
                <span>{activeClient.email}</span>
              </div>
            </div>
            <div className="client-metrics">
              <div>
                <small>Lifetime invoiced</small>
                <b>
                  {formatProfileCurrencyTotal(
                    invoices.filter((invoice) => invoice.clientId === activeClient.id),
                    settings.currency,
                    exchangeRates,
                  )}
                </b>
              </div>
              <div>
                <small>Invoices created</small>
                <b>{activeClient.lastInvoiceDate ? "View invoice history" : "No invoices yet"}</b>
              </div>
            </div>
            <div className="detail-grid">
              <span>Last invoice</span>
              <b>{activeClient.lastInvoiceDate}</b>
              <span>Company</span>
              <b>{activeClient.company}</b>
            </div>
            <button
              type="button"
              className="primary-button full-button"
              onClick={() => {
                setActiveClient(null);
                handleGo("/dashboard/invoices");
              }}
            >
              View invoices
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

function Overview({
  invoices,
  currency,
  rates,
  onOpenInvoice,
  onGo,
}: {
  invoices: Invoice[];
  currency: string;
  rates: Record<string, number>;
  onOpenInvoice: (invoice: Invoice) => void;
  onGo: (path: string) => void;
}) {
  const totalValue = formatProfileCurrencyTotal(invoices, currency, rates);
  const drafts = invoices.filter((invoice) => invoice.status === "Draft");
  const openInvoices = invoices.filter(
    (invoice) => invoice.status === "Due" || invoice.status === "Overdue",
  );
  const openValue = formatProfileCurrencyTotal(openInvoices, currency, rates);
  const paid = invoices.filter((invoice) => invoice.status === "Paid");

  return (
    <div className="dashboard-stack">
      <div className="metric-grid">
        <Metric
          label="Invoice value"
          value={totalValue}
          note={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"} created`}
          icon={<FileText size={17} />}
          accent="mint"
        />
        <Metric
          label="Due or overdue"
          value={openValue}
          note={`${openInvoices.length} invoice${openInvoices.length === 1 ? "" : "s"} marked due or overdue`}
          icon={<Clock3 size={17} />}
          accent="amber"
        />
        <Metric
          label="Invoices issued"
          value={`${invoices.length}`}
          note="Saved in your workspace"
          icon={<FileText size={17} />}
          accent="blue"
        />
        <Metric
          label="Paid invoices"
          value={`${paid.length}`}
          note={`${drafts.length} draft${drafts.length === 1 ? "" : "s"}`}
          icon={<ArrowUpRight size={17} />}
          accent="lilac"
        />
      </div>
      <div className="overview-grid">
        <section className="panel revenue-panel">
          <div className="panel-heading">
            <div>
              <h2>Revenue overview</h2>
              <p>Total value of invoices created</p>
            </div>
            <button
              type="button"
              className="select-button"
              onClick={() => onGo("/dashboard/reports")}
            >
              6 months <ChevronDown size={14} />
            </button>
          </div>
          <div className="revenue-total">
            <b>{totalValue}</b>
            <small>
              {invoices.length
                ? "Based on saved invoice line items"
                : "Create your first invoice to see totals"}
            </small>
          </div>
          <div className="chart" aria-label="Revenue chart">
            <div className="chart-y">
              <span>$8k</span>
              <span>$6k</span>
              <span>$4k</span>
              <span>$2k</span>
              <span>$0</span>
            </div>
            <div className="chart-stage">
              <div className="chart-gridlines">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="chart-bars">
                {[43, 62, 51, 76, 58, 88].map((height, index) => (
                  <div className="bar-column" key={index}>
                    <span style={{ height: `${height}%` }} />
                    <small>{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-legend">
            <span>
              <i /> Invoice value
            </span>
          </div>
        </section>
        <section className="panel due-panel">
          <div className="panel-heading">
            <div>
              <h2>Needs your attention</h2>
              <p>Review invoices that need work</p>
            </div>
            <span className="attention-count">{drafts.length}</span>
          </div>
          {drafts.length > 0 && (
            <div className="attention-block">
              <span className="attention-icon late">
                <Clock3 size={17} />
              </span>
              <div>
                <b>
                  {drafts.length} draft invoice{drafts.length > 1 ? "s" : ""}
                </b>
                <p>{formatProfileCurrencyTotal(drafts, currency, rates)} still needs details</p>
              </div>
            </div>
          )}
          {openInvoices.length > 0 && drafts.length === 0 && (
            <div className="attention-block">
              <span className="attention-icon soon">
                <CalendarDays size={17} />
              </span>
              <div>
                <b>
                  {openInvoices.length} invoice{openInvoices.length > 1 ? "s" : ""} marked due or
                  overdue
                </b>
                <p>Open an invoice to update its status or download it.</p>
              </div>
            </div>
          )}
          <button type="button" className="text-link" onClick={() => onGo("/dashboard/invoices")}>
            Review invoices <ChevronRight size={14} />
          </button>
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent invoices</h2>
            <p>Your latest activity at a glance</p>
          </div>
          <button type="button" className="text-link" onClick={() => onGo("/dashboard/invoices")}>
            All invoices <ChevronRight size={14} />
          </button>
        </div>
        <InvoiceTable invoices={invoices.slice(0, 4)} onOpenInvoice={onOpenInvoice} />
      </section>
      <div className="activity-strip">
        <span className="activity-mark">
          <Check size={16} />
        </span>
        <div>
          <b>Workspace ready</b>
          <p>Your invoice data is stored in Supabase and ready to manage.</p>
        </div>
        <small>{invoices.length} saved</small>
        <button
          type="button"
          aria-label="View invoices"
          onClick={() => onGo("/dashboard/invoices")}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  note,
  icon,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${accent}`}>{icon}</div>
      <span className="metric-label">{label}</span>
      <b className="metric-value">{value}</b>
      <small>{note}</small>
    </article>
  );
}

function InvoicePage({
  invoices,
  search,
  setSearch,
  filter,
  setFilter,
  currency,
  rates,
  onOpenInvoice,
  onNew,
}: {
  invoices: Invoice[];
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  currency: string;
  rates: Record<string, number>;
  onOpenInvoice: (invoice: Invoice) => void;
  onNew: () => void;
}) {
  const total = formatProfileCurrencyTotal(invoices, currency, rates);
  const draftCount = invoices.filter((invoice) => invoice.status === "Draft").length;
  const dueCount = invoices.filter((invoice) => invoice.status === "Due").length;
  const overdueCount = invoices.filter((invoice) => invoice.status === "Overdue").length;
  const paidCount = invoices.filter((invoice) => invoice.status === "Paid").length;
  return (
    <div className="dashboard-stack">
      <div className="metric-grid compact-metrics">
        <Metric
          label="Invoice value"
          value={total}
          note={`${invoices.length} saved`}
          icon={<FileText size={17} />}
          accent="blue"
        />
        <Metric
          label="Paid"
          value={`${paidCount}`}
          note="Marked as paid"
          icon={<Check size={17} />}
          accent="mint"
        />
        <Metric
          label="Drafts"
          value={`${draftCount}`}
          note="Still being prepared"
          icon={<Clock3 size={17} />}
          accent="amber"
        />
        <Metric
          label="Due / overdue"
          value={`${dueCount + overdueCount}`}
          note={`${overdueCount} overdue`}
          icon={<CalendarDays size={17} />}
          accent="lilac"
        />
      </div>
      <section className="panel list-panel">
        <div className="list-toolbar">
          <div className="tab-row">
            {["All invoices", "Paid", "Due", "Overdue", "Draft"].map((item) => (
              <button
                type="button"
                key={item}
                className={`list-tab ${filter === item ? "active" : ""}`}
                onClick={() => setFilter(item)}
                data-testid={`filter-${item.toLowerCase().replace(" ", "-")}`}
              >
                {item}
                <span>
                  {item === "All invoices"
                    ? invoices.length
                    : invoices.filter((invoice) => invoice.status === item).length}
                </span>
              </button>
            ))}
          </div>
          <div className="toolbar-controls">
            <label className="search-field">
              <Search size={16} />
              <input
                placeholder="Search invoices..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                data-testid="input-search-invoices"
              />
              <kbd>/</kbd>
            </label>
            <button
              type="button"
              className="filter-button"
              onClick={() => setFilter(filter === "All invoices" ? "Due" : "All invoices")}
            >
              <Filter size={15} /> Filter
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <InvoiceTable invoices={invoices} onOpenInvoice={onOpenInvoice} />
        </div>
        {invoices.length === 0 && (
          <EmptyState title="No matching invoices" detail="Try another search or status filter." />
        )}
      </section>
    </div>
  );
}

function InvoiceTable({
  invoices,
  onOpenInvoice,
}: {
  invoices: Invoice[];
  onOpenInvoice: (invoice: Invoice) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>INVOICE</th>
            <th>CLIENT</th>
            <th>ISSUED</th>
            <th>DUE DATE</th>
            <th>AMOUNT</th>
            <th>STATUS</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              onClick={() => onOpenInvoice(invoice)}
              className="clickable-row"
              data-testid={`row-invoice-${invoice.id}`}
            >
              <td>
                <b className="invoice-number">{invoice.number}</b>
                <small>Invoice</small>
              </td>
              <td>
                <span className="client-cell">
                  <i>
                    {invoice.clientName
                      .split(/\s/)
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </i>
                  {invoice.clientName}
                </span>
              </td>
              <td>{shortDate(invoice.issueDate)}</td>
              <td>{shortDate(invoice.dueDate)}</td>
              <td>
                <b className="amount-cell">{money(invoice.amount, invoice.currency)}</b>
              </td>
              <td>
                <Status>{invoice.status}</Status>
              </td>
              <td>
                <button
                  type="button"
                  className="row-more"
                  aria-label={`Open ${invoice.number}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenInvoice(invoice);
                  }}
                >
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClientsPage({
  clients: rows,
  search,
  setSearch,
  onOpenClient,
}: {
  clients: Client[];
  search: string;
  setSearch: (value: string) => void;
  onOpenClient: (client: Client) => void;
}) {
  return (
    <div className="dashboard-stack">
      <div className="metric-grid compact-metrics client-metrics-top">
        <Metric
          label="Active clients"
          value={`${rows.length}`}
          note="From saved invoices"
          icon={<Users size={17} />}
          accent="blue"
        />
        <Metric
          label="Client records"
          value={`${rows.filter((client) => client.email).length}`}
          note="With an email address"
          icon={<ArrowUpRight size={17} />}
          accent="mint"
        />
        <Metric
          label="Last activity"
          value={rows.length ? shortDate(rows[0].lastInvoiceDate) : "—"}
          note="Most recently saved invoice"
          icon={<Clock3 size={17} />}
          accent="amber"
        />
        <Metric
          label="Invoice currencies"
          value={`${new Set(rows.flatMap((client) => Object.keys(client.currencyTotals))).size}`}
          note="Kept separate in totals"
          icon={<BriefcaseBusiness size={17} />}
          accent="lilac"
        />
      </div>
      <section className="panel list-panel">
        <div className="client-list-toolbar">
          <div>
            <h2>Your clients</h2>
            <p>Good work starts with good relationships.</p>
          </div>
          <label className="search-field">
            <Search size={16} />
            <input
              placeholder="Search clients..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              data-testid="input-search-clients"
            />
          </label>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>CLIENT</th>
                <th>EMAIL</th>
                <th>LIFETIME INVOICED</th>
                <th>INVOICE CURRENCIES</th>
                <th>LAST INVOICE</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((client) => (
                <tr
                  className="clickable-row"
                  key={client.id}
                  onClick={() => onOpenClient(client)}
                  data-testid={`row-client-${client.id}`}
                >
                  <td>
                    <span className="client-cell">
                      <i>
                        {client.company
                          .split(/\s/)
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </i>
                      <span>
                        <b>{client.company}</b>
                        <small>{client.name}</small>
                      </span>
                    </span>
                  </td>
                  <td>{client.email}</td>
                  <td>
                    <b className="amount-cell">{formatCurrencyBreakdown(client.currencyTotals)}</b>
                  </td>
                  <td>
                    <b className="amount-cell">
                      {Object.keys(client.currencyTotals).join(", ") || "—"}
                    </b>
                  </td>
                  <td>{client.lastInvoiceDate}</td>
                  <td>
                    <ChevronRight size={16} className="row-chevron" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <EmptyState title="No clients found" detail="Try a different name or company." />
        )}
      </section>
    </div>
  );
}

function ReportsPage({
  invoices,
  period,
  setPeriod,
}: {
  invoices: Invoice[];
  period: string;
  setPeriod: (value: string) => void;
}) {
  const statuses: Invoice["status"][] = ["Paid", "Due", "Overdue", "Draft"];
  const startDate = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (period === "This year") return new Date(start.getFullYear(), 0, 1);
    start.setMonth(start.getMonth() - (period === "Last 12 months" ? 12 : 6));
    return start;
  }, [period]);
  const filteredInvoices = useMemo(
    () => invoices.filter((invoice) => new Date(`${invoice.issueDate}T12:00:00`) >= startDate),
    [invoices, startDate],
  );
  const total = Math.max(filteredInvoices.length, 1);
  const counts = Object.fromEntries(
    statuses.map((status) => [
      status,
      filteredInvoices.filter((invoice) => invoice.status === status).length,
    ]),
  ) as Record<Invoice["status"], number>;

  return (
    <div className="dashboard-stack">
      <div className="report-toolbar">
        <div>
          <p className="eyebrow">INVOICE REPORT</p>
          <b>See the status of your saved invoices</b>
        </div>
        <select
          className="select-button"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          data-testid="select-report-period"
        >
          <option>Last 6 months</option>
          <option>This year</option>
          <option>Last 12 months</option>
        </select>
      </div>
      <div className="metric-grid">
        <Metric
          label="Invoices created"
          value={`${filteredInvoices.length}`}
          note={`Saved during ${period.toLowerCase()}`}
          icon={<FileText size={17} />}
          accent="mint"
        />
        <Metric
          label="Marked paid"
          value={`${counts.Paid}`}
          note="Manually assigned status"
          icon={<Check size={17} />}
          accent="blue"
        />
        <Metric
          label="Due or overdue"
          value={`${counts.Due + counts.Overdue}`}
          note={`${counts.Overdue} overdue`}
          icon={<Clock3 size={17} />}
          accent="amber"
        />
        <Metric
          label="Drafts"
          value={`${counts.Draft}`}
          note="Still being prepared"
          icon={<FileText size={17} />}
          accent="lilac"
        />
      </div>
      <section className="panel summary-panel">
        <div className="panel-heading">
          <div>
            <h2>Invoice summary</h2>
            <p>Status is set on each invoice and does not process payments.</p>
          </div>
        </div>
        {statuses.map((status) => {
          const count = counts[status];
          const percent = Math.round((count / total) * 100);
          return (
            <div className="summary-line" key={status}>
              <span>
                <i className={`summary-dot ${status.toLowerCase()}-dot`} />
                {status}
              </span>
              <b>
                {count} <small>· {percent}%</small>
              </b>
              <span className="summary-track">
                <i style={{ width: `${percent}%` }} />
              </span>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function SettingsPage({
  settings,
  setSettings,
  emailLocked,
  onSaveProfile,
  savingProfile,
  onCurrencyChange,
  onDeleteAccount,
  deletingAccount,
}: {
  settings: {
    businessName: string;
    email: string;
    currency: string;
  };
  setSettings: (value: (previous: typeof settings) => typeof settings) => void;
  emailLocked: boolean;
  onSaveProfile: () => void;
  savingProfile: boolean;
  onCurrencyChange: (currency: string) => void | Promise<void>;
  onDeleteAccount: () => void | Promise<void>;
  deletingAccount: boolean;
}) {
  return (
    <div className="settings-layout">
      <div className="settings-main">
        <section className="panel settings-panel">
          <div className="settings-title">
            <span className="settings-icon">
              <BriefcaseBusiness size={18} />
            </span>
            <div>
              <h2>Business profile</h2>
              <p>The details your clients see on invoices.</p>
            </div>
          </div>
          <div className="settings-fields">
            <label>
              Company / profile name
              <input
                value={settings.businessName}
                onChange={(event) =>
                  setSettings((previous) => ({ ...previous, businessName: event.target.value }))
                }
                data-testid="input-business-name"
              />
            </label>
            <label>
              Business email
              <input
                type="email"
                value={settings.email}
                onChange={(event) =>
                  setSettings((previous) => ({ ...previous, email: event.target.value }))
                }
                readOnly={emailLocked}
                placeholder={emailLocked ? "" : "Add an email address"}
                data-testid="input-business-email"
              />
            </label>
          </div>
          <div className="save-note">
            <span>
              <Check size={14} />{" "}
              {emailLocked
                ? "Email is linked to your account."
                : "Link an email to show it on your invoices."}
            </span>
            <button
              type="button"
              className="primary-button"
              onClick={onSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </button>
          </div>
        </section>

        <section className="panel settings-panel">
          <div className="settings-title">
            <span className="settings-icon">
              <SlidersHorizontal size={18} />
            </span>
            <div>
              <h2>Currency</h2>
              <p>Choose the currency used on new invoices.</p>
            </div>
          </div>
          <label className="wide-field">
            Default currency
            <select
              value={settings.currency}
              onChange={(event) => {
                void onCurrencyChange(event.target.value);
              }}
              data-testid="select-currency"
            >
              {currencyOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.code} — {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="panel settings-panel account-danger-panel">
          <div className="settings-title">
            <span className="settings-icon account-danger-icon">
              <X size={18} />
            </span>
            <div>
              <h2>Delete account</h2>
              <p>Permanently remove your account, invoices, and uploaded profile data.</p>
            </div>
          </div>
          <div className="save-note">
            <span>This cannot be undone.</span>
            <button
              type="button"
              className="danger-button"
              onClick={() => void onDeleteAccount()}
              disabled={deletingAccount}
            >
              {deletingAccount ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </section>
      </div>

      <aside className="settings-aside">
        <div className="settings-aside-mark">
          <Settings size={20} />
        </div>
        <h3>
          Your workspace,
          <br />
          your way.
        </h3>
        <p>These preferences help shape your day-to-day invoicing experience.</p>
        <div className="preference-note">
          <Check size={15} /> Saved to your account
        </div>
      </aside>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty-state">
      <span>
        <Search size={19} />
      </span>
      <b>{title}</b>
      <p>{detail}</p>
    </div>
  );
}

export default DashboardApp;
