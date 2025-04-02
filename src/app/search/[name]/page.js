import Link from "next/link";

export default async function Search({ params }) {
  const query = decodeURIComponent(params.name);

  async function getSearchData() {
    const res = await fetch(
      `https://api-consumet-org-gamma-sage.vercel.app/meta/anilist/${encodeURIComponent(query)}`,
      { cache: "no-store" }
    );
    const data = await res.json();

    
    return {
      results: data.results.map((anime) => ({
        id: anime.id,
        title: anime.title.userPreferred || anime.title.english || anime.title.romaji,
        image: anime.image
      }))
    };
  }

  const data = await getSearchData();
  const hasData =
    data &&
    data.results &&
    Array.isArray(data.results) &&
    data.results.length > 0;

  return (
    <div id="front">
      <div id="animegrid">
        {data.results.map((anime) => {
          const title = anime.title; // Directly use the title from the API
          return (
            <Link href={`/anime/${anime.id}`} key={anime.id}>
              <div id="anime">
                <img
                  width="250"
                  height="350"
                  alt={title}
                  src={anime.image}
                />
                <h2>{title}</h2>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
