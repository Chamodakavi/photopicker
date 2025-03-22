import { Metadata } from "next";

interface PageProps {
  searchParams: { img?: string };
}

// 🏆 Fix: Properly define `PageProps` for searchParams
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const imageUrl = searchParams.img || "";

  return {
    title: "Check out this photo!",
    description: "Photo shared from our app!",
    openGraph: {
      title: "Check out this photo!",
      description: "Photo shared from our app!",
      images: imageUrl ? [imageUrl] : [],
      url: `https://photopicker-three.vercel.app/share?img=${encodeURIComponent(
        imageUrl
      )}`,
    },
  };
}

export default function SharePage({ searchParams }: PageProps) {
  const img = searchParams.img;

  if (!img) {
    return <p>No image to share.</p>;
  }

  return (
    <div>
      <p>Sharing image...</p>
      <img src={img} alt="Shared content" width="500" />
    </div>
  );
}
