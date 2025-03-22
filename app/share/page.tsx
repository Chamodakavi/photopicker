// @ts-nocheck

import { Metadata } from "next";

// Correctly define Props type
type Props = {
  searchParams: { img?: string };
};

// Ensure metadata is correctly generated on the server
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const imageUrl = searchParams?.img || "";

  return {
    title: "Check out this photo!",
    description: "Photo shared from our app!",
    openGraph: {
      title: "Check out this photo!",
      description: "Photo shared from our app!",
      images: imageUrl ? [{ url: imageUrl }] : [],
      url: `https://photopicker-three.vercel.app/share?img=${encodeURIComponent(
        imageUrl
      )}`,
    },
  };
}

// The main SharePage component
export default function SharePage({ searchParams }: Props) {
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
