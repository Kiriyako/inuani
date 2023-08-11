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

  let title = aniData.title.romaji;
  let description = 'A site to watch anime';

  if (matchingEpisode) {
    title = `Watch ${aniData.title.romaji} Episode ${matchingEpisode.number}: ${matchingEpisode.title}`;
    description = matchingEpisode.description || description;
  }

  return {
    title: title,
    description: description,
  };
  
};  export default function layout({ children }) {
  return <div>{children}</div>;
}
