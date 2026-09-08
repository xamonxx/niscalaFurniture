/** Primary navigation, shared by the header, the mobile menu and the footer. */
export const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/portfolio", label: "Portofolio" },
  { href: "/services", label: "Layanan" },
  { href: "/knowledge", label: "Panduan" },
  { href: "/about", label: "Tentang" },
  { href: "/contact", label: "Kontak" },
] as const;

export type NavLink = (typeof navLinks)[number];
