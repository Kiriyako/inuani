import Link from 'next/link';
import Image from 'next/image';

export default async function AnimePage({ params }) {
  const anime = params.name;

  async function getAnimeData() {
    const res = await fetch(`https://api.enime.moe/anime/${encodeURIComponent(anime)}`, { cache: 'no-store' });
    return res.json();
  }

  async function getEpisodeData() {
    const res = await fetch(`https://api.enime.moe/anime/${encodeURIComponent(anime)}/episodes`, { cache: 'no-store' });
    return res.json();
  }

  const data = await getAnimeData();
  const rate = data.averageScore;
  const scale = parseInt(rate / 20);

  const episodes = await getEpisodeData();

  return (
    <div id="animeInfo">
      <div id="i1">
        <div id="image">
          <img width="250" height="350" alt={data.title.romaji} src={data.coverImage} />
        </div>
        <div id="info">
          <h2>{data.title.romaji}</h2>
          <h2>
            {data.status} | {data.season} {data.year} |{' '}
            <svg
              stroke="currentColor"
              className="star"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 1024 1024"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"></path>
            </svg>{' '}
            <text className="scaleRating">{scale}</text>{' '}
          </h2>
          <div id="descriptionContainer">
            <h2 dangerouslySetInnerHTML={{ __html: data.description }}></h2>
          </div>
        </div>
      </div>
      <div id="episodes">
        <h2>Episodes</h2>
        <div className="episodelist-container">
          <div id="episodelist" className="scroll-x">
            {episodes.map((ep) => (
              <div className="episode" key={ep.id}>
                <Link href={`/watch/${anime}/${ep.id}`}>
                  <Image width="350" height="200" alt={ep.title} src={ep.image} />
                  <h2 className="episode-title">Ep. {ep.number}: {ep.title}</h2>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}