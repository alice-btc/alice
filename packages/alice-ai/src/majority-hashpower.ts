/** Shared subject gate for majority-mining evidence and its prompt guidance.
 * A percentage of revenue or miner count is not a share of hash power. */
export function isMajorityHashpowerQuestion(value: string): boolean {
  const text = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'").replace(/[‐-―−]/g, '-')
    .replace(/^>.*$/gm, '').replace(/"[^"\n]*"|«[^»]*»|“[^”]*”/g, '')
    .split(/\b(?:another topic|new topic|autre sujet|changeons de sujet)\b/).at(-1) ?? '';
  if (/\b(?:ethereum|solana|monero|litecoin|dogecoin|lightning|ark|cashu|fedimint)\b/.test(text)) return false;
  const attack = /\b(?:majority attack|attaque majoritaire|51\s*%?\s*(?:attack|attaque)|attaque (?:a |de |des )?51\s*%?)/.test(text);
  if (attack) return true;
  const power = String.raw`(?:hash(?:ing)?[ -]?(?:power|rate)|puissance (?:de )?(?:calcul|hachage))`;
  const mining = new RegExp(String.raw`\b(?:${power}|mining|minage|miners?|mineurs?)\b`).test(text);
  if (!mining) return false;
  // Shutdown and pool remuneration have different educational sources. Do not
  // turn a numeric percentage in either question into an attack capability.
  const capabilities = /\b(?:censor\w*|censur\w*|reorg\w*|double[ -]spend\w*|double depense|subsid\w*|subvention\w*|coinbase|issuance|emission|inflation|harmless|harmful|inoffens\w*|dangereu\w*|honest\w*|honnet\w*|impos\w*|invalid\w*|rules?|regles?)\b/.test(text);
  if (!capabilities && /\b(?:stop\w*|shutdown|shut down|switch off|offline|disappear\w*|arret\w*|eteign\w*|dispar\w*|payout\w*|revenue\w*|revenus?|profit\w*|remuner\w*)\b/.test(text)) return false;
  if (/\b(?:majorit\w*|dominant\w*|more than half|over half|plus de la moitie|most (?:of (?:the )?)?(?:hash|computing))\b/.test(text)) return true;
  const pct = String.raw`(\d+(?:[.,]\d+)?)\s*(?:%|percent\b|pour cent\b)`;
  const connector = String.raw`(?:\s+(?:of|de|du|des|la|le|the|bitcoin(?:'s)?|network(?:'s)?|total|global|its|sa|son)){0,5}\s+`;
  const before = new RegExp(String.raw`\b${pct}${connector}${power}\b`, 'g');
  const after = new RegExp(String.raw`\b${power}\s+(?:(?:share|part|is|at|of|de|est|a|equals|represents|represente)\s+){0,3}${pct}`, 'g');
  return [...text.matchAll(before), ...text.matchAll(after)].some(match => {
    const share = Number(match[1].replace(',', '.'));
    return share > 50 && share <= 100;
  });
}
