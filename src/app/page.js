import Link from "next/link";

export default async function Page() {
  async function getAnimeData() {
    const res = await fetch(
      `https://api-consumet-org-gamma-sage.vercel.app/anime/gogoanime/top-airing`,
      { cache: "no-store" }
    );
    return res.json();
  }

  function capitalizeWords(string) {
    return string
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const data = await getAnimeData();

  return (
    <div id="front">
      <div id="animegrid">
        {data.results.map((anime) => {
          const title = anime.title || capitalizeWords(anime.id);
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
