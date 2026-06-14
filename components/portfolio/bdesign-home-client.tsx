"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  MapPin,
  Phone,
  Clock,
  Heart,
  Share2,
  Send,
  Star,
  Check,
  ArrowRight,
  Menu,
  X,
  User,
  Sun,
  Moon,
  Instagram,
  Dribbble,
  Printer,
  BookOpen,
  Trophy,
  PenTool,
  Sparkles,
  Layers,
  Palette,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BDesignHomeClientProps {
  isLoggedIn: boolean;
  initialProjects?: any[];
  initialTestimonials?: any[];
  initialServices?: any[];
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  service: string;
  date: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const initialReviews: Review[] = [
  {
    id: "1",
    name: "Faisal K.",
    rating: 5,
    comment:
      "BDESIGN created a phenomenal branding package for my clothing store in Chemmad. Their attention to detail and sense of color is outstanding. The team understood our vision perfectly and delivered beyond expectations.",
    service: "Branding & Logo Design",
    date: "2 weeks ago",
  },
  {
    id: "2",
    name: "Safeer A. — Thalappara",
    rating: 5,
    comment:
      "Very fast delivery and high quality vector work. The product packaging design for our local brand got so many compliments. The packaging alone increased our shelf presence by 200%.",
    service: "Product Packaging",
    date: "1 month ago",
  },
  {
    id: "3",
    name: "Hiba Raheem",
    rating: 5,
    comment:
      "Brilliant designs! BDESIGN crafted a beautiful minimal logo that represents our brand values. Extremely professional and collaborative throughout. Will definitely work with them again.",
    service: "Brand Identity",
    date: "3 months ago",
  },
  {
    id: "4",
    name: "Rashid P. — Kondotty",
    rating: 5,
    comment:
      "The social media graphics BDESIGN created for our restaurant chain are absolutely stunning. Our engagement went up by 150% within the first month.",
    service: "Social Media Graphics",
    date: "1 week ago",
  },
];

const SERVICES = [
  {
    code: "01",
    icon: PenTool,
    title: "Brand Identity",
    desc: "Custom logos, color strategy, typography, and brand books that establish a commanding market presence.",
    tags: ["Logo Design", "Brand Guidelines", "Typography"],
    accent: "#2563EB",
  },
  {
    code: "02",
    icon: Layers,
    title: "Product Packaging",
    desc: "Premium box layouts, label design, 3D mockups, and print-ready specs that command shelf attention.",
    tags: ["3D Mockups", "Retail Packaging", "Print Files"],
    accent: "#FF5E3A",
  },
  {
    code: "03",
    icon: Printer,
    title: "Print & Offset",
    desc: "Large-format banners, brochures, flyers, hoardings, and all commercial print with professional prepress.",
    tags: ["Banners", "Brochures", "Hoardings"],
    accent: "#10B981",
  },
  {
    code: "04",
    icon: BookOpen,
    title: "Binding & Books",
    desc: "Perfect binding, spiral binding, hardcover case work, catalogs, annual reports, and custom diaries.",
    tags: ["Perfect Bind", "Hardcover", "Catalogs"],
    accent: "#8B5CF6",
  },
  {
    code: "05",
    icon: Trophy,
    title: "Trophies & Mementos",
    desc: "Custom acrylic trophies, metal awards, crystal mementos, and engraved recognition pieces for events.",
    tags: ["Acrylic", "Metal Awards", "Engraving"],
    accent: "#F59E0B",
  },
  {
    code: "06",
    icon: Sparkles,
    title: "Social Media & Digital",
    desc: "Cohesive post layouts, story templates, reels covers, and digital ad creatives for every platform.",
    tags: ["Instagram", "Facebook", "Digital Ads"],
    accent: "#3B82F6",
  },
];

const PORTFOLIO = [
  {
    id: "branding-1",
    title: "AURA Luxury Corporate Identity",
    category: "Branding",
    image: "/branding_mockup.png",
    description:
      "Premium minimalist brand identity system for a luxury studio. Dark emerald textures, gold foil letterpress typography, and balanced minimalist grid layouts.",
    client: "AURA Design Studio",
    year: "2026",
    tags: ["Luxury", "Minimalist", "Gold Foil"],
  },
  {
    id: "packaging-1",
    title: "Organic Revitalizing Serum",
    category: "Packaging",
    image: "/packaging_mockup.png",
    description:
      "High-end packaging for a botanical skincare line. Amber glass jars, premium cream textured paper boxes, elegant serif typography.",
    client: "AURA Cosmetics",
    year: "2026",
    tags: ["Skincare", "Sustainable", "Premium"],
  },
  {
    id: "logo-1",
    title: "Typographic Explorations",
    category: "Logos",
    image: "/logo_mockup.png",
    description:
      "Custom lettermark explorations and logo concept drafts, demonstrating refined geometry and custom type design.",
    client: "Various Brands",
    year: "2025",
    tags: ["Typography", "Minimal", "Modern"],
  },
];

const TABS = [
  "All",
  "Branding",
  "Packaging",
  "Print",
  "Binding",
  "Trophies",
  "Logos",
] as const;
type Tab = (typeof TABS)[number];

const TICKER_ITEMS = [
  "Brand Identity",
  "Logo Design",
  "Product Packaging",
  "Offset Printing",
  "Large Format",
  "Perfect Binding",
  "Hardcover Books",
  "Spiral Binding",
  "Acrylic Trophies",
  "Metal Awards",
  "Crystal Mementos",
  "Laser Engraving",
  "Social Media Graphics",
  "Billboard Design",
  "Brochures & Flyers",
  "Business Cards",
  "Letterheads",
  "Annual Reports",
];

const CATEGORY_COLOR: Record<string, string> = {
  Branding: "#2563EB",
  Packaging: "#FF5E3A",
  Print: "#10B981",
  Binding: "#8B5CF6",
  Trophies: "#F59E0B",
  Logos: "#3B82F6",
};

const getIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case "palette":
      return Palette;
    case "pen":
    case "pentool":
      return PenTool;
    case "printer":
      return Printer;
    case "book":
    case "bookopen":
      return BookOpen;
    case "trophy":
    case "award":
      return Trophy;
    case "layers":
      return Layers;
    default:
      return Sparkles;
  }
};

export function BDesignHomeClient({
  isLoggedIn,
  initialProjects = [],
  initialTestimonials = [],
  initialServices = [],
}: BDesignHomeClientProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSuggestion, setEditSuggestion] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [startPoint, setStartPoint] = useState("");

  const portfolioList =
    initialProjects.length > 0 ? initialProjects : PORTFOLIO;

  // Resolve dynamic database services
  const servicesList =
    initialServices.length > 0
      ? initialServices.map((s, idx) => ({
          code: `0${idx + 1}`.slice(-2),
          icon: getIcon(s.icon),
          title: s.title,
          desc: s.description,
          tags: s.tags || ["Design Studio", "Premium"],
          accent:
            idx % 3 === 0
              ? "#2563EB"
              : idx % 3 === 1
              ? "#FF5E3A"
              : "#10B981",
        }))
      : SERVICES;

  const [isOpenNow, setIsOpenNow] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("bdesign_saved") === "true") setIsSaved(true);
    const local = localStorage.getItem("bdesign_reviews");
    if (local) {
      setReviews(JSON.parse(local));
    } else {
      setReviews(
        initialTestimonials.length > 0 ? initialTestimonials : initialReviews
      );
    }

    // Check business hours: Mon-Sat 9:00 AM to 8:30 PM (IST / Asia/Kolkata)
    const checkIsOpen = () => {
      try {
        const now = new Date();
        const kolkataTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const kolkataDate = new Date(kolkataTimeStr);
        
        const day = kolkataDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const hours = kolkataDate.getHours();
        const minutes = kolkataDate.getMinutes();
        
        if (day === 0) {
          // Closed on Sundays
          return false;
        }
        
        const currentMinutes = hours * 60 + minutes;
        const openMinutes = 9 * 60; // 9:00 AM
        const closeMinutes = 20 * 60 + 30; // 8:30 PM
        
        return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
      } catch (err) {
        // Fallback to local time if timezone string fails
        const now = new Date();
        const day = now.getDay();
        if (day === 0) return false;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        return currentMinutes >= 9 * 60 && currentMinutes < (20 * 60 + 30);
      }
    };
    
    setIsOpenNow(checkIsOpen());
    
    const interval = setInterval(() => {
      setIsOpenNow(checkIsOpen());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [initialTestimonials]);

  if (!mounted) return null;

  const handleSaveToggle = () => {
    const s = !isSaved;
    setIsSaved(s);
    localStorage.setItem("bdesign_saved", String(s));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "BDESIGN – Creative Studio, Chemmad",
          url: window.location.href,
        });
      } catch {
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMessage.trim()) return;
    const text = `Hi BDESIGN,\n\n*Name:* ${contactName}\n*Contact:* ${contactEmail}\n*Project:* ${contactMessage}`;
    window.open(
      `https://wa.me/919961133633?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    setContactSuccess(true);
    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setContactSuccess(false);
    }, 4000);
  };

  const handleSuggestEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSuggestion.trim()) return;
    setEditSuccess(true);
    setTimeout(() => {
      setEditSuggestion("");
      setShowEditModal(false);
      setEditSuccess(false);
    }, 3000);
  };

  const handleGetRoute = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        startPoint
      )}&destination=${encodeURIComponent(
        "BDESIGN Book Plus Building Hidaya Nagar Chemmad Kerala 676306"
      )}`,
      "_blank"
    );
  };

  const filtered =
    activeTab === "All"
      ? portfolioList
      : portfolioList.filter((p) => p.category === activeTab);

  return (
    <>
      {/* ── Modern Design Studio Styles ────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        :root {
          --bg-primary: #FAF9F5;
          --bg-secondary: #FFFFFF;
          --text-primary: #0A0A0C;
          --text-secondary: #5A5A62;
          --text-muted: #8E8E98;
          --border-primary: #E2E1DD;
          --border-hover: #0A0A0C;
          
          --brand-blue: #2563EB;
          --brand-blue-muted: rgba(37, 99, 235, 0.05);
          --brand-coral: #FF5E3A;
          --brand-coral-muted: rgba(255, 94, 58, 0.05);
          
          --font-display: 'Space Grotesk', sans-serif;
          --font-sans: 'Plus Jakarta Sans', sans-serif;
          --font-mono: 'DM Mono', monospace;
          
          --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.02);
          --shadow-md: 0 10px 30px rgba(0, 0, 0, 0.04);
          --shadow-lg: 0 20px 50px rgba(0, 0, 0, 0.08);
          
          --radius-card: 20px;
          --radius-pill: 100px;
        }

        .dark {
          --bg-primary: #0B0B0C;
          --bg-secondary: #121214;
          --text-primary: #F3F3F5;
          --text-secondary: #9E9EA6;
          --text-muted: #6B6B72;
          --border-primary: #222226;
          --border-hover: #F3F3F5;
          
          --brand-blue: #3B82F6;
          --brand-blue-muted: rgba(59, 130, 246, 0.08);
          
          --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
          --shadow-md: 0 10px 30px rgba(0, 0, 0, 0.3);
          --shadow-lg: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        * {
          box-sizing: border-box;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        body {
          font-family: var(--font-sans);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          margin: 0;
          overflow-x: hidden;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--text-primary);
        }

        .mono {
          font-family: var(--font-mono);
        }

        .studio-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.25rem;
        }

        @media (min-width: 640px) {
          .studio-container { padding: 0 2rem; }
        }

        /* Bento Grid */
        .bento-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 768px) {
          .bento-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .bento-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-card);
          padding: 1.75rem;
          position: relative;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.3s ease, 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (hover: hover) {
          .bento-card:hover {
            transform: translateY(-4px);
            border-color: var(--border-hover);
            box-shadow: var(--shadow-lg);
          }
        }

        /* Service Cards */
        .service-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        /* Ticker */
        .ticker-wrap {
          overflow: hidden;
          border-top: 1px solid var(--border-primary);
          border-bottom: 1px solid var(--border-primary);
          background-color: var(--bg-secondary);
        }

        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-animation 30s linear infinite;
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }

        @keyframes ticker-animation {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .ticker-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          white-space: nowrap;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .ticker-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--brand-blue);
        }

        /* Tab scroll bar */
        .tab-scroll {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          margin-bottom: 0.5rem;
          scrollbar-width: none;
        }
        
        .tab-scroll::-webkit-scrollbar {
          display: none;
        }

        .tab-pill {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-pill);
          border: 1px solid var(--border-primary);
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .tab-pill.active {
          background-color: var(--text-primary);
          color: var(--bg-primary);
          border-color: var(--text-primary);
        }

        @media (hover: hover) {
          .tab-pill:not(.active):hover {
            border-color: var(--text-primary);
            color: var(--text-primary);
          }
        }

        /* Print crops */
        .crop-marks {
          position: absolute;
          inset: 0.75rem;
          pointer-events: none;
          opacity: 0.35;
          transition: opacity 0.3s ease;
        }

        .bento-card:hover .crop-marks {
          opacity: 0.7;
        }

        .crop-mark {
          position: absolute;
          width: 8px;
          height: 8px;
        }

        .crop-mark.tl { top: 0; left: 0; border-top: 1px solid var(--text-muted); border-left: 1px solid var(--text-muted); }
        .crop-mark.tr { top: 0; right: 0; border-top: 1px solid var(--text-muted); border-right: 1px solid var(--text-muted); }
        .crop-mark.bl { bottom: 0; left: 0; border-bottom: 1px solid var(--text-muted); border-left: 1px solid var(--text-muted); }
        .crop-mark.br { bottom: 0; right: 0; border-bottom: 1px solid var(--text-muted); border-right: 1px solid var(--text-muted); }

        /* Floating Label Input */
        .floating-group {
          position: relative;
          margin-bottom: 1rem;
        }

        .floating-input, .floating-textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .floating-input:focus, .floating-textarea:focus {
          border-color: var(--brand-blue);
        }

        .floating-label {
          position: absolute;
          left: 1rem;
          top: 1rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          pointer-events: none;
          transition: 0.2s ease all;
        }

        .floating-input:focus ~ .floating-label,
        .floating-input:not(:placeholder-shown) ~ .floating-label,
        .floating-textarea:focus ~ .floating-label,
        .floating-textarea:not(:placeholder-shown) ~ .floating-label {
          top: -0.5rem;
          left: 0.75rem;
          font-size: 0.75rem;
          padding: 0 0.25rem;
          background-color: var(--bg-secondary);
          color: var(--brand-blue);
          font-weight: 500;
        }

        .avail-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #22c55e;
          display: inline-block;
          animation: pulse 2.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-up {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative">
        {/* ── Header (Mobile-first sticky & decluttered) ────────────────── */}
        <header className="sticky top-0 z-50 bg-[var(--bg-secondary)]/90 backdrop-blur-md border-b border-[var(--border-primary)]">
          <div className="studio-container h-16 flex items-center justify-between">
            <Link
              href="/"
              id="logo-link"
              className="flex items-center gap-2.5 no-underline color-inherit"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src="/bdesign_logo.png"
                  alt="BDESIGN Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-[var(--font-display)] font-extrabold text-base tracking-tight block leading-none">
                  BDESIGN
                </span>
                <span className="mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-secondary)] block mt-0.5">
                  Creative Studio
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                ["#work", "Portfolio"],
                ["#services", "Services"],
                ["#reviews", "Reviews"],
                ["#contact", "Contact"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Action Bar */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                id="btn-theme-toggle"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-full border border-[var(--border-primary)] bg-transparent cursor-pointer flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-all"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              {/* Call Now Button - Hidden on small mobile */}
              <a
                id="btn-call-now"
                href="tel:09961133633"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue)]/90 rounded-xl text-xs font-bold no-underline tracking-wide transition-all shadow-sm"
              >
                <Phone size={12} />
                <span>Call Now</span>
              </a>

              {/* Dashboard/Login Link - Hidden on mobile */}
              {isLoggedIn ? (
                <Link
                  id="link-dashboard"
                  href="/dashboard"
                  className="hidden md:block px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 rounded-xl text-xs font-bold no-underline transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  id="link-login"
                  href="/auth/login"
                  className="hidden md:block px-4 py-2 border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--text-primary)] rounded-xl text-xs font-bold no-underline transition-all"
                >
                  Login
                </Link>
              )}

              {/* Mobile Drawer Toggle */}
              <button
                id="btn-mobile-menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center bg-transparent border-none cursor-pointer text-[var(--text-primary)]"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Overlay Navigation Menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 top-16 bg-[var(--bg-secondary)] z-40 overflow-y-auto border-t border-[var(--border-primary)] animate-fade-up">
              <div className="studio-container py-8 flex flex-col gap-6">
                {[
                  ["#work", "Portfolio"],
                  ["#services", "Services"],
                  ["#reviews", "Reviews"],
                  ["#contact", "Contact"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-2xl font-bold border-b border-[var(--border-primary)] no-underline text-[var(--text-primary)] font-[var(--font-display)] tracking-tight hover:pl-2 transition-all"
                  >
                    {label}
                  </a>
                ))}
                
                <div className="flex flex-col gap-4 mt-8">
                  <a
                    href="tel:09961133633"
                    className="w-full flex items-center justify-center gap-2.5 py-4 bg-[var(--brand-blue)] text-white rounded-xl text-sm font-bold no-underline transition-all shadow-sm"
                  >
                    <Phone size={14} /> Call +91 99611 33633
                  </a>
                  
                  {isLoggedIn ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl text-sm font-bold no-underline transition-all"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-4 border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl text-sm font-bold no-underline transition-all"
                    >
                      Login to Dashboard
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* ── Ticker / Infinite Marquee ──────────────────────────────────── */}
        <div id="services-ticker" className="ticker-wrap">
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="ticker-item">
                <span className="ticker-dot" /> {item}
              </span>
            ))}
          </div>
        </div>

        <main className="studio-container py-8 md:py-16 flex flex-col gap-16 md:gap-28">
          {/* ── Hero Section (Bento Box Grid) ────────────────────────────── */}
          <section id="hero" className="animate-fade-up">
            <div className="bento-grid">
              {/* Box 1: Core Branding Statement */}
              <div className="bento-card md:col-span-2 flex flex-col justify-between min-h-[320px] md:min-h-[400px]">
                <div className="crop-marks">
                  <div className="crop-mark tl" />
                  <div className="crop-mark tr" />
                  <div className="crop-mark bl" />
                  <div className="crop-mark br" />
                </div>
                <div>
                  <span className="mono text-[10px] tracking-[0.2em] uppercase text-[var(--brand-blue)] font-bold">
                    // Creative & Print Studio
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mt-4 mb-6">
                    Design. Print.<br />
                    <span className="text-[var(--brand-blue)]">Deliver.</span>
                  </h1>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <a
                    href="#contact"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 rounded-xl text-sm font-bold no-underline transition-all"
                  >
                    Start a Project
                    <ArrowRight size={14} />
                  </a>
                  <a
                    href="#work"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--text-primary)] rounded-xl text-sm font-bold no-underline transition-all"
                  >
                    View Portfolio
                  </a>
                </div>
              </div>

              {/* Box 2: Availability Badging */}
              <div className="bento-card md:col-span-1 flex flex-col justify-between">
                <div className="crop-marks">
                  <div className="crop-mark tl" />
                  <div className="crop-mark tr" />
                  <div className="crop-mark bl" />
                  <div className="crop-mark br" />
                </div>
                <div className="flex justify-between items-start">
                  {isOpenNow ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 dark:bg-green-500/20 text-green-500 rounded-full">
                      <span className="avail-dot" />
                      <span className="mono text-[9px] tracking-wider uppercase font-semibold">
                        Open Now
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 dark:bg-red-500/20 text-red-500 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      <span className="mono text-[9px] tracking-wider uppercase font-semibold">
                        Closed
                      </span>
                    </div>
                  )}
                  <Clock size={16} className="text-[var(--text-muted)]" />
                </div>
                <div className="my-6">
                  <h3 className="text-xl font-bold tracking-tight mb-2">
                    Studio Consultancy
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Drop by our studio at Book Plus Complex, Chemmad. We operate from 9:00 AM to 8:30 PM.
                  </p>
                </div>
                <a
                  href="#contact"
                  className="w-full flex items-center justify-between p-3.5 bg-[var(--bg-primary)] hover:bg-[var(--border-primary)] rounded-xl border border-[var(--border-primary)] text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] no-underline transition-all"
                >
                  <span>Request Consultation</span>
                  <ChevronRight size={14} />
                </a>
              </div>

              {/* Box 3: Studio Coordinates */}
              <div className="bento-card md:col-span-1 flex flex-col justify-between min-h-[180px]">
                <div className="crop-marks">
                  <div className="crop-mark tl" />
                  <div className="crop-mark tr" />
                  <div className="crop-mark bl" />
                  <div className="crop-mark br" />
                </div>
                <div>
                  <MapPin size={20} className="text-[var(--brand-coral)] mb-4" />
                  <h3 className="text-lg font-bold tracking-tight mb-1">
                    Chemmad, Kerala
                  </h3>
                  <span className="mono text-[10px] uppercase text-[var(--text-muted)]">
                    BOOK PLUS Complex, Hidaya Nagar
                  </span>
                </div>
                <a
                  href="#business-info"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline mt-4"
                >
                  Show on map <ArrowRight size={12} />
                </a>
              </div>

              {/* Box 4: Studio Key Statistics */}
              <div className="bento-card md:col-span-1 flex flex-col justify-between">
                <div className="crop-marks">
                  <div className="crop-mark tl" />
                  <div className="crop-mark tr" />
                  <div className="crop-mark bl" />
                  <div className="crop-mark br" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: "500+", lbl: "Deliveries" },
                    { val: "7+", lbl: "Years" },
                    { val: "50+", lbl: "Brands" },
                    { val: "98%", lbl: "Match Rate" },
                  ].map((stat, idx) => (
                    <div key={idx}>
                      <span className="block text-2xl font-extrabold tracking-tight">
                        {stat.val}
                      </span>
                      <span className="mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                        {stat.lbl}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--border-primary)] pt-3 mt-4">
                  <span className="text-[10px] text-[var(--text-muted)] leading-normal block">
                    Proven track record in Malappuram regional business markets.
                  </span>
                </div>
              </div>

              {/* Box 5: Direct Interaction Shortcuts */}
              <div className="bento-card md:col-span-1 flex flex-col justify-between">
                <div className="crop-marks">
                  <div className="crop-mark tl" />
                  <div className="crop-mark tr" />
                  <div className="crop-mark bl" />
                  <div className="crop-mark br" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight mb-2">
                    Connect with BDESIGN
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Quickly bookmark our digital studio card or share our location details with others.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveToggle}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--bg-primary)] hover:bg-[var(--border-primary)] border border-[var(--border-primary)] rounded-xl cursor-pointer text-xs font-bold text-[var(--text-primary)] transition-all"
                  >
                    <Heart
                      size={12}
                      fill={isSaved ? "var(--brand-coral)" : "transparent"}
                      color={isSaved ? "var(--brand-coral)" : "currentColor"}
                    />
                    {isSaved ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--bg-primary)] hover:bg-[var(--border-primary)] border border-[var(--border-primary)] rounded-xl cursor-pointer text-xs font-bold text-[var(--text-primary)] transition-all"
                  >
                    <Share2 size={12} /> Share
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Services Section ─────────────────────────────────────────── */}
          <section id="services" className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="mono text-[10px] tracking-[0.2em] uppercase text-[var(--brand-blue)] font-bold block mb-2">
                  // Creative Services
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  What BDESIGN Offers
                </h2>
              </div>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline"
              >
                Request custom pricing <ArrowRight size={14} />
              </a>
            </div>

            <div className="bento-grid">
              {servicesList.map((svc, i) => {
                const IconComponent = svc.icon;
                return (
                  <div key={i} className="bento-card service-card group">
                    <div className="crop-marks">
                      <div className="crop-mark tl" />
                      <div className="crop-mark tr" />
                      <div className="crop-mark bl" />
                      <div className="crop-mark br" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div
                          style={{ backgroundColor: `${svc.accent}18` }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                        >
                          <IconComponent size={18} style={{ color: svc.accent }} />
                        </div>
                        <span className="mono text-[10px] tracking-wider text-[var(--text-muted)] font-bold">
                          // {svc.code}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold tracking-tight mb-2">
                        {svc.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                        {svc.desc}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-wrap mt-auto">
                      {svc.tags.map((tag: string, j: number) => (
                        <span
                          key={j}
                          className="mono text-[9px] tracking-wider uppercase bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-secondary)] px-2.5 py-1 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Portfolio Section ────────────────────────────────────────── */}
          <section id="work" className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div>
                <span className="mono text-[10px] tracking-[0.2em] uppercase text-[var(--brand-blue)] font-bold block mb-2">
                  // Portfolio Showcase
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  Selected Agency Work
                </h2>
              </div>

              {/* Horizontally scrollable categorizations on mobile */}
              <div className="tab-scroll">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-pill ${activeTab === tab ? "active" : ""}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((project, idx) => {
                  const accent =
                    CATEGORY_COLOR[project.category] || "var(--text-muted)";
                  return (
                    <div
                      key={project.id || idx}
                      className="bento-card p-0 flex flex-col h-full cursor-pointer group"
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="crop-marks">
                        <div className="crop-mark tl" />
                        <div className="crop-mark tr" />
                        <div className="crop-mark bl" />
                        <div className="crop-mark br" />
                      </div>
                      
                      {/* Image Preview Container */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
                        {project.image ? (
                          <div className="w-full h-full relative">
                            <img
                              src={project.image}
                              alt={project.title}
                              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <span className="text-white text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1.5">
                                View Case Study <ExternalLink size={12} />
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles size={24} style={{ color: accent }} />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 z-10">
                          <span
                            className="mono text-[8px] tracking-wider uppercase px-2.5 py-1 text-white font-bold rounded-md"
                            style={{ backgroundColor: accent }}
                          >
                            {project.category}
                          </span>
                        </span>
                      </div>

                      {/* Detail Container */}
                      <div className="p-5 flex flex-col flex-grow justify-between">
                        <div>
                          <span className="mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                            {project.client} · {project.year}
                          </span>
                          <h3 className="text-base font-bold tracking-tight mb-2 line-clamp-1 group-hover:text-[var(--brand-blue)] transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-4">
                            {project.description}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {project.tags?.map((t: string, i: number) => (
                            <span
                              key={i}
                              className="mono text-[8px] tracking-wider uppercase bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-primary)] px-2 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bento-card py-16 text-center border-dashed">
                <span className="mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  No projects in this category yet.
                </span>
              </div>
            )}
          </section>

          {/* ── Event Promotional Banner ─────────────────────────────────── */}
          <section className="bento-card bg-[var(--text-primary)] text-[var(--bg-primary)] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-blue)] opacity-10 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="mono text-[10px] tracking-[0.2em] uppercase text-[var(--brand-coral)] font-bold block mb-2">
                  // Commercial Operations
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-3">
                  Need trophies or publications?<br />
                  Get print-ready offset deliveries.
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-lg leading-relaxed">
                  We specialize in binding systems, custom acrylic trophies, event boards, and high-volume press printing. Contact our sales desk for custom pricing lists.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a
                  href="tel:09961133633"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue)]/90 rounded-xl text-xs font-bold tracking-wider uppercase no-underline transition-all"
                >
                  <Phone size={12} /> Call Sales Desk
                </a>
                <a
                  href="#contact"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 text-white hover:border-white rounded-xl text-xs font-bold tracking-wider uppercase no-underline transition-all"
                >
                  Send Brief Briefing
                </a>
              </div>
            </div>
          </section>

          {/* ── Client Testimonials / Reviews ────────────────────────────── */}
          <section id="reviews" className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="mono text-[10px] tracking-[0.2em] uppercase text-[var(--brand-blue)] font-bold block mb-2">
                  // Client Testimonials
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  What Brands Say
                </h2>
              </div>
              <div className="flex items-center gap-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-4 py-2 rounded-xl">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <span className="mono text-[10px] text-[var(--text-secondary)] font-bold">
                  5.0 / 5.0 Rating · {reviews.length} Client Reviews
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="bento-card flex flex-col justify-between">
                  <div className="crop-marks">
                    <div className="crop-mark tl" />
                    <div className="crop-mark tr" />
                    <div className="crop-mark bl" />
                    <div className="crop-mark br" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-full bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-primary)]">
                        <User size={14} className="text-[var(--text-secondary)]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold tracking-tight">
                          {rev.name}
                        </div>
                        <span className="mono text-[8px] uppercase tracking-wider text-[var(--text-muted)] block mt-0.5">
                          {rev.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic mb-4">
                      "{rev.comment}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--border-primary)] pt-3 mt-4">
                    <span className="mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">
                      Project: {rev.service}
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={9}
                          fill={i < rev.rating ? "#F59E0B" : "transparent"}
                          color={i < rev.rating ? "#F59E0B" : "var(--border-primary)"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Studio Finder (Location, Directions & Map) ───────────────── */}
          <section id="business-info" className="flex flex-col gap-8">
            <div>
              <span className="mono text-[10px] tracking-[0.2em] uppercase text-[var(--brand-blue)] font-bold block mb-2">
                // Studio Location
              </span>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                Visit BDESIGN
            </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Address Details */}
              <div className="bento-card flex flex-col justify-between">
                <div className="crop-marks">
                  <div className="crop-mark tl" />
                  <div className="crop-mark tr" />
                  <div className="crop-mark bl" />
                  <div className="crop-mark br" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight mb-4">
                    Studio Coordinates
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                      <MapPin size={16} className="text-[var(--brand-coral)] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold">
                          BOOK PLUS Complex
                        </span>
                        <span className="block text-xs text-[var(--text-secondary)] leading-relaxed">
                          Hidaya Nagar, Chemmad-Thalappara Rd, Chemmad, Kerala 676306
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Phone size={16} className="text-[var(--brand-blue)] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold">
                          Direct Line
                        </span>
                        <a
                          href="tel:09961133633"
                          className="block text-xs text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)]"
                        >
                          +91 99611 33633
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Clock size={16} className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          {isOpenNow ? (
                            <>
                              <span className="avail-dot" />
                              <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">
                                Open Now
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                              <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                                Closed
                              </span>
                            </>
                          )}
                        </div>
                        <span className="block text-xs text-[var(--text-secondary)]">
                          Mon – Sat: 9:00 AM – 8:30 PM
                        </span>
                        <span className="block text-[10px] text-[var(--text-muted)] mt-0.5">
                          Closed on Sundays
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 border-t border-[var(--border-primary)] pt-4 mt-6">
                  <button
                    onClick={handleSaveToggle}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[var(--bg-primary)] hover:bg-[var(--border-primary)] border border-[var(--border-primary)] rounded-xl cursor-pointer text-xs font-bold text-[var(--text-primary)] transition-all"
                  >
                    <Heart
                      size={12}
                      fill={isSaved ? "var(--brand-coral)" : "transparent"}
                      color={isSaved ? "var(--brand-coral)" : "currentColor"}
                    />
                    {isSaved ? "Saved Studio" : "Bookmark Studio"}
                  </button>
                </div>
              </div>

              {/* Start Location & Directions Calculator */}
              <div className="bento-card flex flex-col justify-between">
                <div className="crop-marks">
                  <div className="crop-mark tl" />
                  <div className="crop-mark tr" />
                  <div className="crop-mark bl" />
                  <div className="crop-mark br" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight mb-2">
                    Get Directions
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Enter your current town (e.g., Kondotty, Kottakkal, Calicut) to compute Google Maps routes.
                  </p>
                  <form onSubmit={handleGetRoute} className="flex flex-col gap-3">
                    <div className="floating-group">
                      <input
                        id="input-directions-start"
                        type="text"
                        placeholder=" "
                        value={startPoint}
                        onChange={(e) => setStartPoint(e.target.value)}
                        required
                        className="floating-input"
                      />
                      <label htmlFor="input-directions-start" className="floating-label">
                        Starting Location
                      </label>
                    </div>
                    <button
                      id="btn-directions-route"
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 rounded-xl text-xs font-bold uppercase tracking-wider border-none cursor-pointer transition-all"
                    >
                      Compute Route <ArrowRight size={14} />
                    </button>
                  </form>
                </div>
                <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] p-3 rounded-xl mt-4">
                  <span className="block text-[10px] text-[var(--text-secondary)] leading-normal">
                    Located in the Book Plus commercial complex building, directly visible on the Chemmad-Thalappara main road.
                  </span>
                </div>
              </div>

              {/* Map Iframe */}
              <div className="bento-card p-0 aspect-square lg:aspect-auto min-h-[250px] relative">
                <div className="crop-marks">
                  <div className="crop-mark tl" />
                  <div className="crop-mark tr" />
                  <div className="crop-mark bl" />
                  <div className="crop-mark br" />
                </div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.241315998188!2d75.90514217583617!3d11.049803100000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba64da9ef6b91cf%3A0xb0d6e9709eeeca94!2sBDESIGN!5e0!3m2!1sen!2sin!4v1718300000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  className="border-0 block w-full h-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </section>

          {/* ── Contact Section ──────────────────────────────────────────── */}
          <section id="contact" className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Form Introduction */}
            <div className="lg:col-span-2">
              <span className="mono text-[10px] tracking-[0.2em] uppercase text-[var(--brand-blue)] font-bold block mb-2">
                // Direct WhatsApp Inquiry
              </span>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4">
                Let's Build Something Worth Design.
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                Submit your brief detailing client scope and required design collaterals. Our designers will process and message you direct updates on WhatsApp.
              </p>
              
              <div className="flex flex-col gap-3">
                {[
                  { title: "Brand Guidelines", icon: PenTool },
                  { title: "Retail Product Boxes", icon: Layers },
                  { title: "Prepress Publications", icon: BookOpen },
                  { title: "Event Acrylic Awards", icon: Trophy }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-secondary)]">
                      <item.icon size={12} />
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Container */}
            <div className="lg:col-span-3 bento-card">
              <div className="crop-marks">
                <div className="crop-mark tl" />
                <div className="crop-mark tr" />
                <div className="crop-mark bl" />
                <div className="crop-mark br" />
              </div>
              
              {contactSuccess ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
                    <Check size={24} />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-1">
                    Brief Sent Successfully!
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    We will initiate WhatsApp contact within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="floating-group">
                      <input
                        id="input-contact-name"
                        type="text"
                        placeholder=" "
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                        className="floating-input"
                      />
                      <label htmlFor="input-contact-name" className="floating-label">
                        Your Name *
                      </label>
                    </div>

                    <div className="floating-group">
                      <input
                        id="input-contact-email"
                        type="text"
                        placeholder=" "
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="floating-input"
                      />
                      <label htmlFor="input-contact-email" className="floating-label">
                        Email / WhatsApp Phone
                      </label>
                    </div>
                  </div>

                  <div className="floating-group">
                    <textarea
                      id="input-contact-message"
                      placeholder=" "
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      rows={4}
                      required
                      className="floating-textarea"
                    />
                    <label htmlFor="input-contact-message" className="floating-label">
                      Describe your design or print project specifications...
                    </label>
                  </div>

                  <button
                    id="btn-contact-submit"
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue)]/90 rounded-xl text-xs font-bold uppercase tracking-wider border-none cursor-pointer shadow-sm transition-all"
                  >
                    <Send size={12} /> Send via WhatsApp
                  </button>
                  
                  <div className="text-center mt-2">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Or direct call:{" "}
                    </span>
                    <a
                      href="tel:09961133633"
                      className="text-xs font-bold text-[var(--text-primary)] no-underline"
                    >
                      +91 99611 33633
                    </a>
                  </div>
                </form>
              )}
            </div>
          </section>
        </main>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] py-12 md:py-16">
          <div className="studio-container flex flex-col gap-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Branding Block */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <Image
                    src="/bdesign_logo.png"
                    alt="BDESIGN Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <span className="font-[var(--font-display)] font-extrabold text-base tracking-tight text-[var(--text-primary)]">
                    BDESIGN
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  Premium brand identities, offset print layouts, hardcover binding packages, and recognition award trophies in Malappuram.
                </p>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Instagram Profile"
                  >
                    <Instagram size={16} />
                  </a>
                  <a
                    href="#"
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Dribbble Profile"
                  >
                    <Dribbble size={16} />
                  </a>
                </div>
              </div>

              {/* Sitemap Links */}
              <div>
                <span className="mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-bold block mb-4">
                  // Navigation
                </span>
                <div className="flex flex-col gap-2">
                  {[
                    ["#work", "Portfolio Gallery"],
                    ["#services", "Services Offerings"],
                    ["#reviews", "Testimonial Reviews"],
                    ["#contact", "WhatsApp Connect"],
                  ].map(([href, label]) => (
                    <a
                      key={href}
                      href={href}
                      className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Creative Specializations */}
              <div>
                <span className="mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-bold block mb-4">
                  // Services
                </span>
                <div className="flex flex-col gap-2">
                  {[
                    "Brand Guidelines",
                    "Retail Packaging Boxes",
                    "Prepress & Magazines",
                    "Laser Trophy Engraving",
                    "Social Media Templates",
                  ].map((item, idx) => (
                    <span key={idx} className="text-xs text-[var(--text-secondary)]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hours / Quick Contact */}
              <div>
                <span className="mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-bold block mb-4">
                  // Contact Desk
                </span>
                <div className="flex flex-col gap-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                  <span>Mon – Sat: 9:00 AM – 8:30 PM</span>
                  <span className="text-[var(--text-muted)]">Closed on Sundays</span>
                  <a
                    href="tel:09961133633"
                    className="text-sm font-bold text-[var(--brand-blue)] no-underline mt-2 block"
                  >
                    +91 99611 33633
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright & Suggest Edit */}
            <div className="border-t border-[var(--border-primary)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
                © {new Date().getFullYear()} BDESIGN · CHEMMAD, KERALA
              </span>
              
              <button
                id="btn-suggest-edit"
                onClick={() => setShowEditModal(true)}
                className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none underline cursor-pointer transition-colors"
              >
                Suggest an Edit
              </button>
            </div>
          </div>
        </footer>

        {/* ── Project Showcase Dialog ────────────────────────────────────── */}
        <Dialog
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
        >
          {selectedProject && (
            <DialogContent className="max-w-[90vw] sm:max-w-lg overflow-y-auto p-0 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="relative aspect-[4/3] bg-[var(--bg-primary)] overflow-hidden flex items-center justify-center">
                <div className="crop-marks">
                  <div className="crop-mark tl" />
                  <div className="crop-mark tr" />
                  <div className="crop-mark bl" />
                  <div className="crop-mark br" />
                </div>
                {selectedProject.image ? (
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles
                    size={32}
                    style={{
                      color: CATEGORY_COLOR[selectedProject.category] || "var(--text-muted)"
                    }}
                  />
                )}
                <span className="absolute top-4 left-4">
                  <span
                    className="mono text-[8px] tracking-wider uppercase px-2.5 py-1 text-white font-bold rounded-md"
                    style={{
                      backgroundColor: CATEGORY_COLOR[selectedProject.category] || "var(--text-muted)"
                    }}
                  >
                    {selectedProject.category}
                  </span>
                </span>
              </div>
              <div className="p-6">
                <span className="mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Client: {selectedProject.client} · {selectedProject.year}
                </span>
                <h3 className="text-xl font-bold tracking-tight mb-3">
                  {selectedProject.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                  {selectedProject.description}
                </p>
                <div className="flex gap-1.5 flex-wrap mb-6">
                  {selectedProject.tags?.map((t: string, i: number) => (
                    <span
                      key={i}
                      className="mono text-[8px] tracking-wider uppercase bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-primary)] px-2 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                
                <a
                  href="#contact"
                  onClick={() => setSelectedProject(null)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 rounded-xl text-xs font-bold uppercase tracking-wider no-underline transition-all"
                >
                  Enquire About Project <ArrowRight size={14} />
                </a>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* ── Suggest Edit Dialog ────────────────────────────────────────── */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-[90vw] sm:max-w-md p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            <h3 className="text-lg font-bold tracking-tight mb-1 font-[var(--font-display)]">
              Suggest an Edit
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-normal mb-4">
              Help us keep BDESIGN studio coordinates and active hours accurate.
            </p>
            
            <form onSubmit={handleSuggestEdit} className="flex flex-col gap-3">
              {editSuccess ? (
                <div className="py-4 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold text-center rounded-xl">
                  ✓ Edit Request Submitted. Thanks!
                </div>
              ) : (
                <>
                  <div className="floating-group">
                    <textarea
                      id="input-suggest-content"
                      placeholder=" "
                      value={editSuggestion}
                      onChange={(e) => setEditSuggestion(e.target.value)}
                      rows={4}
                      required
                      className="floating-textarea"
                    />
                    <label htmlFor="input-suggest-content" className="floating-label">
                      Describe active hours, phone numbers or address corrections...
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 rounded-xl text-xs font-bold uppercase tracking-wider border-none cursor-pointer transition-all"
                  >
                    Submit Correction
                  </button>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}