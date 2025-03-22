// @ts-nocheck

import { Metadata } from "next";

// Correctly define Props type
type Props = any;

// Ensure metadata is correctly generated on the server
export async function generateMetadata({
  searchParams,
}: any): Promise<Metadata> {
  const imageUrl = searchParams?.img || "";

  return {
    title: " ",
    description: " ",
    openGraph: {
      type: "website", // ✅ Required for proper rendering
      title: " ",
      description: " ",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
      url: `https://photopicker-three.vercel.app/share?img=${encodeURIComponent(
        imageUrl
      )}`,
    },
    other: {
      "fb:app_id": "1241610474056459", // ✅ Required for some Facebook previews
    },
  };
}

export default function SharePage({ searchParams }: any) {
  const img = searchParams?.img;

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
