export function getNavSectionId(href: string): string | null {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return null;

  const sectionId = href.slice(hashIndex + 1).trim();
  return sectionId.length > 0 ? sectionId : null;
}

export function shouldHandleNavInPage(pathname: string, href: string): boolean {
  return pathname === "/" && getNavSectionId(href) !== null;
}
