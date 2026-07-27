import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Compass,
  DollarSign,
  GitBranch,
  GraduationCap,
  TrendingUp,
  Scale,
  Bookmark,
  BookOpen,
  Database,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Career Explorer", href: "/careers", icon: Compass },
  { label: "Salary Explorer", href: "/salary", icon: DollarSign },
  { label: "Career Transitions", href: "/transitions", icon: GitBranch },
  { label: "Education Impact", href: "/education", icon: GraduationCap },
  { label: "Industry Trends", href: "/trends", icon: TrendingUp },
  { label: "Compare", href: "/compare", icon: Scale },
  { label: "Saved Careers", href: "/saved", icon: Bookmark },
  { label: "Methodology", href: "/methodology", icon: BookOpen },
  { label: "Data Sources", href: "/data-sources", icon: Database },
  { label: "Settings", href: "/settings", icon: Settings },
];

// Shown on mobile's bottom bar (a subset — the rest live in the "More" sheet).
export const MOBILE_PRIMARY_NAV: NavItem[] = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[2],
  NAV_ITEMS[3],
];
