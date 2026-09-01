"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OutlineButton } from "./ui";

export default function EngineActions({
  id,
  isDefault,
  onlyEngine,
}: {
  id: number;
  isDefault: boolean;
  onlyEngine: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setDefault() {
    setBusy(true);
    await fetch(`/api/engines/${id}`, { method: "PATCH" });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this search engine? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/engines/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <>
      {!isDefault && (
        <OutlineButton tone="green" onClick={setDefault} disabled={busy}>
          Set Default
        </OutlineButton>
      )}
      <OutlineButton tone="red" onClick={remove} disabled={busy || onlyEngine} title={
        onlyEngine ? "Can't delete the only search engine" : undefined
      }>
        Delete
      </OutlineButton>
    </>
  );
}
