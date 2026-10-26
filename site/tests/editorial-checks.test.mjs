import test from "node:test";
import assert from "node:assert/strict";
import { fingerprint, editorialChecks, assertDraftShape } from "../src/lib/editorial/checks.ts";
import { validatePublicationDraft } from "../src/lib/content/publicationValidation.ts";
const draft = {
  type:"qdlb",title:"La vie en Christ",article_date:"2026-10-26",
  body:"<p>Un premier paragraphe.</p><p>Un second paragraphe.</p>",
  excerpt:"Un chapeau.",verse_reference:"Jean 15:5",verse_text:"Je suis le cep, vous êtes les sarments.",
  author_name:"Serge Hapita",further_verses:[{reference:"Jean 15:5",text:"Je suis le cep, vous êtes les sarments."}],
  seo_keywords:Array.from({length:20},(_,i)=>"expression "+i),image_prompt:"Un paysage",
  cover_url:"https://example.test/image.png",cover_alt:"Un paysage au matin",
  image_bytes:2_000_000,image_width:1920,image_height:1080,
};
test("un brouillon complet satisfait les contrôles de structure",()=>{
  assertDraftShape(draft);
  assert.deepEqual(editorialChecks(draft),[]);
  assert.deepEqual(validatePublicationDraft(draft),[]);
});
test("la validation est liée au texte et à sa source, indépendamment de l’ordre JSON",()=>{
  const original=fingerprint({source_hash:"a",draft});
  assert.equal(original,fingerprint({draft,source_hash:"a"}));
  assert.notEqual(original,fingerprint({source_hash:"b",draft}));
  assert.notEqual(original,fingerprint({source_hash:"a",draft:{...draft,title:"Titre corrigé"}}));
});
test("les balises actives et attributs HTML bloquent la publication",()=>{
  for(const body of ['<p onclick="alert(1)">Texte</p>','<script>alert(1)</script>',"<iframe></iframe>","<img src=x onerror=alert(1)>","<p/onmouseover=alert(1)>Texte</p>","<p hidden>Texte</p>"]) {
    assert.ok(editorialChecks({...draft,body}).some(s=>s.includes("HTML")));
  }
});
test("les dates impossibles, auteurs incorrects et versets incomplets bloquent",()=>{
  assert.ok(validatePublicationDraft({...draft,article_date:"2026-02-30"}).length);
  assert.ok(validatePublicationDraft({...draft,author_name:null}).length);
  assert.ok(validatePublicationDraft({...draft,further_verses:[{reference:"",text:"Citation"}]}).length);
});
test("les images absentes ou insuffisantes et mots-clés répétés bloquent",()=>{
  assert.ok(editorialChecks({...draft,cover_url:null}).length);
  assert.ok(editorialChecks({...draft,image_bytes:500_000}).length);
  assert.ok(editorialChecks({...draft,image_width:800}).length);
  assert.ok(editorialChecks({...draft,seo_keywords:Array(20).fill("répété")}).length);
});
test("Rosée exige longueur, deux phrases de chapeau et surbrillance",()=>{
  const rm={...draft,type:"rm",author_name:null,verse_text:"Une phrase. Deux phrases.",body:"<p><mark>La phrase clé.</mark> "+Array(237).fill("parole").join(" ")+"</p>"};
  assert.deepEqual(editorialChecks(rm),[]);
  assert.ok(editorialChecks({...rm,body:"<p>Trop court.</p>"}).length);
  assert.ok(editorialChecks({...rm,verse_text:"Une phrase."}).length);
});
test("les réponses de modèle malformées sont rejetées avant sauvegarde",()=>{
  assert.throws(()=>assertDraftShape({...draft,title:{html:"x"}}));
  assert.throws(()=>assertDraftShape({...draft,further_verses:[null]}));
  assert.throws(()=>assertDraftShape({...draft,seo_keywords:"a,b"}));
});

