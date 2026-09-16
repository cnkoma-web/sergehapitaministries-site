import type { Metadata } from "next";
import { getVideos } from "@/lib/content/videos";
import VideoGrid from "@/components/videos/VideoGrid";
import Footer from "@/components/layout/Footer";

const title = "Vidéos | Serge Hapita Ministries";
const description = "Enseignements, exhortations et ressources vidéo de Serge Hapita Ministries.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/videos" },
  openGraph: { type: "website", title, description, url: "/videos", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

// RECONSTRUCTION (chantier Vidéos, mise en conformité, 16/09) — source de
// vérité : maquettes-complementaires-shm/videos.html. getVideos()/VideoGrid
// existaient déjà, complets et fonctionnels, mais n'avaient jamais été
// branchés ici (retour du 05/09 : page volontairement remplacée par un
// message d'attente). Rebranchés : la table videos est actuellement vide en
// production, VideoGrid affiche alors honnêtement un état vide générique
// (jamais de cartes fictives — voir VideoGrid.tsx).
export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <div className="v2-videos-page">
      <section className="v2-video-hero">
        <div className="v2-complementary-wrap">
          <p className="v2-eyebrow light">
            <span /> Médias
          </p>
          <h1>Vidéos</h1>
          <p>{description}</p>
        </div>
      </section>

      <section className="v2-video-section">
        <div className="v2-complementary-wrap">
          <div className="v2-video-head">
            <div>
              <p className="v2-eyebrow">
                <span /> À regarder
              </p>
              <h2>Dernières vidéos</h2>
            </div>
          </div>

          <VideoGrid videos={videos} />
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
