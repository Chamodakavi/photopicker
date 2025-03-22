// @ts-nocheck

import { Metadata } from "next";

// Correctly define Props type
type Props = any;

// Ensure metadata is correctly generated on the server
export async function generateMetadata({ searchParams }: any): Promise<any> {
  const imageUrl = searchParams?.img || "";

  return {
    title: "",
    description: "!",
    openGraph: {
      title: "",
      description: "",
      images: imageUrl ? [{ url: imageUrl }] : [],
      url: `https://photopicker-three.vercel.app/share?img=${encodeURIComponent(
        imageUrl
      )}`,
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
