import Head from "next/head";
import { useRouter } from "next/router";

const SharePage = () => {
  const router = useRouter();
  const { img } = router.query;

  if (!img) {
    return <p>No image to share.</p>;
  }

  return (
    <div>
      <Head>
        <title>Check out this photo!</title>
        <meta property="og:title" content="Check out this photo!" />
        <meta property="og:description" content="Photo shared from our app!" />
        <meta
          property="og:image"
          content={Array.isArray(img) ? img[0] : img || ""}
        />
        <meta
          property="og:url"
          content={`https://yourwebsite.com/share?img=${encodeURIComponent(
            Array.isArray(img) ? img[0] : img || ""
          )}`}
        />
      </Head>
      <p>Sharing image...</p>
      {/* You can add more content here if needed */}
    </div>
  );
};

export default SharePage;
