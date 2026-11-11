import { http } from "./client";
import type { BreakageResponse } from "./types";

/** Blocked names devices keep asking for while they use the site they belong to. */
export function get(): Promise<BreakageResponse> {
  return http.get("/breakage");
}

/** The block is fine as it is: stop suggesting it. */
export function ignore(domain: string): Promise<{ domain: string; persisted: boolean }> {
  return http.post("/breakage/ignore", { domain });
}

/** Suggest it again if it breaks something. */
export function unignore(domain: string): Promise<{ domain: string; persisted: boolean }> {
  return http.del(`/breakage/ignore/${encodeURIComponent(domain)}`);
}
