import Link from "next/link";

export default async function Page() {
  async function getAnimeData() {
    const res = await fetch(
      `https://api-consumet-org-gamma-sage.vercel.app/anime/gogoanime/top-airing`,
      { cache: "no-store" }
    );
    return res.json();
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
