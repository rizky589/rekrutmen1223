import { redirect } from "next/navigation";
import { submitExam, startAttempt } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { ExamSubmitButton } from "@/components/exam-submit-button";
import { ExamTimer } from "@/components/exam-timer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { ANSWER_KEYS, TOTAL_QUESTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Question } from "@/types/database";

export default async function ExamPage() {
  const { profile } = await requireProfile();
  const attemptId = await startAttempt();
  const supabase = await createClient();
  const { data: attempt } = await supabase.from("exam_attempts").select("*").eq("id", attemptId).single();
  const { data: questions } = await supabase
    .from("questions")
    .select("id,order_number,prompt,option_a,option_b,option_c,option_d,option_e,category,is_active,created_at")
    .eq("is_active", true)
    .order("order_number")
    .limit(TOTAL_QUESTIONS);

  if (!attempt || attempt.status !== "in_progress") redirect("/dashboard");
  if (!questions || questions.length === 0) redirect("/dashboard?status=questions-empty");

  return (
    <AppShell profile={profile}>
      <div className="flex h-[calc(100dvh-7rem)] min-h-0 flex-col gap-4 overflow-hidden md:h-[calc(100dvh-8rem)]">
        <div className="shrink-0 rounded-lg border bg-background/95 p-4 pr-4 shadow-sm backdrop-blur sm:pr-[22rem]">
          <h1 className="text-2xl font-semibold">Tes Kompetensi</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Jawab semua soal. Nilai tidak ditampilkan setelah submit.</p>
        </div>

        <div className="fixed right-3 top-20 z-50 max-w-[calc(100vw-1.5rem)] rounded-lg border bg-background/95 p-2 shadow-lg backdrop-blur md:right-6">
          <div className="origin-top-right scale-[0.92] sm:scale-100">
            <ExamTimer startedAt={attempt.started_at} />
          </div>
        </div>

        <form action={submitExam} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain rounded-lg pr-1 pb-24 md:pb-6">
          <input type="hidden" name="attemptId" value={attemptId} />
          {(questions as Question[]).map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-base">Soal {question.order_number}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-7">{question.prompt}</p>
                <div className="grid gap-2">
                  {shuffleAnswerKeys(`${attemptId}-${question.id}`).map((key, optionIndex) => {
                    const optionKey = `option_${key.toLowerCase()}` as keyof Question;
                    const displayKey = ANSWER_KEYS[optionIndex];
                    const text = question[optionKey];
                    return (
                      <label key={key} className="flex items-start gap-3 rounded-md border p-3 text-sm hover:bg-muted">
                        <input className="mt-1" type="radio" name={`q_${question.id}`} value={key} required />
                        <span><b>{displayKey}.</b> {text}</span>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
          <ExamSubmitButton questionIds={(questions as Question[]).map((question) => ({ id: question.id, number: question.order_number }))} />
        </form>
      </div>
    </AppShell>
  );
}

function shuffleAnswerKeys(seed: string) {
  const keys = [...ANSWER_KEYS];
  for (let index = keys.length - 1; index > 0; index -= 1) {
    const swapIndex = seededNumber(`${seed}-${index}`) % (index + 1);
    [keys[index], keys[swapIndex]] = [keys[swapIndex], keys[index]];
  }
  return keys;
}

function seededNumber(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}
