import Link from 'next/link';

export default async function Page() {
  async function getAnimeData() {
    const res = await fetch(`https://api.enime.moe/popular`, { cache: 'no-store' });
    return res.json();
  }
  async function getRecentAnimeData() {
    const res = await fetch('https://api.enime.moe/recent', { cache: 'no-store' });
    return res.json();
  }

  const data = await getAnimeData();
  const recentData = await getRecentAnimeData();

  return (
    <div id="front">
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
      <br />
      <div id="episodes">
        <h1>Recent Episodes</h1>
        <div className="episodelist-container">
          <div id="episodelistt" className="scroll-x">
            {recentData.data.map((recent) => (
              !recent.image ? null : (
                <div className="episode" key={recent.Id}>
                  <Link href={`/watch/${recent.animeId}/${recent.id}`}>
                    <div id="anime">
                      <img width="270" height="150" alt={recent.title} src={recent.image} />
                      <h2 style={{ color: recent.anime.color, fontSize: 24, marginBottom: 1 }}>{recent.anime.title.romaji}</h2>
                      <h2 style={{ color: recent.anime.color, fontSize: 22, marginTop: 1 }}>{recent.title}</h2>
                    </div>
                  </Link>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
