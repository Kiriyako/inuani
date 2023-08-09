export const generateMetadata = async ({ params }) => {
  const anime = params.name;

  const response = await fetch(`https://api.enime.moe/anime/${encodeURIComponent(anime)}`);
  const data = await response.json();

  return {
    title: data.title.romaji,
    description: data.description,
  };
};

  export default function layout({ children }) {
    return <div>{children}</div>;
  }