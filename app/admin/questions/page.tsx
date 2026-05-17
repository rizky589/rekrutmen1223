import { AppShell } from "@/components/app-shell";
import { QuestionManager } from "@/components/admin/question-manager";
import { SectionHeader } from "@/components/section-header";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Question } from "@/types/database";

export default async function QuestionsPage() {
  const { profile } = await requireAdmin();
  const supabase = await createClient();
  const { data: questions } = await supabase.from("questions").select("*").order("order_number");

  return (
    <AppShell profile={profile}>
      <SectionHeader title="Bank Soal" description="Kelola 30 soal aktif. Jawaban benar disimpan dan hanya dipakai server untuk scoring." />
      <QuestionManager questions={(questions ?? []) as Question[]} />
    </AppShell>
  );
}
