import Link from "next/link";
import { APP_NAME, OFFICE_NAME } from "@/lib/constants";

export function Logo() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold leading-4">{APP_NAME}</span>
        <span className="block truncate text-xs text-muted-foreground">{OFFICE_NAME}</span>
      </span>
    </Link>
  );
}
