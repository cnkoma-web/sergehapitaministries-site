import { createClient } from "@/lib/supabase/server";
import { getInterfaceTexts } from "./interfaceTexts";
import type { NavLink, NavItem } from "./navTypes";

export type { NavLink, NavDropdown, NavItem } from "./navTypes";
export { isDropdown } from "./navTypes";

// Le menu de navigation est une vraie liste gérée par Serge depuis
// /admin/navigation (cahier — exigence transversale), pas une structure figée
// dans le code : ajout/suppression/renommage/réordonnancement de liens sans
// toucher au code. Un item de premier niveau sans href est un menu déroulant,
// ses enfants (parent_id) sont ses liens.
export async function getMainNav(): Promise<NavItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nav_items")
    .select("id, parent_id, label, href")
    .order("position", { ascending: true });
  if (error || !data) return [];

  const topLevel = data.filter((item) => !item.parent_id);
  return topLevel.map((item) => {
    const children = data.filter((c) => c.parent_id === item.id);
    // Déroulant si des enfants existent — indépendamment de son propre href
    // (un déroulant peut aussi mener quelque part en cliquant sur son
    // libellé, ex. "Publications" → le hub ; "À propos" n'a pas de page
    // d'atterrissage propre et reste un simple déclencheur de survol).
    if (children.length > 0) {
      return { label: item.label, href: item.href ?? undefined, links: children.map((c) => ({ label: c.label, href: c.href ?? "#" })) };
    }
    return { label: item.label, href: item.href ?? "#" };
  });
}

export async function getBrandSplitLinks(): Promise<{ left: NavLink; right: NavLink }> {
  const texts = await getInterfaceTexts();
  return {
    left: {
      label: texts["brand_split.left.label"] ?? "ActesDesFilsDeDieu",
      href: texts["brand_split.left.href"] ?? "http://www.actedesfilsdedieu.fr",
    },
    right: {
      label: texts["brand_split.right.label"] ?? "amDG Éditions",
      href: texts["brand_split.right.href"] ?? "http://www.amdgeditions.fr",
    },
  };
}
