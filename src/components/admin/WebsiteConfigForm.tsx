"use client";

import { useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { FormField, TextInput, Select, ToggleField, WarningBanner, DarkButton } from "./ui";

export default function WebsiteConfigForm({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const [homepageIsSearch, setHomepageIsSearch] = useState(
    initial.homepage_is_search === "true"
  );
  const [trendingRegion, setTrendingRegion] = useState(
    initial.trending_region || "United States"
  );
  const [resultsPerPage, setResultsPerPage] = useState(initial.results_per_page || "10");
  const [adsTop, setAdsTop] = useState(initial.ads_top_enabled === "true");
  const [mirrorMode, setMirrorMode] = useState(initial.mirror_mode === "true");
  const [sitewidePubId, setSitewidePubId] = useState(initial.sitewide_pub_id || "");
  const [sitewideStyleId, setSitewideStyleId] = useState(initial.sitewide_style_id || "");
  const [adsCenter, setAdsCenter] = useState(initial.ads_center_enabled === "true");
  const [adsBottom, setAdsBottom] = useState(initial.ads_bottom_enabled === "true");
  const [safesearch, setSafesearch] = useState(initial.safesearch || "moderate");
  const [openNewTab, setOpenNewTab] = useState(initial.open_new_tab !== "false");
  const [showKeywordPreview, setShowKeywordPreview] = useState(
    initial.show_keyword_preview !== "false"
  );

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homepage_is_search: homepageIsSearch ? "true" : "false",
        trending_region: trendingRegion,
        results_per_page: resultsPerPage,
        ads_top_enabled: adsTop ? "true" : "false",
        mirror_mode: mirrorMode ? "true" : "false",
        sitewide_pub_id: sitewidePubId.trim(),
        sitewide_style_id: sitewideStyleId.trim(),
        ads_center_enabled: adsCenter ? "true" : "false",
        ads_bottom_enabled: adsBottom ? "true" : "false",
        safesearch,
        open_new_tab: openNewTab ? "true" : "false",
        show_keyword_preview: showKeywordPreview ? "true" : "false",
      }),
    });
    setSaving(false);
    setMsg(res.ok ? "Saved." : "Failed to save.");
    setTimeout(() => setMsg(""), 4000);
  }

  return (
    <div className="max-w-2xl space-y-1 rounded-xl border border-admin-border bg-white p-6">
      <ToggleField
        label="Use search page as homepage"
        help="If enabled, the homepage will show a search page rather than the content."
        checked={homepageIsSearch}
        onChange={setHomepageIsSearch}
      />

      <div className="border-t border-admin-border py-4">
        <FormField
          label="Trending searches region"
          help="Choose the region of the trending searches."
        >
          <Select value={trendingRegion} onChange={(e) => setTrendingRegion(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="border-t border-admin-border py-4">
        <FormField
          label="Search results per page"
          help="Google Programmable Search typically uses 10–20 results per page. Match this to your search engine configuration."
        >
          <TextInput
            type="number"
            min={1}
            max={20}
            value={resultsPerPage}
            onChange={(e) => setResultsPerPage(e.target.value)}
          />
        </FormField>
      </div>

      <div className="border-t border-admin-border py-4">
        <h3 className="text-sm font-semibold text-gray-800">Search ads placements</h3>
        <p className="mt-1 text-xs text-gray-400">
          Don&apos;t duplicate or reposition Google&apos;s ad HTML — only toggle the
          placements below and supply real AdSense for Search credentials.
        </p>

        <ToggleField
          label="Enable search ads 1 — top of search results"
          checked={adsTop}
          onChange={setAdsTop}
        />

        <ToggleField
          label="CSE-only: show 3 sponsored placements with cx only (mirror mode)"
          help="Mirrors the CSE sponsored unit into all three slots when no pubId/styleId is set."
          checked={mirrorMode}
          onChange={setMirrorMode}
        />

        <div className="grid gap-4 py-3 sm:grid-cols-2">
          <FormField label="Site-wide AdSense for Search — pubId (optional)">
            <TextInput
              value={sitewidePubId}
              onChange={(e) => setSitewidePubId(e.target.value)}
              placeholder="partner-pub-1234567891234567"
            />
          </FormField>
          <FormField label="Site-wide AdSense for Search — styleId (optional)">
            <TextInput
              value={sitewideStyleId}
              onChange={(e) => setSitewideStyleId(e.target.value)}
              placeholder="1234567891"
            />
          </FormField>
        </div>

        <ToggleField
          label="Enable search ads 2 — center of search results"
          checked={adsCenter}
          onChange={setAdsCenter}
        >
          {mirrorMode && (
            <WarningBanner>
              <strong>Policy warning (CSE users):</strong> Mirror mode (cx only) repeats the
              same CSE sponsored unit and may violate Google policies. Safer: add site-wide
              or engine pubId/styleId. Duplicate monetization can risk suspension or
              permanent ban.
            </WarningBanner>
          )}
        </ToggleField>

        <ToggleField
          label="Enable search ads 3 — bottom of search results"
          checked={adsBottom}
          onChange={setAdsBottom}
        >
          <WarningBanner>
            <strong>Policy warning (CSE users):</strong> With mirror mode OFF, bottom needs
            pubId/styleId (site or engine). With mirror mode ON and only cx, bottom shows a
            mirrored CSE sponsored block. Verify compliance with your AdSense / Programmable
            Search agreement.
          </WarningBanner>
        </ToggleField>
      </div>

      <div className="border-t border-admin-border py-4">
        <FormField
          label="Default SafeSearch Status"
          help="Default safesearch status, user can override via the preferences."
        >
          <Select value={safesearch} onChange={(e) => setSafesearch(e.target.value)}>
            <option value="off">Off</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
          </Select>
        </FormField>
      </div>

      <div className="border-t border-admin-border py-4">
        <ToggleField
          label="Open results in new window/tab"
          help="Choose if result links open in a new window/tab; users can override this in preferences."
          checked={openNewTab}
          onChange={setOpenNewTab}
        />
      </div>

      <div className="border-t border-admin-border py-4">
        <ToggleField
          label="Show local keyword preview"
          help="Shows the non-live 'your keywords' preview block under the live AdSense unit on articles. Turn off in production so a look-alike never sits next to real ads."
          checked={showKeywordPreview}
          onChange={setShowKeywordPreview}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-admin-border pt-5">
        <DarkButton onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </DarkButton>
        {msg && <span className="text-sm text-gray-500">{msg}</span>}
      </div>
    </div>
  );
}
