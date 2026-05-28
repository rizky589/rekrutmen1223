import Link from "next/link";
import { FileQuestion, LayoutDashboard, ListChecks, LogOut, Settings, ShieldCheck, Trophy, UserRound, UsersRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions";
import type { Profile } from "@/types/database";
import { initials } from "@/lib/utils";

const userNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/exam", label: "Ujian", icon: ListChecks },
  { href: "/profile", label: "Profil", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

const adminNav = [
  { href: "/admin", label: "Admin", icon: ShieldCheck },
  { href: "/admin/participants", label: "Peserta", icon: UsersRound },
  { href: "/admin/questions", label: "Soal", icon: FileQuestion },
  { href: "/admin/results", label: "Hasil", icon: Trophy },
];

export function AppShell({ children, profile }: { children: React.ReactNode; profile: Profile }) {
  const nav = profile.role === "admin" ? [...userNav, ...adminNav] : userNav;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 pt-[var(--safe-top)] backdrop-blur">
        <div className="app-container responsive-wrap flex h-16 items-center justify-between gap-3 px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:max-w-[88rem] 2xl:px-12">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut}>
              <Button
                className="h-10 rounded-full bg-orange-500 px-4 font-semibold text-white shadow-sm hover:bg-orange-600"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="app-container app-shell-layout px-4 sm:px-5 md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 md:px-6 lg:gap-8 lg:px-8 xl:gap-10 xl:px-10 2xl:max-w-[88rem] 2xl:gap-12 2xl:px-12">
        <aside className="hidden border-r py-6 md:block">
          <div className="mb-5 flex items-center gap-3 pr-5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-semibold">{initials(profile.full_name)}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{profile.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">{profile.role}</p>
            </div>
          </div>
          <nav className="space-y-1 pr-5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-orange-500"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 pb-[calc(var(--mobile-nav-height)_+_1rem)] pt-5 sm:pt-6 md:py-8 lg:py-9 xl:py-10 2xl:py-12">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid min-h-[var(--mobile-nav-height)] grid-cols-5 border-t bg-background/95 px-2 pb-[max(var(--safe-bottom),0.5rem)] pt-2 backdrop-blur md:hidden">
        {nav.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] text-muted-foreground transition-colors duration-200 hover:text-orange-500"
          >
            <item.icon className="h-4 w-4" />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
