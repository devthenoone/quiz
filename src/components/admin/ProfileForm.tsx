"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, TextInput, ToggleField, GradientButton } from "./ui";

type Initial = {
  email: string;
  username: string;
  name: string;
  gender: string;
  avatarUrl: string;
  useGravatar: boolean;
};

export default function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(initial.email);
  const [username, setUsername] = useState(initial.username);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [name, setName] = useState(initial.name);
  const [gender, setGender] = useState(initial.gender || "male");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [useGravatar, setUseGravatar] = useState(initial.useGravatar);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("avatar", file);
    const res = await fetch("/api/account/avatar", { method: "POST", body: form });
    const json = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      setError(json.error || "Upload failed.");
      return;
    }
    setAvatarUrl(json.url);
    setUseGravatar(false);
  }

  async function save() {
    setError("");
    setSaving(true);
    const res = await fetch("/api/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username,
        newPassword: newPassword || undefined,
        currentPassword: currentPassword || undefined,
        name,
        gender,
        avatarUrl,
        useGravatar,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Failed to save.");
      return;
    }
    setNewPassword("");
    setCurrentPassword("");
    setMsg("Profile updated.");
    setTimeout(() => setMsg(""), 4000);
    router.refresh();
  }

  return (
    <div className="max-w-3xl rounded-xl border border-admin-border bg-white p-6">
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <FormField label="E-Mail">
          <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label="Username">
          <TextInput value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormField>

        <FormField
          label="New Password"
          help="Leave blank if you don't want to change."
        >
          <TextInput
            type="password"
            placeholder="6 characters or more"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </FormField>
        <FormField
          label="Current Password"
          help="Needed if you want to change your password."
        >
          <TextInput
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </FormField>

        <FormField label="Full Name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="Gender">
          <div className="mt-1 flex gap-5 text-sm text-gray-700">
            {(["male", "female", "non-binary"] as const).map((g) => (
              <label key={g} className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="gender"
                  checked={gender === g}
                  onChange={() => setGender(g)}
                />
                {g === "male" ? "Male" : g === "female" ? "Female" : "Non-Binary"}
              </label>
            ))}
          </div>
        </FormField>

        <FormField label="Avatar">
          <div className="flex items-center gap-3">
            {avatarUrl && !useGravatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={pickFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Choose image"}
            </button>
          </div>
        </FormField>
        <div className="flex items-end pb-1">
          <ToggleField
            label="Force Gravatar"
            help="Remove avatar and use Gravatar"
            checked={useGravatar}
            onChange={setUseGravatar}
          />
        </div>
      </div>

      {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex items-center gap-3 border-t border-admin-border pt-5">
        <GradientButton onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Update Profile"}
        </GradientButton>
        {msg && <span className="text-sm text-green-600">{msg}</span>}
      </div>
    </div>
  );
}
