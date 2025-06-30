"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function AnimePage({ params }) {
  const anime = params.name;
  const watch = params.id;
  const slug = params.number;
  const [animeData, setAnimeData] = useState(null);
  const [category, setCategory] = useState("sub");
  const scrollRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://hianime-mapper-ten.vercel.app/anime/info/${anime}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        const episodes = json.data.episodesList.map((ep) => ({
          id: ep.id.split("?")[0],
          number: ep.number,
          episodeId: ep.episodeId,
          title: ep.title || "Untitled",
        }));

        setAnimeData({
          id: json.data.idMal.toString(),
          title: json.data.title.userPreferred,
          image: json.data.coverImage.extraLarge,
          status: json.data.status,
          type: json.data.format,
          genres: json.data.genres,
          description: json.data.description,
          totalEpisodes: json.data.episodes,
          episodes,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData();
  }, [anime]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [animeData]);

  if (!animeData) return <div>Now Loading...</div>;

  const currentEpisode = animeData.episodes.find(
    (ep) => ep.episodeId.toString() === slug.toString()
  );

  const generateIframeSrc = () => {
    return `https://aniteams-player-livid.vercel.app/?id=${watch}?ep=${slug}&category=${category}`;
  };

  return (
    <div id="main">


      <iframe
        src={generateIframeSrc()}
        style={{
          width: "100%",
          height: "500px",
          aspectRatio: "16/9",
          border: "none",
        }}
        frameBorder="0"
        allowFullScreen
      ></iframe>

      <div id="episodeHeader">
        <h1 className="ep-number">
          Episode {currentEpisode ? currentEpisode.number : "Unknown"}
        </h1>
        <h2 className="ep-title">{currentEpisode?.title || "Untitled"}</h2>
        <p className="ep-anime">
          <Link href={`/anime/${animeData.id}`}>{animeData.title}</Link>
        </p>
      </div>

      <div id="episodes">
        <h2>Episodes ({animeData.totalEpisodes})</h2>
        <div id="episodelist" className="scroll-x" ref={scrollRef}>
          {animeData.episodes.map((ep) => (
            <div className="episode-box" key={`${ep.id}-${ep.number}`}>
              <Link
                href={`/watch/${anime}/${ep.id}/${ep.episodeId}`}
                rel="noopener noreferrer"
              >
                <h2 className="episode-title">{ep.number}</h2>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
