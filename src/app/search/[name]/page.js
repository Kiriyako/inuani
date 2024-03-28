import Link from "next/link";

export default async function Search({ params }) {
  const query = decodeURIComponent(params.name);

  async function getSearchData() {
    const res = await fetch(
      `https://api-consumet-org-gamma-sage.vercel.app/anime/gogoanime/${encodeURIComponent(query)}`,
      { cache: "no-store" }
    );
    return res.json();
  }

  const data = await getSearchData();
  const hasData =
    data &&
    data.results &&
    Array.isArray(data.results) &&
    data.results.length > 0;

  return (
    <div style={{ margin: 30 }} id="animegrid">
      {hasData ? (
        data.results.map((anime) => (
          <Link href={`/anime/${anime.id}`} key={anime.id}>
            <div id="anime">
              <img
                width="250"
                height="350"
                alt={anime.title}
                src={anime.image}
              />
              <h2>{anime.title}</h2>
            </div>
          </Link>
        ))
      ) : (
        <div>No results found</div>
      )}
    </div>
  );
}
