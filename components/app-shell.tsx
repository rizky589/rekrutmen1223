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
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
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
      <div className="mx-auto grid max-w-7xl gap-0 px-4 md:grid-cols-[240px_1fr] md:gap-6">
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
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-orange-500"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 py-5 md:py-8">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-2 backdrop-blur md:hidden">
        {nav.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[11px] text-muted-foreground transition-colors duration-200 hover:text-orange-500"
          >
            <item.icon className="h-4 w-4" />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
