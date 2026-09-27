import { getCategories } from "@/lib/content/categories";
import { addCategory, renameCategory, deleteCategory } from "./actions";
import Pagination from "@/components/admin/Pagination";

export default async function AdminCategoriesPage({searchParams}:{searchParams:Promise<{page?:string}>}) {
 const {page:raw}=await searchParams; const page=Math.max(1,Number(raw)||1); const perPage=5;
 const categories=await getCategories(); const visible=categories.slice((page-1)*perPage,page*perPage);
 return <><h1>Catégories</h1><p className="admin-lede">Les thèmes utilisés pour classer vos publications. Renommer une catégorie met à jour tous les articles qui l&apos;utilisent.</p>
 <div className="items-table"><div className="item-row head" style={{gridTemplateColumns:"1fr 190px"}}><div>Nom</div><div>Actions</div></div>
 {!visible.length&&<div className="item-row" style={{gridTemplateColumns:"1fr"}}><div className="admin-row-empty">Aucune catégorie pour le moment.</div></div>}
 {visible.map(c=><form action={renameCategory} key={c.id} className="item-row" style={{gridTemplateColumns:"1fr 190px"}}><input type="hidden" name="id" value={c.id}/><input name="name" defaultValue={c.name} style={{padding:"7px 10px",border:"1px solid var(--line)",borderRadius:6,fontSize:13.5}}/><div className="item-actions"><button type="submit">Renommer</button><button type="submit" formAction={deleteCategory} className="danger">Suppr.</button></div></form>)}</div>
 {categories.length>0&&<Pagination page={page} perPage={perPage} total={categories.length} basePath="/admin/categories" showPerPageSelector={false}/>}
 <div className="editor-card" style={{maxWidth:480,marginTop:20}}><h3>Ajouter une catégorie</h3><form action={addCategory} style={{display:"flex",gap:8}}><input name="name" placeholder="ex. Identité de fils" required style={{flex:1,padding:"9px 11px",border:"1px solid var(--line)",borderRadius:6}}/><button className="admin-btn-primary">Ajouter</button></form></div></>;
}
