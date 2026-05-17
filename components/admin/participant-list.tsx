"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { deleteParticipant, resetParticipantExam } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Participant } from "@/types/database";

export function ParticipantList({ participants }: { participants: Participant[] }) {
  return (
      <div className="-mx-5 overflow-x-auto px-5 pb-2">
        <Table className="min-w-[820px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[260px]">Nama</TableHead>
              <TableHead className="w-[140px]">Tanggal Lahir</TableHead>
              <TableHead className="w-[180px]">Kecamatan</TableHead>
              <TableHead className="w-[150px]">HP</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[150px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.full_name}</TableCell>
                <TableCell>{item.birth_date ?? "-"}</TableCell>
                <TableCell>{item.district ?? "-"}</TableCell>
                <TableCell>{item.phone ?? "-"}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <ResetButton id={item.id} name={item.full_name} />
                    <DeleteButton id={item.id} name={item.full_name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  );
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteParticipant}>
      <input type="hidden" name="id" value={id} />
      <Button
        variant="destructive"
        size="icon"
        aria-label="Hapus peserta"
        onClick={(event) => {
          if (!window.confirm(`Hapus peserta ${name}?`)) event.preventDefault();
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  );
}

function ResetButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={resetParticipantExam}>
      <input type="hidden" name="participantId" value={id} />
      <Button
        variant="outline"
        size="icon"
        aria-label="Reset ujian peserta"
        title="Reset ujian peserta"
        onClick={(event) => {
          if (!window.confirm(`Reset ujian peserta ${name}? Jawaban dan attempt ujian akan dihapus.`)) event.preventDefault();
        }}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </form>
  );
}
