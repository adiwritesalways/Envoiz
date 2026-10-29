import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Menu, Github, Linkedin, Twitter } from "lucide-react";

import { BrandLogo } from "@/components/BrandLogo";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { brandName } from "@/lib/envoiz";

type SiteShellProps = {
  children: ReactNode;
};

const primaryNavLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it Works", href: "/#how" },
  { label: "API", href: "/#api" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
] as const;

const resourceLinks = [
  { label: "Docs", to: "/resources/docs", description: "Developer and user reference docs." },
  { label: "Blog", to: "/resources/blog", description: "Product stories and invoicing tips." },
  {
    label: "Support",
    to: "/resources/support",
    description: "Answers, contact options, and help.",
  },
  { label: "Status", to: "/resources/status", description: "Service health and incident history." },
] as const;

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms", to: "/terms" },
  { label: "Security", to: "/security" },
] as const;

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <SiteHeader />
      <div aria-hidden className="h-16" />
      {children}
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-150 ease-out ${scrolled ? "border-b border-white/10 bg-background/70 backdrop-blur-sm shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_8px_20px_rgba(0,0,0,0.04)]" : "bg-background/0"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="/" className="inline-flex items-center" aria-label={brandName}>
          <BrandLogo className="h-12 w-auto" />
        </a>

        <nav className="hidden items-center gap-8 text-[13.5px] text-muted-foreground md:flex">
          {primaryNavLinks.slice(0, 3).map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}

          <NavigationMenu>
            <NavigationMenuList className="space-x-0">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9 bg-transparent px-0 text-[13.5px] font-normal text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=open]:bg-transparent">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-[300px]">
                  <div className="overflow-hidden rounded-2xl border border-hairline bg-popover p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                    <div className="px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Resources
                      </p>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        Docs, updates, support, and service status.
                      </p>
                    </div>
                    <div className="grid gap-1">
                      {resourceLinks.map((link) => (
                        <Link
                          key={link.label}
                          to={link.to}
                          className="rounded-xl px-3 py-2 transition-colors hover:bg-secondary"
                        >
                          <div className="text-[13px] font-medium text-foreground">
                            {link.label}
                          </div>
                          <div className="mt-0.5 text-[12px] text-muted-foreground">
                            {link.description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {primaryNavLinks.slice(3).map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-white text-foreground transition-colors hover:bg-secondary md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent className="w-[320px] border-border bg-background sm:max-w-sm">
              <SheetHeader className="text-left">
                <SheetTitle className="text-base">{brandName}</SheetTitle>
                <SheetDescription>Browse the public site and resources.</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-1">
                {primaryNavLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center rounded-xl px-3 py-2 text-[14px] text-foreground transition-colors hover:bg-secondary"
                  >
                    {link.label}
                  </a>
                ))}

                <Collapsible>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-[14px] text-foreground transition-colors hover:bg-secondary">
                    Resources
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-3">
                    {resourceLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-xl px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="mt-8 flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-hairline bg-white px-4 text-[13.5px] font-medium transition-colors hover:bg-secondary"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-black px-4 text-[13.5px] font-medium text-white transition-colors hover:bg-black/85"
                >
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            to="/login"
            className="hidden h-9 items-center px-3 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black px-4 text-[13px] font-medium text-white transition-colors hover:bg-black/85"
          >
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  const cols = [
    ["Product", ["Features", "Pricing", "API", "Roadmap"]],
    ["Resources", ["Docs", "Blog", "Support", "Status"]],
    ["Company", ["About", "Privacy Policy", "Terms", "Security"]],
  ] as const;

  return (
    <footer className="border-t border-hairline bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <BrandLogo className="h-12 w-auto" />
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted-foreground">
            Smart invoicing for freelancers and businesses.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {[Github, Twitter, Linkedin].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full border border-hairline bg-white transition-colors hover:bg-secondary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <div className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
              {title}
            </div>
            <ul className="mt-4 space-y-2.5 text-[13.5px]">
              {links.map((link) => (
                <li key={link}>
                  {title === "Resources" ? (
                    <Link
                      to={
                        link === "Docs"
                          ? "/resources/docs"
                          : link === "Blog"
                            ? "/resources/blog"
                            : link === "Support"
                              ? "/resources/support"
                              : "/resources/status"
                      }
                      className="text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link}
                    </Link>
                  ) : title === "Company" ? (
                    <Link
                      to={companyLinks.find((item) => item.label === link)?.to ?? "/"}
                      className="text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link}
                    </Link>
                  ) : (
                    <a
                      href="#"
                      className="text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-hairline">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 text-[12px] text-muted-foreground">
          <span>© {new Date().getFullYear()} Envoiz, Inc.</span>
          <span>All systems normal</span>
        </div>
      </div>
    </footer>
  );
}
