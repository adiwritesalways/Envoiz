import { createFileRoute } from "@tanstack/react-router";
import { brandName } from "@/lib/envoiz";
import { CheckCircle2 } from "lucide-react";

type ServiceStatus = "Operational" | "Degraded" | "Outage";

type Service = {
  name: string;
  status: ServiceStatus;
};

type Incident = {
  date: string;
  title: string;
  description: string;
  duration: string;
};

const services: Service[] = [
  { name: "PDF Generation", status: "Operational" },
  { name: "Authentication", status: "Operational" },
  { name: "Dashboard", status: "Operational" },
  { name: "Email Notifications", status: "Operational" },
  { name: "Database", status: "Operational" },
  { name: "CDN & File Storage", status: "Operational" },
];

const incidents: Incident[] = [
  {
    date: "30 days ago",
    title: "Resolved: Brief dashboard latency spike",
    description:
      "A short-lived queue backlog increased page load times for a small subset of users.",
    duration: "14 min",
  },
  {
    date: "62 days ago",
    title: "Resolved: PDF generation queue delay",
    description: "A deployment overlap delayed rendering jobs, but no invoices were lost.",
    duration: "28 min",
  },
  {
    date: "90 days ago",
    title: "Resolved: Scheduled maintenance",
    description: "Routine maintenance completed successfully during the posted window.",
    duration: "45 min",
  },
];

function statusStyle(status: ServiceStatus) {
  switch (status) {
    case "Operational":
      return {
        dot: "bg-emerald-400",
        badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        label: "Operational",
      };
    case "Degraded":
      return {
        dot: "bg-amber-400",
        badge: "border-amber-500/20 bg-amber-500/10 text-amber-400",
        label: "Degraded",
      };
    case "Outage":
      return {
        dot: "bg-rose-400",
        badge: "border-rose-500/20 bg-rose-500/10 text-rose-400",
        label: "Outage",
      };
  }
}

export const Route = createFileRoute("/resources/status")({
  head: () => ({
    meta: [
      { title: `Status - ${brandName}` },
      { name: "description", content: "Envoiz status" },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const lastUpdated = new Date().toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#F5F5F5]">
      {/* Page-level ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 flex justify-center overflow-hidden">
        <div className="h-[500px] w-[900px] -translate-y-1/3 rounded-full bg-white/[0.03] blur-[140px]" />
      </div>
      {/* Hero Banner */}
      <section className="relative border-b border-[#111111] px-6 pb-14 pt-12 md:pb-20 md:pt-16">
        <div className="relative mx-auto max-w-7xl flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">All Systems Operational</span>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#555555]">
            Service Status
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
            System health
          </h1>
          <p className="mt-3 text-[13px] text-[#555555]">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Uptime metrics */}
        <section className="mb-10 grid gap-4 md:grid-cols-3">
          {[
            ["Invoice Uptime (30 days)", "99.98%"],
            ["PDF Generation Uptime (30 days)", "99.91%"],
            ["Overall Uptime (90 days)", "99.95%"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-6"
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#555555]">
                {label}
              </p>
              <div className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-[#aaaaaa]">
                {value}
              </div>
              {/* Uptime bar */}
              <div className="mt-4 flex gap-[2px]">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-5 flex-1 rounded-sm bg-emerald-500/30"
                    style={{
                      opacity: i === 14 || i === 22 ? 0.3 : 1,
                      backgroundColor: i === 14 || i === 22 ? "rgba(245, 158, 11, 0.4)" : undefined,
                    }}
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-[#555555]">Last 30 days</p>
            </div>
          ))}
        </section>

        {/* Service Status Table */}
        <section className="mb-10">
          <div className="overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D]">
            <div className="border-b border-[#1A1A1A] px-6 py-5">
              <h2 className="text-xl font-bold text-white">Service status</h2>
            </div>
            <div className="divide-y divide-[#111111]">
              {services.map((service) => {
                const style = statusStyle(service.status);
                return (
                  <div
                    key={service.name}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${style.dot} animate-pulse`} />
                      <span className="text-[14px] font-medium text-white">{service.name}</span>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${style.badge}`}
                    >
                      {style.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Incident History */}
        <section>
          <div className="overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D]">
            <div className="border-b border-[#1A1A1A] px-6 py-5">
              <h2 className="text-xl font-bold text-white">Incident history</h2>
            </div>
            <div className="divide-y divide-[#111111]">
              {incidents.map((incident) => (
                <div key={incident.title} className="px-6 py-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#555555]">
                        {incident.date}
                      </p>
                      <h3 className="mt-2 text-[16px] font-semibold text-white">
                        {incident.title}
                      </h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-[#888888]">
                        {incident.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                        Resolved
                      </span>
                      <span className="inline-flex items-center rounded-full border border-[#2A2A2A] bg-[#111111] px-3 py-1 text-[11px] text-[#888888]">
                        {incident.duration}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-[13px] text-[#555555]">
          Experiencing an issue?{" "}
          <a
            href="mailto:support@envoiz.com"
            className="text-[#aaaaaa] underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            Contact support
          </a>{" "}
          at support@envoiz.com
        </p>
      </div>
    </div>
  );
}
