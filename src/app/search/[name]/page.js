import Link from "next/link";

export default async function Search({ params }) {
  const query = decodeURIComponent(params.name);

  async function getSearchData() {
    const res = await fetch(`https://api.enime.moe/search/${encodeURIComponent(query)}`, { cache: 'no-store' });
    return res.json();
  }

  const data = await getSearchData();
  const hasData = data && data.data && Array.isArray(data.data) && data.data.length > 0;

  return (
    <div style={{margin: 30}}id="animegrid">
      {hasData ? (
        data.data.map((anime) => (
          <Link href={`/anime/${anime.id}`} key={anime.id}>
            <div id="anime">
              <img width="250" height="350" alt={anime.title.romaji} src={anime.coverImage} />
              <h2 style={{ color: anime.color }}>{anime.title.romaji}</h2>
            </div>
          </Link>
        ))
      ) : (
        <div>No results found</div>
      )}
    </div>
  );
}
