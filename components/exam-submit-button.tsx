"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ExamSubmitButton({ questionIds }: { questionIds: Array<{ id: string; number: number }> }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleOpen() {
    const unanswered = questionIds.filter((question) => {
      const checked = document.querySelector<HTMLInputElement>(`input[name="q_${question.id}"]:checked`);
      return !checked;
    });

    if (unanswered.length) {
      const numbers = unanswered.map((question) => question.number).join(", ");
      toast.error(`Masih ada soal belum dijawab: ${numbers}`);
      return;
    }

    setOpen(true);
  }

  return (
    <>
      <Button type="button" size="lg" className="w-full" onClick={handleOpen}>
        Submit Jawaban
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-lg border bg-card p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border text-primary">
              <HelpCircle className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-semibold leading-tight">Apakah anda yakin akan mengakhiri ujian?</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Setelah submit, Anda tidak dapat mengubah jawaban kembali.
            </p>
            <div className="responsive-two-grid mt-6 gap-3">
              <Button
                type="button"
                disabled={submitting}
                onClick={(event) => {
                  setSubmitting(true);
                  event.currentTarget.closest("form")?.requestSubmit();
                }}
              >
                {submitting ? "Mengirim..." : "Ya, Submit"}
              </Button>
              <Button type="button" variant="secondary" disabled={submitting} onClick={() => setOpen(false)}>
                Kembali
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
