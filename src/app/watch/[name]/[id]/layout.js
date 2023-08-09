export const generateMetadata = async ({ params }) => {
  const anime = params.name;
  const watch = params.id;

  const [episodeData, aniData] = await Promise.all([
    fetch(`https://api.enime.moe/anime/${encodeURIComponent(anime)}/episodes`, { cache: 'no-store' })
      .then((res) => res.json()),
    fetch(`https://api.enime.moe/anime/${encodeURIComponent(anime)}`, { cache: 'no-store' })
      .then((res) => res.json())
  ]);

  const matchingEpisode = episodeData.find((ep) => ep.id === watch);

  const title = matchingEpisode
    ? `Episode ${matchingEpisode.number}: ${matchingEpisode.title} - ${aniData.title.romaji}`
    : aniData.title.romaji;

  return {
    title: title,
  };
};

  export default function layout({ children }) {
    return <div>{children}</div>;
  }