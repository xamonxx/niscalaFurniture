/**
 * Whether a nav link points at the page currently being viewed.
 *
 * "/" needs an exact match: every path starts with a slash, so the usual
 * prefix test would leave Home highlighted on every page of the site.
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
