"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteQuestion, upsertQuestion } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Question } from "@/types/database";

export function QuestionManager({ questions }: { questions: Question[] }) {
  const [editing, setEditing] = useState<Question | null>(null);
  const key = useMemo(() => editing?.id ?? "new", [editing?.id]);

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>{editing ? "Edit Soal" : "Tambah Soal"}</CardTitle></CardHeader>
          <CardContent>
            <ActionForm key={key} action={upsertQuestion} className="space-y-3">
              {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
              <Field name="orderNumber" label="Nomor" type="number" defaultValue={editing?.order_number} />
              <div className="space-y-2"><Label>Pertanyaan</Label><Textarea name="prompt" defaultValue={editing?.prompt ?? ""} /></div>
              <Field name="optionA" label="Pilihan A" defaultValue={editing?.option_a} />
              <Field name="optionB" label="Pilihan B" defaultValue={editing?.option_b} />
              <Field name="optionC" label="Pilihan C" defaultValue={editing?.option_c} />
              <Field name="optionD" label="Pilihan D" defaultValue={editing?.option_d} />
              <Field name="optionE" label="Pilihan E" defaultValue={editing?.option_e} />
              <div className="space-y-2">
                <Label>Jawaban Benar</Label>
                <Select name="correctAnswer" defaultValue={editing?.correct_answer ?? "A"}>
                  <option>A</option><option>B</option><option>C</option><option>D</option><option>E</option>
                </Select>
              </div>
              <Field name="category" label="Kategori" defaultValue={editing?.category ?? ""} />
              <div className="responsive-two-grid gap-2">
                <Button className="w-full">{editing ? "Update Soal" : "Simpan Soal"}</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Reset</Button>
              </div>
            </ActionForm>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Import Excel/CSV</CardTitle></CardHeader>
          <CardContent>
            <form action="/api/admin/import-questions" method="post" encType="multipart/form-data" className="space-y-3">
              <div className="rounded-md border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                Kolom wajib: `nomor`, `pertanyaan`, `a`, `b`, `c`, `d`, `e`, `kunci`.
              </div>
              <Input name="file" type="file" accept=".xlsx,.xls,.csv" required />
              <Button className="w-full" variant="outline">Import Soal</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="overflow-x-auto pt-5">
          <Table>
            <TableHeader><TableRow><TableHead>No</TableHead><TableHead>Pertanyaan</TableHead><TableHead>Kunci</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {questions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.order_number}</TableCell>
                  <TableCell className="min-w-[360px]">{item.prompt}</TableCell>
                  <TableCell>{item.correct_answer}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="icon" onClick={() => setEditing(item)} aria-label="Edit soal">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <form action={deleteQuestion}>
                        <input type="hidden" name="id" value={item.id} />
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label="Hapus soal"
                          onClick={(event) => {
                            if (!window.confirm(`Hapus soal nomor ${item.order_number}?`)) event.preventDefault();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ name, label, type = "text", defaultValue = "" }: { name: string; label: string; type?: string; defaultValue?: string | number | null }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} />
    </div>
  );
}
