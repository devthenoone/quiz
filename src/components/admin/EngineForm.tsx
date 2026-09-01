"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, TextInput, ToggleField, CrimsonButton } from "./ui";

type Initial = {
  id?: number;
  name?: string;
  cseCx?: string;
  pubId?: string;
  styleId?: string;
  imageSearch?: boolean;
  showThumbnails?: boolean;
  isDefault?: boolean;
};

export default function EngineForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const editing = !!initial?.id;

  const [name, setName] = useState(initial?.name ?? "");
  const [cseCx, setCseCx] = useState(initial?.cseCx ?? "");
  const [pubId, setPubId] = useState(initial?.pubId ?? "");
  const [styleId, setStyleId] = useState(initial?.styleId ?? "");
  const [imageSearch, setImageSearch] = useState(initial?.imageSearch ?? false);
  const [showThumbnails, setShowThumbnails] = useState(initial?.showThumbnails ?? true);
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setError("");
    if (!name.trim()) {
      setError("Engine name is required.");
      return;
    }
    setSaving(true);
    const res = await fetch(editing ? `/api/engines/${initial!.id}` : "/api/engines", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, cseCx, pubId, styleId, imageSearch, showThumbnails, isDefault }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Failed to save.");
      return;
    }
    router.push("/dashboard/engines");
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-5">
      <FormField label="Engine Name" help="A short name for the engine">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>

      <FormField
        label="Google Custom Search ID"
        help="cx value from Programmable Search Engine. Include every hostname you use (including each subdomain) under Sites to Search, and check monetization/eligibility settings so results and AdSense for Search stay policy-compliant."
      >
        <TextInput value={cseCx} onChange={(e) => setCseCx(e.target.value)} />
      </FormField>

      <FormField
        label="AdSense for Search — pubId"
        help="Optional. Client ID from AdSense for Search (Custom Search Ads), e.g. partner-pub-1234567891234567. Required for center/bottom placements when using multiple search ad slots."
      >
        <TextInput
          value={pubId}
          onChange={(e) => setPubId(e.target.value)}
          placeholder="partner-pub-1234567891234567"
        />
      </FormField>

      <FormField
        label="AdSense for Search — styleId"
        help="Optional. Search style ID from your AdSense search style. Pair with pubId so AFS ad units render on the search results page (top, center, bottom) per dashboard toggles."
      >
        <TextInput value={styleId} onChange={(e) => setStyleId(e.target.value)} placeholder="1234567891" />
      </FormField>

      <ToggleField
        label="Image Search"
        help="Choose if the result type is image or not"
        checked={imageSearch}
        onChange={setImageSearch}
      />
      <ToggleField
        label="Display Thumbnails"
        help="Select if thumbnails will be shown when available (web result only)"
        checked={showThumbnails}
        onChange={setShowThumbnails}
      />
      <ToggleField
        label="Set Engine as Default"
        help="Choose if the engine is the default engine or not."
        checked={isDefault}
        onChange={setIsDefault}
      />

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end pt-2">
        <CrimsonButton onClick={save} disabled={saving}>
          {saving ? "Saving…" : editing ? "Update" : "Create Engine"}
        </CrimsonButton>
      </div>
    </div>
  );
}
