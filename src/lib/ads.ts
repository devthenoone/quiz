import { getDefaultEngine } from "./engines";
import { getSettings } from "./settings";

// Precedence: the default Search Engine's own AdSense keys, then the
// site-wide keys set in Website Config, then the legacy global keys (kept
// for sites that configured AdSense before Search Engines existed).
export async function getActiveAdSenseCreds(): Promise<{ pubId: string; styleId: string }> {
  const engine = await getDefaultEngine();
  if (engine?.pub_id && engine?.style_id) {
    return { pubId: engine.pub_id, styleId: engine.style_id };
  }

  const settings = await getSettings();
  if (settings.sitewide_pub_id && settings.sitewide_style_id) {
    return { pubId: settings.sitewide_pub_id, styleId: settings.sitewide_style_id };
  }

  return { pubId: settings.adsense_pub_id || "", styleId: settings.rsoc_style_id || "" };
}
