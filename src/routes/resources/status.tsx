import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brandName } from "@/lib/envoiz";

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
  { name: "API", status: "Operational" },
  { name: "PDF Generation", status: "Operational" },
  { name: "Authentication", status: "Operational" },
  { name: "Dashboard", status: "Operational" },
  { name: "Email Notifications", status: "Operational" },
  { name: "Webhooks", status: "Operational" },
  { name: "Database", status: "Operational" },
  { name: "CDN & File Storage", status: "Operational" },
];

const incidents: Incident[] = [
  {
    date: "30 days ago",
    title: "Resolved: Brief API latency spike",
    description:
      "A short-lived queue backlog increased request latency for a small subset of reads.",
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

function statusClass(status: ServiceStatus) {
  switch (status) {
    case "Operational":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
    case "Degraded":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700";
    case "Outage":
      return "border-rose-500/20 bg-rose-500/10 text-rose-700";
  }
}

export const Route = createFileRoute("/resources/status")({
  head: () => ({
    meta: [{ title: `Status - ${brandName}` }, { name: "description", content: "Envoiz status" }],
  }),
  component: StatusPage,
});

function StatusPage() {
  const lastUpdated = new Date().toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <section className="text-center">
        <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-emerald-700">
          <span className="text-sm font-medium">All Systems Operational</span>
        </div>
        <p className="mt-4 text-[13px] text-muted-foreground">Last updated: {lastUpdated}</p>
      </section>

      <section className="mt-10">
        <Card className="border-hairline bg-white/80">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xl">Service status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.name}>
                    <TableCell className="py-4 font-medium">{service.name}</TableCell>
                    <TableCell className="py-4 text-right">
                      <Badge className={statusClass(service.status)} variant="outline">
                        {service.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["API Uptime (30 days)", "99.98%"],
          ["PDF Generation Uptime (30 days)", "99.91%"],
          ["Overall Uptime (90 days)", "99.95%"],
        ].map(([label, value]) => (
          <Card key={label} className="border-hairline bg-white/80">
            <CardContent className="p-6">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </p>
              <div className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <Card className="border-hairline bg-white/80">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xl">Incident history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            {incidents.map((incident) => (
              <div key={incident.title} className="rounded-2xl border border-hairline bg-white p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                      {incident.date}
                    </p>
                    <h3 className="mt-2 text-[16px] font-semibold">{incident.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                      {incident.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Badge
                      className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                      variant="outline"
                    >
                      Resolved
                    </Badge>
                    <Badge variant="secondary">{incident.duration}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <p className="mt-8 text-center text-[13px] text-muted-foreground">
        Experiencing an issue? Contact support at support@envoiz.com
      </p>
    </div>
  );
}
