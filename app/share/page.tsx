import Head from "next/head";
import { useRouter } from "next/router";

import { GetServerSidePropsContext } from "next";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { img } = context.query;

  if (!img) {
    return {
      notFound: true, // Ensure a proper 404 response if no image is provided
    };
  }

  return {
    props: { img },
  };
}

interface SharePageProps {
  img: string;
}

const SharePage = ({ img }: SharePageProps) => {
  if (!img) {
    return <p>No image to share.</p>;
  }

  return (
    <div>
      <Head>
        <title>Check out this photo!</title>
        <meta property="og:title" content="Check out this photo!" />
        <meta property="og:description" content="Photo shared from our app!" />
        <meta property="og:image" content={img} />
        <meta
          property="og:url"
          content={`https://photopicker-three.vercel.app/share?img=${encodeURIComponent(
            img
          )}`}
        />
      </Head>
      <p>Sharing image...</p>
    </div>
  );
};

export default SharePage;
