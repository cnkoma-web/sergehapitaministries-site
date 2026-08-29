import { createClient } from "@/lib/supabase/server";
import { markContactRead } from "./actions";
import Pagination from "@/components/admin/Pagination";

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ page?: string; perPage?: string }> }) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data: messages, count } = await supabase
    .from("contact_submissions")
    .select("id, nom, email, sujet, message, read, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  return (
    <>
      <div className="admin-header">
        <h2>Messages de contact</h2>
      </div>
      <p className="admin-lede">Les messages envoyés depuis le formulaire de contact.</p>

      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "1fr 130px 1fr 90px 110px" }}>
          <div>De</div>
          <div>Sujet</div>
          <div>Message</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>
        {messages?.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucun message pour le moment.</div>
          </div>
        )}
        {messages?.map((m) => (
          <div className="item-row" key={m.id} style={{ gridTemplateColumns: "1fr 130px 1fr 90px 110px", background: m.read ? undefined : "var(--lavender)" }}>
            <div style={{ fontSize: 13 }}>
              {m.nom}
              <span style={{ display: "block", fontSize: 11.5, color: "var(--ink-soft)" }}>{m.email}</span>
            </div>
            <div style={{ fontSize: 12.5 }}>{m.sujet}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{m.message}</div>
            <div>
              <span className={`status-badge ${m.read ? "masque" : "actif"}`}>{m.read ? "Lu" : "Nouveau"}</span>
            </div>
            <div className="item-actions">
              {!m.read && (
                <form action={markContactRead}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit">Marquer lu</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {(count ?? 0) > 0 && <Pagination page={page} perPage={perPage} total={count ?? 0} basePath="/admin/messages" />}
    </>
  );
}
