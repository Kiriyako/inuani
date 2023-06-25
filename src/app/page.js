import Link from 'next/link';

export default async function Page() {
  async function getAnimeData() {
    const res = await fetch(`https://api.enime.moe/popular`, { cache: 'no-store' });
    return res.json();
  }

  const data = await getAnimeData();
  return (
    <div id="animegrid">
      {data.data.map((anime) => (
        <Link href={`/anime/${anime.id}`} key={anime.id}>
          <div id="anime">
            <img width="250" height="350" alt={anime.title.romaji} src={anime.coverImage} />
            <h2 style={{ color: anime.color }}>{anime.title.romaji}</h2>
          </div>
        </Link>
      ))}
    </div>
  );
}
