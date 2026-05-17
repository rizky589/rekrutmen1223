import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";

export default async function SettingsPage() {
  const { profile } = await requireProfile();
  return (
    <AppShell profile={profile}>
      <SectionHeader title="Settings" description="Preferensi tampilan aplikasi." />
      <Card className="max-w-xl">
        <CardHeader><CardTitle>Tema</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Mode terang/gelap mengikuti perangkat atau pilihan Anda.</p>
          <ThemeToggle />
        </CardContent>
      </Card>
    </AppShell>
  );
}
