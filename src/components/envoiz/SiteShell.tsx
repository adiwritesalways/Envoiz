import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Menu, Github, Linkedin, Twitter, X } from "lucide-react";

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
  dark?: boolean;
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

export function SiteShell({ children, dark }: SiteShellProps) {
  return (
    <div className={`min-h-screen font-sans antialiased ${dark ? "bg-[#050505] text-[#F5F5F5]" : "bg-background text-foreground"}`}>
      <SiteHeader dark={dark} />
      <div aria-hidden className="h-16" />
      {children}
      <SiteFooter dark={dark} />
    </div>
  );
}

function SiteHeader({ dark }: { dark?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 pt-6 px-6 md:px-12 flex items-center justify-between pointer-events-none">
      
      {/* Logo */}
      <div className="pointer-events-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <BrandLogo className={`h-10 w-auto transition-transform duration-300 group-hover:scale-105 ${dark ? "invert" : ""}`} />
        </Link>
      </div>

      {/* Center Nav Pill */}
      <nav className={`hidden md:flex absolute left-1/2 -translate-x-1/2 pointer-events-auto items-center gap-8 backdrop-blur-[20px] backdrop-saturate-[160%] border shadow-[0_8px_30px_rgba(0,0,0,0.35)] rounded-full px-8 py-3 transition-all duration-300 ${
        dark 
          ? "bg-white/[0.045] border-white/[0.09] hover:border-white/[0.16] hover:shadow-[0_10px_36px_rgba(0,0,0,0.5)]" 
          : "bg-black/[0.045] border-black/[0.09] hover:border-black/[0.16] shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.15)]"
      }`}>
        <a href="/#features" className={`text-sm font-medium transition-colors tracking-[0.01em] ${dark ? "text-[#9a98a3] hover:text-[#f4f2ec]" : "text-muted-foreground hover:text-foreground"}`}>Features</a>
        <a href="/#how-it-works" className={`text-sm font-medium transition-colors tracking-[0.01em] ${dark ? "text-[#9a98a3] hover:text-[#f4f2ec]" : "text-muted-foreground hover:text-foreground"}`}>How It Works</a>
        <a href="/#pricing" className={`text-sm font-medium transition-colors tracking-[0.01em] ${dark ? "text-[#9a98a3] hover:text-[#f4f2ec]" : "text-muted-foreground hover:text-foreground"}`}>Pricing</a>
        
        {/* Resources Dropdown */}
        <div className="relative group/res">
          <button className={`flex items-center gap-1 text-sm font-medium transition-colors tracking-[0.01em] ${dark ? "text-[#9a98a3] hover:text-[#f4f2ec]" : "text-muted-foreground hover:text-foreground"}`}>
            Resources <ChevronDown size={14} className="transition-transform duration-200 group-hover/res:rotate-180" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover/res:opacity-100 group-hover/res:visible transition-all duration-200 pointer-events-none group-hover/res:pointer-events-auto">
            <div className={`w-44 rounded-2xl backdrop-blur-2xl border p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-0.5 ${dark ? "bg-[#0D0D0D]/95 border-white/10" : "bg-white/95 border-black/10"}`}>
              {[{label: "Docs", to: "/resources/docs"}, {label: "Blog", to: "/resources/blog"}, {label: "Support", to: "/resources/support"}, {label: "Status", to: "/resources/status"}].map(link => (
                <Link key={link.label} to={link.to} className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl transition-colors ${dark ? "text-[#888888] hover:text-white hover:bg-white/[0.06]" : "text-muted-foreground hover:text-foreground hover:bg-black/[0.06]"}`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Link to="/about" className={`text-sm font-medium transition-colors tracking-[0.01em] ${dark ? "text-[#9a98a3] hover:text-[#f4f2ec]" : "text-muted-foreground hover:text-foreground"}`}>About</Link>
      </nav>

      {/* Right Action buttons */}
      <div className="hidden md:flex pointer-events-auto items-center">
        <Link 
          to="/signup" 
          className={`text-sm px-6 py-3 rounded-full font-bold transition-all duration-200 hover:-translate-y-[1px] ${dark ? "bg-[#f4f2ec] text-[#0a0a0c] hover:bg-[#e0e0e0]" : "bg-black text-white hover:bg-[#333333] hover:text-white"}`}
        >
          Get Started
        </Link>
      </div>

      {/* Mobile Menu Icon */}
      <div className="md:hidden pointer-events-auto">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 ${dark ? "text-white" : "text-black"}`}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className={`md:hidden fixed top-24 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] backdrop-blur-xl border rounded-2xl py-6 px-6 flex flex-col gap-4 animate-fadeIn z-50 pointer-events-auto ${dark ? "bg-[#0D0D0D]/90 border-[#1A1A1A]" : "bg-white/90 border-black/10 shadow-xl"}`}>
          <a href="/#features" onClick={() => setMobileMenuOpen(false)} className={`text-base py-2 ${dark ? "text-[#888888] hover:text-white" : "text-muted-foreground hover:text-black"}`}>Features</a>
          <a href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className={`text-base py-2 ${dark ? "text-[#888888] hover:text-white" : "text-muted-foreground hover:text-black"}`}>How It Works</a>
          <a href="/#pricing" onClick={() => setMobileMenuOpen(false)} className={`text-base py-2 ${dark ? "text-[#888888] hover:text-white" : "text-muted-foreground hover:text-black"}`}>Pricing</a>
          <div className={`h-[1px] my-2 ${dark ? "bg-[#1A1A1A]" : "bg-black/10"}`} />
          <div className={`flex flex-col gap-3 pt-6 border-t ${dark ? "border-[#111111]" : "border-black/10"}`}>
            <Link to="/login" className={`text-center text-sm py-2.5 ${dark ? "text-[#888888] hover:text-white" : "text-muted-foreground hover:text-black"}`}>Log in</Link>
            <Link to="/signup" className={`text-center text-sm py-3 rounded font-medium ${dark ? "bg-white text-black" : "bg-black text-white"}`}>Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function SiteFooter({ dark }: { dark?: boolean }) {
  return (
    <footer className={`border-t py-16 px-6 ${dark ? "border-[#111111] bg-[#050505]" : "border-hairline bg-surface/60"}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8">
        
        {/* Logo Brand Segment */}
        <div className="md:col-span-2 space-y-6">
          <Link to="/" className="flex items-center gap-3 group">
            <BrandLogo className={`h-10 w-auto transition-transform duration-300 group-hover:scale-105 ${dark ? "invert" : ""}`} />
          </Link>
          <p className={`text-xs max-w-sm leading-relaxed ${dark ? "text-[#888888]" : "text-muted-foreground"}`}>
            Highly polished transactional SaaS invoicing utility systems. Streamlined structures for freelancers, agencies, and small enterprise environments.
          </p>
        </div>

        {/* Links columns */}
        <div>
          <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${dark ? "text-[#888888]" : "text-muted-foreground"}`}>Product</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="/#features" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>Features</a></li>
            <li><a href="/#pricing" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>Pricing</a></li>
            <li><a href="#" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>Templates</a></li>
            <li><a href="#" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>Changelog</a></li>
          </ul>
        </div>

        <div>
          <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${dark ? "text-[#888888]" : "text-muted-foreground"}`}>Company</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/about" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>About</Link></li>
            <li><Link to="/security" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>Security</Link></li>
            <li><Link to="/privacy-policy" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>Privacy Policy</Link></li>
            <li><Link to="/terms" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${dark ? "text-[#888888]" : "text-muted-foreground"}`}>Resources</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/resources/docs" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>Docs</Link></li>
            <li><Link to="/resources/blog" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>Blog</Link></li>
            <li><Link to="/resources/support" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>Support</Link></li>
            <li><Link to="/resources/status" className={`transition-colors ${dark ? "text-[#555555] hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>Status</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom copyright alignment */}
      <div className={`max-w-7xl mx-auto mt-16 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] ${dark ? "border-[#111111] text-[#555555]" : "border-hairline text-muted-foreground"}`}>
        <p>© {new Date().getFullYear()} Envoiz SaaS, Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className={`transition-colors ${dark ? "hover:text-white" : "hover:text-foreground"}`}>GitHub</a>
          <a href="#" className={`transition-colors ${dark ? "hover:text-white" : "hover:text-foreground"}`}>Twitter</a>
          <a href="#" className={`transition-colors ${dark ? "hover:text-white" : "hover:text-foreground"}`}>LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
