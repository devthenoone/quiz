"use client";

import { useState } from "react";
import { ToggleField, DarkButton } from "./ui";

export default function EmailSetupForm({ initial }: { initial: Record<string, string> }) {
  const [smtpEnabled, setSmtpEnabled] = useState(initial.smtp_enabled === "true");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ smtp_enabled: smtpEnabled ? "true" : "false" }),
    });
    setSaving(false);
    setMsg(res.ok ? "Saved." : "Failed to save.");
    setTimeout(() => setMsg(""), 4000);
  }

  return (
    <div className="max-w-2xl rounded-xl border border-admin-border bg-white p-6">
      <h3 className="text-sm font-semibold text-gray-800">Use SMTP</h3>
      <ToggleField
        label="Enable SMTP"
        help="Toggle SMTP for sending E-mails"
        checked={smtpEnabled}
        onChange={setSmtpEnabled}
      />

      <div className="mt-6 flex items-center gap-3 border-t border-admin-border pt-5">
        <DarkButton onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </DarkButton>
        {msg && <span className="text-sm text-gray-500">{msg}</span>}
      </div>
    </div>
  );
}
