(function () {
  function strip(cls) { return (cls||"").replace(/\bv2-/g, ""); }
  function clsOf(el) { return typeof el.className === "string" ? el.className : (el.className && el.className.baseVal) || ""; }

  const props = [
    "fontFamily","fontSize","fontWeight","fontStyle","lineHeight","letterSpacing","textTransform",
    "color","backgroundColor","backgroundImage","border","borderRadius","boxShadow","opacity",
    "display","position","flexDirection","gridTemplateColumns","justifyContent","alignItems",
    "gap","rowGap","columnGap","padding","margin","objectFit","textAlign","textDecorationLine"
  ];

  function computedSubset(el) {
    const cs = getComputedStyle(el);
    const out = {};
    for (const p of props) {
      const v = cs[p];
      if (v && v !== "none" && v !== "normal" && v !== "auto" && v !== "0px" && v !== "rgba(0, 0, 0, 0)") out[p] = v;
      else if (["display","position","fontStyle","textTransform"].includes(p)) out[p] = v; // always keep these even if "none"/"normal"/"static"
    }
    return out;
  }

  // Correction (12/09) : un élément à contenu mixte (texte direct + enfant(s)
  // décoratif(s), ex. <p>amDG Éditions<span></span></p>) échouait au test
  // isLeaf() d'origine (enfant élément présent) et n'était donc JAMAIS mesuré,
  // ni côté maquette ni côté V2 — trou de couverture qui a laissé passer un
  // écart réel (text-transform) sans le signaler ni conforme ni non conforme.
  // On capture désormais aussi tout élément portant un nœud de texte DIRECT
  // non vide, même s'il a des enfants éléments — tout en excluant toujours
  // les enfants purement décoratifs sans texte propre (inchangé).
  function hasDirectText(el) {
    for (const child of el.childNodes) {
      if (child.nodeType === 3 && child.textContent.trim().length > 0) return true;
    }
    return false;
  }

  function isCapturable(el) {
    if (el.tagName === "IMG" || el.tagName === "SVG" || el.tagName === "INPUT" || el.tagName === "TIME") return true;
    if (el.children.length === 0) return true; // feuille pure (comportement d'origine)
    return hasDirectText(el); // contenu mixte : texte direct + enfant(s) décoratif(s)
  }

  const root = document.body;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  const out = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.closest("script,style,noscript")) continue;
    if (!isCapturable(node)) continue;
    const text = (node.textContent || "").trim();
    if (node.tagName !== "IMG" && node.tagName !== "SVG" && node.tagName !== "INPUT" && !text) continue;
    if (text.length > 250) continue;
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0 && node.tagName !== "INPUT") continue;
    const parent = node.parentElement;
    const parentCs = parent ? getComputedStyle(parent) : null;
    out.push({
      tag: node.tagName.toLowerCase(),
      cls: strip(clsOf(node)),
      parentCls: parent ? strip(clsOf(parent)) : "",
      parentTag: parent ? parent.tagName.toLowerCase() : "",
      text: text.slice(0, 80),
      mixedContent: node.children.length > 0,
      rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
      style: computedSubset(node),
      parentStyle: parentCs ? { display: parentCs.display, flexDirection: parentCs.flexDirection, gridTemplateColumns: parentCs.gridTemplateColumns, gap: parentCs.gap, justifyContent: parentCs.justifyContent, alignItems: parentCs.alignItems } : null
    });
  }
  return JSON.stringify(out);
})();
