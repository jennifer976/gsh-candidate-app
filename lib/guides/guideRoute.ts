import type { Href } from "expo-router";

/** In-app route for a website guide path such as `/relocating/x` or `/visa-sponsorship-jobs`. */
export function guideRoute(path: string): Href {
  const relocation = /^\/relocating\/([^/]+)$/.exec(path);
  if (relocation) return `/relocating/${relocation[1]}`;
  const topLevel = /^\/([^/]+)$/.exec(path);
  if (topLevel) return `/guide/${topLevel[1]}`;
  return { pathname: "/guides/topic", params: { q: encodeURIComponent(path) } };
}
