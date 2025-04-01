import Link from "next/link";

export default async function Page() {
  async function getAnimeData() {
    const res = await fetch(
      `https://api-consumet-org-gamma-sage.vercel.app/meta/anilist/top`,
      { cache: "no-store" }
    );
    const rawData = await res.json();

    // Transform the API response to match the expected format
    const transformedData = {
      results: rawData.results.map((anime) => ({
        id: anime.id, // Keeping ID as is
        title: anime.title.english || anime.title.romaji || anime.title.native, // Prioritizing English title, then Romaji, then Native
        image: anime.image // Using the provided image
      }))
    };

    return transformedData;
  }

  const data = await getAnimeData();

  return (
    <div id="front">
      <div id="animegrid">
        {data.results.map((anime) => (
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
        ))}
      </div>
    </div>
  );
}
