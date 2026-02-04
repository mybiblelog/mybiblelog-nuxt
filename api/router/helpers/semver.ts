export type Semver = {
  major: number;
  minor: number;
  patch: number;
};

/**
 * Parse a semver-ish string like:
 * - "1.2.3"
 * - "1.2.3-alpha.1" (pre-release ignored for ordering)
 * - "1.2.3+42" (build metadata ignored for ordering)
 *
 * Returns null if it can't be parsed.
 */
export function parseSemver(input: string): Semver | null {
  if (typeof input !== 'string') { return null; }
  const trimmed = input.trim();
  if (!trimmed) { return null; }

  // Drop build metadata, then pre-release.
  const noBuild = trimmed.split('+', 1)[0] ?? trimmed;
  const core = noBuild.split('-', 1)[0] ?? noBuild;
  const parts = core.split('.');
  // Require strict semver core: MAJOR.MINOR.PATCH
  if (parts.length !== 3) { return null; }

  const major = Number(parts[0]);
  const minor = Number(parts[1]);
  const patch = Number(parts[2]);

  if (![major, minor, patch].every((n) => Number.isInteger(n) && n >= 0)) {
    return null;
  }

  return { major, minor, patch };
}

export function compareSemver(a: Semver, b: Semver): number {
  if (a.major !== b.major) { return a.major < b.major ? -1 : 1; }
  if (a.minor !== b.minor) { return a.minor < b.minor ? -1 : 1; }
  if (a.patch !== b.patch) { return a.patch < b.patch ? -1 : 1; }
  return 0;
}

export function isSemverLessThan(a: string, b: string): boolean {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa || !pb) { return false; }
  return compareSemver(pa, pb) < 0;
}

