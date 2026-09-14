/* eslint-disable @typescript-eslint/no-unused-expressions -- Executed by playwright-cli eval. */
async () => {
  const results = [];
  for (const path of ["/product-plan.pdf", "/demo.webm"]) {
    const response = await fetch(path, { cache: "reload" });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    const bytes = await response.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const sha256 = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
    results.push({ path, status: response.status, contentType: response.headers.get("content-type"), bytes: bytes.byteLength, sha256 });
  }
  return { testedAt: new Date().toISOString(), origin: location.origin, authenticated: false, results };
}
