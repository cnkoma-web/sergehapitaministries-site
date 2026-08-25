import type { Metadata } from "next";
import { getVideos } from "@/lib/content/videos";
import VideoGrid from "@/components/videos/VideoGrid";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Vidéos | Serge Hapita Ministries";
const description = "Prédications, enseignements et témoignages du ministère.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/videos" },
  openGraph: { type: "website", title, description, url: "/videos", siteName: "Serge Hapita Ministries", locale: "fr_FR", images: ["/assets/og/videos.jpg"] },
  twitter: { card: "summary_large_image", title, description, images: ["/assets/og/videos.jpg"] },
};

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Vidéos</h1>
          <p>{description}</p>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <VideoGrid videos={videos} />
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
