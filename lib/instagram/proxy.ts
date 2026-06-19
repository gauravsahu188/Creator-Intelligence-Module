/**
 * ScrapOps Residential Proxy Configurator
 */

export function getScrapOpsProxyUrl(): string | undefined {
  const apiKey = process.env.SCRAPEOPS_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ SCRAPEOPS_API_KEY is not defined in environment variables.');
    return undefined;
  }

  // ScrapOps Bandwidth-based Residential & Mobile Proxy Aggregator:
  // Host: residential-proxy.scrapeops.io
  // Port: 8181 (HTTP)
  // Username: scrapeops
  // Password: YOUR_API_KEY
  return `http://scrapeops:${apiKey}@residential-proxy.scrapeops.io:8181`;
}
