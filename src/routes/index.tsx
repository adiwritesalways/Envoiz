import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { FeaturedCard } from "@/components/ui/featured-card";
import { useAuth } from "@/components/auth/auth-context";
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {  
  Check, 
  ChevronDown, 
  Menu, 
  X, 
  Plus, 
  Trash2, 
  Download, 
  FileText, 
  Globe, 
  Calculator, 
  Eye, 
  TrendingUp, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Types for Interactive Invoice
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceState {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: InvoiceItem[];
  taxRate: number;
  discountRate: number;
  status: 'Draft' | 'Sent' | 'Pending' | 'Paid';
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Envoiz — Smart Invoicing for Freelancers and Businesses" },
      {
        name: "description",
        content:
          "Envoiz makes invoicing effortless. Create beautiful, professional invoices in seconds, track payments, and get paid faster. Free for freelancers and small businesses.",
      },
      { property: "og:title", content: "Envoiz — Smart Invoicing for Freelancers and Businesses" },
      {
        property: "og:description",
        content:
          "Create professional invoices in seconds and get paid faster with Envoiz. Free tier available — no credit card required.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://envoiz.app" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Envoiz — Smart Invoicing for Freelancers" },
      {
        name: "twitter:description",
        content: "Create professional invoices in seconds. Free plan available.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://envoiz.app" },
    ],
  }),
  component: App,
});

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  
  // Elements for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const statsSectionRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Interactive Invoice Builder State ---
  const [invoice, setInvoice] = useState<InvoiceState>({
    invoiceNumber: 'INV-2026-001',
    clientName: 'Acme Laboratories',
    clientEmail: 'billing@acmelabs.io',
    issueDate: '2026-02-15',
    dueDate: '2026-03-15',
    currency: 'USD',
    items: [
      { id: '1', description: 'Product Design & System Architecture', quantity: 1, rate: 4500 },
      { id: '2', description: 'Frontend Engineering (React + Tailwind)', quantity: 80, rate: 75 },
    ],
    taxRate: 10,
    discountRate: 5,
    status: 'Paid'
  });

  // Calculate Invoice Values
  const getSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };
  
  const getDiscountAmount = () => {
    return getSubtotal() * (invoice.discountRate / 100);
  };

  const getTaxAmount = () => {
    return (getSubtotal() - getDiscountAmount()) * (invoice.taxRate / 100);
  };

  const getTotal = () => {
    return getSubtotal() - getDiscountAmount() + getTaxAmount();
  };

  // Update Currency Symbol when Currency changes
  useEffect(() => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      BDT: '৳'
    };
    setCurrencySymbol(symbols[invoice.currency] || '$');
  }, [invoice.currency]);

  // Handle item edits
  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedValue = field === 'description' ? value : Number(value) || 0;
          return { ...item, [field]: updatedValue };
        }
        return item;
      })
    }));
  };

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: 'New Service Item',
      quantity: 1,
      rate: 100
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const deleteInvoiceItem = (id: string) => {
    if (invoice.items.length <= 1) return; // Maintain at least one row
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // --- GSAP Scroll-Based & Entrance Animations ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial Hero Page Load Transitions
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
    
    tl.fromTo('.navbar-anim', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
      .fromTo('.hero-eyebrow', { opacity: 0, y: 15 }, { opacity: 1, y: 0 }, '-=0.4')
      .fromTo('.hero-title', { opacity: 0, y: 25 }, { opacity: 1, y: 0 }, '-=0.6')
      .fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.5')
      .fromTo('.hero-cta', { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.15 }, '-=0.4')
      .fromTo(mockupRef.current, { scale: 0.96, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: 1.5 }, '-=0.8');

    // 2. Statistics Counter Animation
    if (statsSectionRef.current) {
      const counters = statsSectionRef.current.querySelectorAll('.stat-counter');
      
      gsap.fromTo(counters, 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.2,
          scrollTrigger: {
            trigger: statsSectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // 3. Staggered Feature Reveal
    if (featuresRef.current) {
      const featureCards = featuresRef.current.querySelectorAll('.feature-card');
      gsap.fromTo(featureCards, 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // 4. Staggered Steps Reveal
    if (stepsRef.current) {
      const steps = stepsRef.current.querySelectorAll('.step-item');
      gsap.fromTo(steps,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.1,
          duration: 0.5,
          scrollTrigger: {
            trigger: stepsRef.current,
            start: 'top 80%'
          }
        }
      );
    }

    }); // end gsap.context

    // 5. Smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hash && anchor.href.includes(window.location.host)) {
        const id = anchor.hash;
        if (id === '#') return;
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);

    return () => {
      ctx.revert(); // Reverts all GSAP animations and scroll triggers safely
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  // --- FAQ Accordion Helper ---
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqData = [
    {
      q: "Is Envoiz completely free to use?",
      a: "Yes. Our Free tier allows you to generate up to 100 sleek, beautiful PDF invoices every month with zero credit card requirements. Upgrade anytime for unlimited volumes and custom branding."
    },
    {
      q: "Can I generate invoices in multiple currencies?",
      a: "Absolutely. Envoiz natively supports multi-currency options, including USD, EUR, GBP, INR, BDT, and many others, dynamically adapting your tables and formatting automatically."
    },
    {
      q: "Can I customize the design to match my brand identity?",
      a: "Yes. Pro & Business plan subscribers have the ability to upload custom logos, set matching brand accent colors, select customized typography, and hide the Envoiz footer mark."
    },
    {
      q: "Can I export invoices to high-quality PDF files?",
      a: "Absolutely. All invoices are rendered vectors and generated directly into crisp, lightweight, professional PDF documents ready to email or archive."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans antialiased selection:bg-white selection:text-black overflow-x-hidden">
      {/* 1. MINIMAL TOP NAVIGATION */}
      <header className="fixed top-0 left-0 w-full z-50 pt-6 px-6 md:px-12 flex items-center justify-between pointer-events-none">
        
        {/* Logo */}
        <div className="pointer-events-auto">
          <Link to="/" className="flex items-center gap-3 group">
            <BrandLogo className="h-10 w-auto transition-transform duration-300 group-hover:scale-105 invert" />
          </Link>
        </div>

        {/* Center Nav Pill */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 pointer-events-auto items-center gap-8 bg-white/[0.045] backdrop-blur-[20px] backdrop-saturate-[160%] border border-white/[0.09] shadow-[0_8px_30px_rgba(0,0,0,0.35)] rounded-full px-8 py-3 transition-all duration-300 hover:border-white/[0.16] hover:shadow-[0_10px_36px_rgba(0,0,0,0.5)]">
          <a href="#features" className="text-sm font-medium text-[#9a98a3] hover:text-[#f4f2ec] transition-colors tracking-[0.01em]">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-[#9a98a3] hover:text-[#f4f2ec] transition-colors tracking-[0.01em]">How It Works</a>
          <a href="#pricing" className="text-sm font-medium text-[#9a98a3] hover:text-[#f4f2ec] transition-colors tracking-[0.01em]">Pricing</a>
          
          {/* Resources Dropdown */}
          <div className="relative group/res">
            <button className="flex items-center gap-1 text-sm font-medium text-[#9a98a3] hover:text-[#f4f2ec] transition-colors tracking-[0.01em]">
              Resources <ChevronDown size={14} className="transition-transform duration-200 group-hover/res:rotate-180" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover/res:opacity-100 group-hover/res:visible transition-all duration-200 pointer-events-none group-hover/res:pointer-events-auto">
              <div className="w-44 rounded-2xl bg-[#0D0D0D]/95 backdrop-blur-2xl border border-white/10 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-0.5">
                <Link to="/resources/docs" className="flex items-center gap-2 text-xs font-medium text-[#888888] hover:text-white hover:bg-white/[0.06] px-3 py-2 rounded-xl transition-colors">
                  Docs
                </Link>
                <Link to="/resources/blog" className="flex items-center gap-2 text-xs font-medium text-[#888888] hover:text-white hover:bg-white/[0.06] px-3 py-2 rounded-xl transition-colors">
                  Blog
                </Link>
                <Link to="/resources/support" className="flex items-center gap-2 text-xs font-medium text-[#888888] hover:text-white hover:bg-white/[0.06] px-3 py-2 rounded-xl transition-colors">
                  Support
                </Link>
                <Link to="/resources/status" className="flex items-center gap-2 text-xs font-medium text-[#888888] hover:text-white hover:bg-white/[0.06] px-3 py-2 rounded-xl transition-colors">
                  Status
                </Link>
              </div>
            </div>
          </div>

          <Link to="/about" className="text-sm font-medium text-[#9a98a3] hover:text-[#f4f2ec] transition-colors tracking-[0.01em]">About</Link>
        </nav>

        {/* Right Action buttons */}
        <div className="hidden md:flex pointer-events-auto items-center">
          <Link 
            to="/signup" 
            className="text-sm bg-[#f4f2ec] text-[#0a0a0c] hover:bg-[#e0e0e0] px-6 py-3 rounded-full font-bold transition-all duration-200 hover:-translate-y-[1px]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden pointer-events-auto">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-24 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] bg-[#0D0D0D]/90 backdrop-blur-xl border border-[#1A1A1A] rounded-2xl py-6 px-6 flex flex-col gap-4 animate-fadeIn z-50">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-base text-[#888888] hover:text-white py-2">Features</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-base text-[#888888] hover:text-white py-2">How It Works</a>
          <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="text-base text-[#888888] hover:text-white py-2">Interactive Demo</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-base text-[#888888] hover:text-white py-2">Pricing</a>
          <div className="h-[1px] bg-[#1A1A1A] my-2" />
          <div className="flex flex-col gap-3 pt-6 border-t border-[#111111]">
            <Link to="/login" className="text-center text-sm py-2.5 text-[#888888] hover:text-white">Log in</Link>
            <Link to="/signup" className="text-center text-sm bg-white text-black py-3 rounded font-medium">Get Started</Link>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION */}
      <section ref={heroRef} className="relative w-full overflow-hidden bg-[#050505] pb-24 md:pb-32">
        {/* Video Background */}
        <div className="absolute top-0 left-0 right-0 h-[130vh] z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/assets/Envoiz-test-hero (1).mp4" type="video/mp4" />
          </video>
          {/* Dark overlay to make text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-[#050505] z-[1]" />
        </div>
        
        <div className="relative z-10 h-[100vh] flex flex-col justify-center items-center px-6 pt-24 md:pt-32">
          <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
            
            {/* Heading */}
            <h1 className="hero-title text-5xl sm:text-7xl md:text-8xl font-light tracking-[-0.04em] text-white mb-8 leading-[1.05]">
            <em>Beautiful</em> Invoice,<br className="hidden md:block" /> Zero <em>Complexity</em>.
          </h1>

          {/* Supporting Text */}
          <p className="hero-desc text-base sm:text-lg md:text-xl text-[#888888] max-w-2xl mb-10 font-normal leading-relaxed font-sans">
            Create beautiful, professional invoices in seconds. Send them to global clients, track payments instantly, and spend less time managing paperwork.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
            <a 
              href="#demo" 
              className="w-full sm:w-auto px-8 py-4 text-sm font-semibold tracking-wide bg-white text-black hover:bg-neutral-200 rounded-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              Start for free <ArrowRight size={16} />
            </a>
            <a 
              href="#how-it-works" 
              className="w-full sm:w-auto px-8 py-4 text-sm font-semibold tracking-wide bg-[#0D0D0D] text-white hover:bg-[#121212] border border-[#222222] rounded-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              See how it works
            </a>
          </div>

          {/* Trust Subtext */}
          <p className="hero-cta text-xs text-[#999999] tracking-wide uppercase font-mono">No credit card required • Free forever plan available</p>
          </div>
        </div>

        {/* Hero Visual Mockup: Premium Simulated Product Dashboard */}
        <div ref={mockupRef} className="max-w-6xl mx-auto mt-0 px-4 md:px-6 relative group z-30">
          {/* Subtle Ambient Light Glow Behind Mockup */}
          <div className="absolute -inset-1.5 bg-gradient-to-t from-white/5 to-white/0 rounded-xl blur-2xl opacity-40 transition duration-1000 group-hover:opacity-60" />
          
          <div className="relative rounded-xl border border-[#222222] bg-[#0D0D0D] overflow-hidden shadow-2xl">
            {/* Window Chrome Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E1E] bg-[#090909]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              </div>
              <span className="text-[11px] font-mono tracking-widest text-[#555555]">app.envoiz.io/dashboard</span>
              <div className="w-12 h-1 bg-transparent" />
            </div>

            {/* Dashboard Content */}
            <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0B0B0B]">
              
              {/* Sidebar Panel Navigation */}
              <div className="lg:col-span-3 space-y-6 hidden lg:block">
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase px-3 mb-2">Workspace</div>
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-white/5 rounded-md text-white text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Acme Freelance
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase px-3 mb-2">Finances</div>
                  <div className="px-3 py-1.5 text-xs text-[#888888] hover:text-white transition-colors cursor-pointer flex items-center justify-between">
                    <span>Overview</span>
                    <TrendingUp size={12} className="text-[#555555]" />
                  </div>
                  <div className="px-3 py-1.5 text-xs text-white font-medium bg-[#141414] rounded-md flex items-center justify-between">
                    <span>Invoices</span>
                    <span className="bg-white/10 text-white text-[10px] px-1.5 py-0.5 rounded">9+</span>
                  </div>
                  <div className="px-3 py-1.5 text-xs text-[#888888] hover:text-white transition-colors cursor-pointer">Clients</div>
                  <div className="px-3 py-1.5 text-xs text-[#888888] hover:text-white transition-colors cursor-pointer">Integrations</div>
                </div>
              </div>

              {/* Core Dashboard Visual Body */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* Stats metrics block */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#121212] border border-[#1F1F1F] rounded-lg p-4">
                    <span className="text-[10px] font-medium tracking-wider uppercase text-neutral-500 block mb-1">Total revenue</span>
                    <span className="text-xl md:text-2xl font-bold text-[#F5F5F5] tracking-tight">$42,950.00</span>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                      <span>+14.2%</span>
                      <span className="text-neutral-500">vs last month</span>
                    </div>
                  </div>

                  <div className="bg-[#121212] border border-[#1F1F1F] rounded-lg p-4">
                    <span className="text-[10px] font-medium tracking-wider uppercase text-neutral-500 block mb-1">Pending payments</span>
                    <span className="text-xl md:text-2xl font-bold text-[#F5F5F5] tracking-tight">$8,120.00</span>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#888888]">
                      <span className="text-neutral-400">4 invoices active</span>
                    </div>
                  </div>

                  <div className="bg-[#121212] border border-[#1F1F1F] rounded-lg p-4">
                    <span className="text-[10px] font-medium tracking-wider uppercase text-neutral-500 block mb-1">Average paid days</span>
                    <span className="text-xl md:text-2xl font-bold text-[#F5F5F5] tracking-tight">4.2 Days</span>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                      <span>Instant payout</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Invoice Table */}
                <div className="bg-[#121212] border border-[#1F1F1F] rounded-lg overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#1F1F1F] flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">Recent Invoices</span>
                    <button className="text-[11px] font-medium px-2.5 py-1.5 border border-[#222222] rounded bg-[#0D0D0D] hover:bg-[#121212] transition-colors">
                      View all
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#1F1F1F] bg-[#141414]/50">
                          <th className="px-5 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Invoice</th>
                          <th className="px-5 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Client</th>
                          <th className="px-5 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Amount</th>
                          <th className="px-5 py-2.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F1F1F] text-xs">
                        <tr>
                          <td className="px-5 py-3.5 font-medium text-white">INV-2026-004</td>
                          <td className="px-5 py-3.5 text-neutral-300">Design Labs LLC</td>
                          <td className="px-5 py-3.5 text-neutral-300 font-mono">$3,400.00</td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">Paid</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-5 py-3.5 font-medium text-white">INV-2026-003</td>
                          <td className="px-5 py-3.5 text-neutral-300">Stripe Integration Inc.</td>
                          <td className="px-5 py-3.5 text-neutral-300 font-mono">$12,850.00</td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">Paid</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-5 py-3.5 font-medium text-white">INV-2026-002</td>
                          <td className="px-5 py-3.5 text-neutral-300">Vercel Solutions</td>
                          <td className="px-5 py-3.5 text-neutral-300 font-mono">$5,200.00</td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400">Pending</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST / SOCIAL PROOF */}
      <section className="py-12 border-t border-b border-[#1A1A1A] bg-[#080808]/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs tracking-widest text-[#555555] uppercase mb-8">
            Trusted by modern freelancers & forward-thinking teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-65">
            <span className="font-semibold text-lg tracking-wider text-[#F5F5F5] font-serif">N O R T H S T A R</span>
            <span className="font-bold text-xl tracking-tight text-white italic">F O R M A</span>
            <span className="font-mono text-base tracking-widest text-neutral-300">ARC STUDIO</span>
            <span className="font-sans text-lg font-black tracking-tighter text-white">LUMA.</span>
            <span className="font-semibold text-lg tracking-widest text-neutral-400">FRAME</span>
            <span className="font-sans text-base tracking-widest text-white font-medium">O R B I T</span>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-xs font-bold tracking-widest text-[#888888] uppercase mb-4">Process Flow</h2>
            <p className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Three steps to seamless payouts.</p>
          </div>

          <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            
            <div className="step-item group relative w-full rounded-[2rem] border border-[#1A1A1A] bg-[#0D0D0D]/60 p-8 pb-32 shadow-[0_32px_100px_-30px_rgba(0,0,0,0.65)] backdrop-blur-3xl transition-all duration-300 hover:border-neutral-700">
              {/* dark glass gradient sheen */}
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/5 via-transparent to-black/20" />
              {/* top inner glow */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-3/5 rounded-t-[2rem] bg-gradient-to-b from-white/[0.07] to-transparent" />
              {/* inner edge highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)]" />

              <span className="relative block font-mono text-6xl font-extrabold text-[#444444] mb-6 group-hover:text-white transition-colors duration-500 z-10 drop-shadow-sm">
                01
              </span>

              <h3 className="relative text-2xl font-bold leading-tight tracking-tight text-white z-10">
                Draft Elegantly
              </h3>

              <p className="relative mt-4 max-w-sm text-sm leading-relaxed text-[#888888] z-10">
                Build invoices on a clean interface designed for raw speed. Add line items, calculate taxes, and save instantly.
              </p>

              {/* 3D icon flowing out from bottom-right */}
              <img
                src="/assets/object-1.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -right-24 h-72 w-72 rotate-[-12deg] select-none opacity-60 drop-shadow-[0_30px_45px_rgba(0,0,0,0.8)] group-hover:opacity-100 group-hover:brightness-125 group-hover:rotate-[-5deg] group-hover:-translate-y-2 transition-all duration-500 z-20"
              />
            </div>

            <div className="step-item group relative w-full rounded-[2rem] border border-[#1A1A1A] bg-[#0D0D0D]/60 p-8 pb-32 shadow-[0_32px_100px_-30px_rgba(0,0,0,0.65)] backdrop-blur-3xl transition-all duration-300 hover:border-neutral-700">
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/5 via-transparent to-black/20" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-3/5 rounded-t-[2rem] bg-gradient-to-b from-white/[0.07] to-transparent" />
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)]" />

              <span className="relative block font-mono text-6xl font-extrabold text-[#444444] mb-6 group-hover:text-white transition-colors duration-500 z-10 drop-shadow-sm">
                02
              </span>

              <h3 className="relative text-2xl font-bold leading-tight tracking-tight text-white z-10">
                Securely Transmit
              </h3>

              <p className="relative mt-4 max-w-sm text-sm leading-relaxed text-[#888888] z-10">
                Deliver interactive links directly to client mailboxes with optimized payment channels embedded inside.
              </p>

              <img
                src="/assets/object-2.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -right-24 h-72 w-72 rotate-[-12deg] select-none opacity-60 drop-shadow-[0_30px_45px_rgba(0,0,0,0.8)] group-hover:opacity-100 group-hover:brightness-125 group-hover:rotate-[-5deg] group-hover:-translate-y-2 transition-all duration-500 z-20"
              />
            </div>

            <div className="step-item group relative w-full rounded-[2rem] border border-[#1A1A1A] bg-[#0D0D0D]/60 p-8 pb-32 shadow-[0_32px_100px_-30px_rgba(0,0,0,0.65)] backdrop-blur-3xl transition-all duration-300 hover:border-neutral-700">
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/5 via-transparent to-black/20" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-3/5 rounded-t-[2rem] bg-gradient-to-b from-white/[0.07] to-transparent" />
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)]" />

              <span className="relative block font-mono text-6xl font-extrabold text-[#444444] mb-6 group-hover:text-white transition-colors duration-500 z-10 drop-shadow-sm">
                03
              </span>

              <h3 className="relative text-2xl font-bold leading-tight tracking-tight text-white z-10">
                Get Paid Safely
              </h3>

              <p className="relative mt-4 max-w-sm text-sm leading-relaxed text-[#888888] z-10">
                Receive alerts when invoices are viewed, tracks status changes, and cash out funds using optimized integrations.
              </p>

              <img
                src="/assets/object-3.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -right-24 h-72 w-72 rotate-[-12deg] select-none opacity-50 brightness-75 contrast-125 drop-shadow-[0_30px_45px_rgba(0,0,0,0.8)] group-hover:opacity-90 group-hover:brightness-100 group-hover:rotate-[-5deg] group-hover:-translate-y-2 transition-all duration-500 z-20"
              />
            </div>

          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE DEMO (THE CORE EXPERIENCE VISUALIZER) */}
      <section id="demo" className="py-24 md:py-32 bg-[#080808]/70 border-t border-b border-[#111111] px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#222222] bg-[#0D0D0D] mb-4">
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">Live Sandbox</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Simple Input &rarr; Professional Output</h2>
            <p className="text-sm md:text-base text-[#888888]">
              Experience the Envoiz editor. Edit values in the sidebar panel on the left and see the changes render automatically on the invoice mockup layout.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Live Controller Panel */}
            <div className="lg:col-span-5 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Invoice Controls</span>
                <span className="text-[11px] bg-white/10 text-white font-semibold px-2 py-0.5 rounded">Vercel Engine</span>
              </div>

              {/* Client and Invoice Metadata fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Invoice Number</label>
                  <input 
                    type="text" 
                    value={invoice.invoiceNumber}
                    onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#222222] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Currency</label>
                  <select 
                    value={invoice.currency}
                    onChange={(e) => setInvoice(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#222222] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="BDT">BDT (৳)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Client Name</label>
                  <input 
                    type="text" 
                    value={invoice.clientName}
                    onChange={(e) => setInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#222222] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Client Email</label>
                  <input 
                    type="text" 
                    value={invoice.clientEmail}
                    onChange={(e) => setInvoice(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full bg-[#141414] border border-[#222222] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              {/* Dynamic Invoice Rows Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">Line Items</label>
                  <button 
                    onClick={addInvoiceItem}
                    className="text-[10px] flex items-center gap-1 font-semibold tracking-wider text-white hover:text-neutral-300 transition-colors"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {invoice.items.map((item) => (
                    <div key={item.id} className="flex gap-2 items-center bg-[#121212] p-2.5 rounded border border-[#222222]">
                      <div className="flex-1 space-y-1">
                        <input 
                          type="text" 
                          value={item.description}
                          placeholder="Item description"
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full bg-transparent border-0 p-0 text-xs text-white focus:ring-0 focus:outline-none placeholder-neutral-600"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            value={item.quantity || ''}
                            placeholder="Qty"
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            className="w-16 bg-[#161616] border border-[#242424] rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none"
                          />
                          <input 
                            type="number" 
                            value={item.rate || ''}
                            placeholder="Rate"
                            onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                            className="w-24 bg-[#161616] border border-[#242424] rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteInvoiceItem(item.id)}
                        disabled={invoice.items.length <= 1}
                        className="p-1.5 rounded text-[#555555] hover:text-red-400 disabled:opacity-30 disabled:hover:text-[#555555] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Calculation Rates */}
              <div className="grid grid-cols-2 gap-4 border-t border-[#1A1A1A] pt-4">
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">
                    <span>Tax Rate</span>
                    <span className="font-mono text-white">{invoice.taxRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="25" 
                    value={invoice.taxRate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                    className="w-full accent-white"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">
                    <span>Discount</span>
                    <span className="font-mono text-white">{invoice.discountRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    value={invoice.discountRate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, discountRate: Number(e.target.value) }))}
                    className="w-full accent-white"
                  />
                </div>
              </div>

            </div>

            {/* High Fidelity Dynamic Invoice Render */}
            <div className="lg:col-span-7 bg-[#0B0B0B] text-white p-6 sm:p-12 rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] border border-[#1A1A1A] overflow-hidden flex flex-col justify-between min-h-[550px] relative">
              <div className="absolute top-4 right-4 bg-white/5 text-white px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase border border-white/10">
                {invoice.status}
              </div>

              <div>
                <div className="flex justify-between items-start border-b border-[#1A1A1A] pb-8">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-white">ENVOIZ</h3>
                    <p className="text-xs text-neutral-500 mt-1">envoiz.io</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Invoice Number</span>
                    <p className="text-sm font-semibold mt-1 font-mono text-white">{invoice.invoiceNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 text-xs border-b border-[#1A1A1A]">
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Billed To</span>
                    <p className="font-bold text-neutral-200">{invoice.clientName || 'Add client name...'}</p>
                    <p className="text-neutral-500 mt-1 font-sans">{invoice.clientEmail || 'Add client email...'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Date Created</span>
                      <p className="font-medium text-neutral-200">{invoice.issueDate}</p>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Due Date</span>
                      <p className="font-medium text-neutral-200">{invoice.dueDate}</p>
                    </div>
                  </div>
                </div>

                <div className="py-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1A1A1A]">
                        <th className="py-2 text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Item Description</th>
                        <th className="py-2 text-[9px] font-bold text-neutral-500 uppercase tracking-wider text-right">Qty</th>
                        <th className="py-2 text-[9px] font-bold text-neutral-500 uppercase tracking-wider text-right">Rate</th>
                        <th className="py-2 text-[9px] font-bold text-neutral-500 uppercase tracking-wider text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A1A1A] text-xs">
                      {invoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 pr-4 font-medium text-neutral-300 max-w-[200px] truncate">{item.description}</td>
                          <td className="py-3 text-neutral-500 text-right font-mono">{item.quantity}</td>
                          <td className="py-3 text-neutral-500 text-right font-mono">{currencySymbol}{item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 text-white font-bold text-right font-mono">
                            {currencySymbol}{(item.quantity * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t border-[#1A1A1A] pt-6">
                <div className="flex justify-end">
                  <div className="w-full sm:w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-500">
                      <span>Subtotal</span>
                      <span className="font-mono">{currencySymbol}{getSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {invoice.discountRate > 0 && (
                      <div className="flex justify-between text-emerald-500">
                        <span>Discount ({invoice.discountRate}%)</span>
                        <span className="font-mono">-{currencySymbol}{getDiscountAmount().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {invoice.taxRate > 0 && (
                      <div className="flex justify-between text-neutral-500">
                        <span>Tax ({invoice.taxRate}%)</span>
                        <span className="font-mono">+{currencySymbol}{getTaxAmount().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="h-[1px] bg-[#1A1A1A] my-2" />

                    <div className="flex justify-between text-base font-bold text-white">
                      <span>Grand Total</span>
                      <span className="font-mono">{currencySymbol}{getTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-neutral-500">
                  <p>Invoicing processed on secure cryptographic protocol rails.</p>
                  <button 
                    onClick={() => {
                      if (!user) {
                        localStorage.setItem("envoiz_pending_invoice", JSON.stringify(invoice));
                        navigate({ to: "/signup" });
                      } else {
                        // User is logged in; normally we'd trigger a download here if implemented fully
                        // but since they might just want to be redirected to the app:
                        navigate({ to: "/dashboard/invoices" });
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#222222] hover:bg-[#121212] text-white transition-all"
                  >
                    <Download size={12} /> Save PDF Copy
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. FEATURE SHOWCASE */}
      <section id="features" ref={featuresRef} className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-xs font-bold tracking-widest text-[#888888] uppercase mb-4">Core Utility Suite</h2>
            <p className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Engineered for absolute accuracy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <FeaturedCard className="feature-card" glowCorner="top-left">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                <Globe size={18} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Multi-Currency Capability</h3>
              <p className="text-sm text-[#888888] leading-relaxed">
                Generate globally optimized invoices with dynamic translations across USD, EUR, GBP, INR, and more.
              </p>
            </FeaturedCard>

            <FeaturedCard className="feature-card" glowCorner="top-right">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                <Calculator size={18} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Automated Arithmetic</h3>
              <p className="text-sm text-[#888888] leading-relaxed">
                Never second guess mathematical totals. Taxes, item discounts, and exchange values compute with zero lag.
              </p>
            </FeaturedCard>

            <FeaturedCard className="feature-card" glowCorner="bottom-left">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                <Eye size={18} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Live-State Tracking</h3>
              <p className="text-sm text-[#888888] leading-relaxed">
                Observe exact states from Draft, Sent, Pending and settled in real time, all within clean data lists.
              </p>
            </FeaturedCard>

            <FeaturedCard className="feature-card" glowCorner="bottom-right">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                <FileText size={18} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Lossless PDF Vector Exports</h3>
              <p className="text-sm text-[#888888] leading-relaxed">
                Render and save beautiful print-ready documents that fit standard layout ratios flawlessly.
              </p>
            </FeaturedCard>

            <FeaturedCard className="feature-card" glowCorner="top-left">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                <Layers size={18} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Team & Brand Profiles</h3>
              <p className="text-sm text-[#888888] leading-relaxed">
                Set company-specific styling, custom letterheads, signatures, and localized currency preferences natively.
              </p>
            </FeaturedCard>

            <FeaturedCard className="feature-card" glowCorner="top-right">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                <Sparkles size={18} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Instant Payout Pipeline</h3>
              <p className="text-sm text-[#888888] leading-relaxed">
                Add Stripe or routing structures directly into your hosted invoice views for ultra-high transaction efficiency.
              </p>
            </FeaturedCard>

          </div>

        </div>
      </section>

      {/* 7. METRIC STATS */}
      <section ref={statsSectionRef} className="py-20 md:py-28 bg-[#070707] border-t border-[#111111] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="stat-counter text-center">
              <span className="block text-4xl md:text-5xl font-extrabold text-white tracking-tight">10K+</span>
              <span className="block text-xs uppercase tracking-wider text-[#888888] mt-2">Invoices Generated</span>
            </div>

            <div className="stat-counter text-center">
              <span className="block text-4xl md:text-5xl font-extrabold text-white tracking-tight">5,000+</span>
              <span className="block text-xs uppercase tracking-wider text-[#888888] mt-2">Freelance Partners</span>
            </div>

            <div className="stat-counter text-center">
              <span className="block text-4xl md:text-5xl font-extrabold text-white tracking-tight">40+</span>
              <span className="block text-xs uppercase tracking-wider text-[#888888] mt-2">Countries Served</span>
            </div>

            <div className="stat-counter text-center">
              <span className="block text-4xl md:text-5xl font-extrabold text-white tracking-tight">99.9%</span>
              <span className="block text-xs uppercase tracking-wider text-[#888888] mt-2">Uptime Tracked</span>
            </div>

          </div>
        </div>
      </section>

      {/* 8. PRICING PLANS */}
      <section id="pricing" className="py-24 md:py-32 border-t border-[#111111] px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-xs font-bold tracking-widest text-[#888888] uppercase mb-4">Pricing Models</h2>
            <p className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">A tier for every business scale.</p>
            <p className="text-sm text-[#888888]">Upgrade, downgrade, or suspend operations seamlessly inside. No lock-ins.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Free Tier */}
            <FeaturedCard className="flex flex-col justify-between" glowCorner="bottom-left">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Free</span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-[#888888] text-xs">/ month</span>
                </div>
                <p className="text-xs text-[#888888] leading-relaxed mb-6">For freelancers getting started with professional invoicing.</p>
                <div className="h-[1px] bg-[#1F1F1F] my-6" />
                <ul className="space-y-3.5 text-xs text-neutral-400">
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-neutral-500" />
                    <span>Up to 10 invoices per month</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-neutral-500" />
                    <span>1 beautiful invoice template</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-neutral-500" />
                    <span>PDF & PNG export</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-neutral-500" />
                    <span>Basic invoice management</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-neutral-500" />
                    <span>Connect 1 payment method</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-neutral-500" />
                    <span>Revenue & invoice analytics</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-neutral-500" />
                    <span>Envoiz watermark on invoices</span>
                  </li>
                </ul>
              </div>
              <button className="w-full py-3 mt-8 text-xs font-semibold bg-[#141414] text-white hover:bg-[#1E1E1E] rounded transition-all border border-[#222222]">
                Start for free
              </button>
            </FeaturedCard>

            {/* Pro Tier */}
            <FeaturedCard className="flex flex-col justify-between" glowCorner="top-right">
              <span className="absolute top-0 right-0 bg-white text-black px-3 py-1.5 rounded-bl-2xl text-[9px] font-bold uppercase tracking-widest z-10 shadow-sm">
                Recommended
              </span>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">Pro</span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">$7</span>
                  <span className="text-[#888888] text-xs">/ month</span>
                </div>
                <p className="text-xs text-[#888888] leading-relaxed mb-6">For professionals who need advanced invoicing and branding.</p>
                <div className="h-[1px] bg-[#1F1F1F] my-6" />
                <ul className="space-y-3.5 text-xs text-neutral-200">
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-white" />
                    <span>Unlimited invoices</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-white" />
                    <span>All premium templates</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-white" />
                    <span>Custom logo & branding</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-white" />
                    <span>Multiple payment methods</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-white" />
                    <span>Recurring invoices</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-white" />
                    <span>Automated overdue reminders</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-white" />
                    <span>No Envoiz watermark</span>
                  </li>
                </ul>
              </div>
              <button className="w-full py-3 mt-8 text-xs font-bold bg-white text-black hover:bg-neutral-200 rounded transition-all">
                Start for $7
              </button>
            </FeaturedCard>

          </div>

        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="py-24 md:py-32 bg-[#080808]/70 border-t border-b border-[#111111] px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-xs font-bold tracking-widest text-[#888888] uppercase mb-4">User Endorsements</h2>
            <p className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Loved by creators globally.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1A1A1A]">
              <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                "Envoiz has completely streamlined my freelance workflow. I can compile and generate a professional invoice under thirty seconds. It has cut my payment tracking times in half."
              </p>
              <div>
                <span className="block text-xs font-bold text-white">David Miller</span>
                <span className="block text-[10px] text-neutral-500 mt-0.5">Freelance Product Designer</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1A1A1A]">
              <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                "The dynamic calculations and visual rendering speed are incredible. Clients love the clean layout output, and our finance controllers have zero friction balancing details."
              </p>
              <div>
                <span className="block text-xs font-bold text-white">Elena Rostova</span>
                <span className="block text-[10px] text-neutral-500 mt-0.5">Studio Director at Arc Design</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[#1A1A1A]">
              <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                "Outstanding interface design. No superfluous decorations or useless configurations. Simple input resulting in exceptionally clean corporate output."
              </p>
              <div>
                <span className="block text-xs font-bold text-white">Arif Chowdhury</span>
                <span className="block text-[10px] text-neutral-500 mt-0.5">Senior Backend Engineer</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 10. FAQ ACCORDION SECTION */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-[#888888] uppercase mb-4">FAQ</h2>
            <p className="text-3xl font-extrabold tracking-tight text-white">Common Questions</p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => {
              const isOpen = openFAQ === index;
              return (
                <div 
                  key={index} 
                  className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg overflow-hidden transition-colors"
                >
                  <button 
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-semibold text-white focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      size={16} 
                      className={`text-[#888888] transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`} 
                    />
                  </button>
                  
                  <div 
                    className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 text-xs text-neutral-400 leading-relaxed">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 11. FINAL CONVERSION CALL-TO-ACTION */}
      <section className="min-h-[100vh] flex flex-col justify-center py-24 md:py-32 text-white text-center relative overflow-hidden px-6">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/assets/nature-section-bg.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/60 z-[1]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Your next invoice <br />should take seconds.
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 max-w-lg mb-10 leading-relaxed">
            Stop wasting hours adjusting table spacing on outdated processors. Start presenting templates that align directly with the precision of your work.
          </p>

          <Link 
            to="/signup" 
            className="w-full sm:w-auto px-8 py-4 text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 rounded-md transition-all duration-200"
          >
            Create Your First Invoice
          </Link>

        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="border-t border-[#111111] bg-[#050505] py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8">
          
          {/* Logo Brand Segment */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <BrandLogo className="h-10 w-auto transition-transform duration-300 group-hover:scale-105 invert" />
            </Link>
            <p className="text-xs text-[#888888] max-w-sm leading-relaxed">
              Highly polished transactional SaaS invoicing utility systems. Streamlined structures for freelancers, agencies, and small enterprise environments.
            </p>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#888888] mb-4">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="text-[#555555] hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-[#555555] hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-[#555555] hover:text-white transition-colors">Templates</a></li>
              <li><a href="#" className="text-[#555555] hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#888888] mb-4">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="text-[#555555] hover:text-white transition-colors">About</Link></li>
              <li><Link to="/security" className="text-[#555555] hover:text-white transition-colors">Security</Link></li>
              <li><Link to="/privacy-policy" className="text-[#555555] hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-[#555555] hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#888888] mb-4">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/resources/docs" className="text-[#555555] hover:text-white transition-colors">Docs</Link></li>
              <li><Link to="/resources/blog" className="text-[#555555] hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/resources/support" className="text-[#555555] hover:text-white transition-colors">Support</Link></li>
              <li><Link to="/resources/status" className="text-[#555555] hover:text-white transition-colors">Status</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright alignment */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#111111] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[#555555]">
          <p>© {new Date().getFullYear()} Envoiz SaaS, Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>

    </div>
  );
}