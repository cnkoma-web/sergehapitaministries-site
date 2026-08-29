import { createClient } from "@/lib/supabase/server";
import { markInvitationHandled } from "./actions";
import Pagination from "@/components/admin/Pagination";

export default async function AdminInvitationsPage({ searchParams }: { searchParams: Promise<{ page?: string; perPage?: string }> }) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data: invitations, count } = await supabase
    .from("invitation_submissions")
    .select("id, prenom, nom, email, telephone, hote, ville, pays, type_invitation, theme, date_debut, date_fin, handled, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  return (
    <>
      <div className="admin-header">
        <h2>Demandes d&apos;invitation</h2>
      </div>
      <p className="admin-lede">Les demandes envoyées depuis le formulaire d&apos;invitation.</p>

      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "1fr 1fr 1fr 90px 110px" }}>
          <div>De</div>
          <div>Hôte / lieu</div>
          <div>Événement</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>
        {invitations?.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucune demande pour le moment.</div>
          </div>
        )}
        {invitations?.map((inv) => (
          <div className="item-row" key={inv.id} style={{ gridTemplateColumns: "1fr 1fr 1fr 90px 110px", background: inv.handled ? undefined : "var(--lavender)" }}>
            <div style={{ fontSize: 13 }}>
              {inv.prenom} {inv.nom}
              <span style={{ display: "block", fontSize: 11.5, color: "var(--ink-soft)" }}>{inv.email} · {inv.telephone}</span>
            </div>
            <div style={{ fontSize: 12.5 }}>
              {inv.hote}
              <span style={{ display: "block", fontSize: 11.5, color: "var(--ink-soft)" }}>{inv.ville}, {inv.pays}</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
              {inv.type_invitation} — {inv.theme}
              <span style={{ display: "block", fontSize: 11.5 }}>
                {new Date(inv.date_debut).toLocaleDateString("fr-FR")} → {new Date(inv.date_fin).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div>
              <span className={`status-badge ${inv.handled ? "masque" : "actif"}`}>{inv.handled ? "Traitée" : "Nouvelle"}</span>
            </div>
            <div className="item-actions">
              {!inv.handled && (
                <form action={markInvitationHandled}>
                  <input type="hidden" name="id" value={inv.id} />
                  <button type="submit">Marquer traitée</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {(count ?? 0) > 0 && <Pagination page={page} perPage={perPage} total={count ?? 0} basePath="/admin/invitations" />}
    </>
  );
}
