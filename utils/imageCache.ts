// Structure: utils/imageCache.ts
// Type: Utility
const CACHE_NAME = "r3f-image-cache-v1";

export async function getCachedImage(url: string): Promise<Blob> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(url);
  if (cached) return cached.blob();

  const res = await fetch(url);
  if (!res.ok) throw new Error("Image fetch failed");

  await cache.put(url, res.clone());
  return res.blob();
}
