"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AnimePage({ params }) {
  const anime = params.name;
  const watch = params.id;
  const slug = params.number;
  const [animeData, setAnimeData] = useState(null);
  const [category, setCategory] = useState("sub");

  // Function to find the episode number based on the slug
  const findEpisodeNumber = (episodeId) => {
    const episode = animeData?.episodes.find((ep) => {
      // Extract the `ep` parameter from the episode `id` URL and match it with the slug
      const episodeMatch = ep.id.split("?ep=")[1]; // Split the ID and get the part after `?ep=`
      return episodeMatch === episodeId;
    });
    return episode ? episode.number : "Unknown";
  };

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching anime data...");
        // Fetch anime data
        const animeRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/anime/info/${anime}`,
          { cache: "no-store" }
        );
        const animeData = await animeRes.json();

        console.log("Anime Data Fetched:", animeData);
        const transformedData = {
          id: animeData.data.idMal.toString(),
          title: animeData.data.title.userPreferred,
          image: animeData.data.coverImage.extraLarge,
          status: animeData.data.status,
          type: animeData.data.format,
          genres: animeData.data.genres,
          description: animeData.data.description,
          totalEpisodes: animeData.data.episodes,
          episodes: animeData.data.episodesList.map((ep) => ({
            id: ep.id.split('?')[0], // Extract the part before the '?'
            number: ep.number,
            episodeId: ep.episodeId,
          })),
        };

        setAnimeData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [anime]);

  if (!animeData) {
    return <div>Now Loading...</div>;
  }

  // Function to generate iframe source based on category and episode number
  const generateIframeSrc = () => {
    return `https://aniteams-player.vercel.app?id=${watch}?ep=${slug}&category=${category}`;
  };

  return (
    <div id="main">
      {/* Button to switch between sub and dub */}
      <button onClick={() => setCategory(category === "sub" ? "dub" : "sub")}>
        {category === "sub" ? "Switch to Dub" : "Switch to Sub"}
      </button>

      {/* Embed the iframe with dynamic source */}
     <iframe
  src={generateIframeSrc()}
  style={{
    width: '100%',
    height: '500px',
    aspectRatio: '16/9',
    border: 'none', // optional, to remove border
  }}
  frameBorder="0"
  allowFullScreen
></iframe>


      <text id="animetitle">Episode {findEpisodeNumber(slug)}</text>
      <br />
      <text id="episodetitle">
        <Link href={`/anime/${animeData.id}`}>{animeData.title}</Link>
      </text>
      <div id="episodes">
        <h2>Episodes ({animeData.totalEpisodes})</h2>
        <div className="episodelist-container">
          <div id="episodelist" className="scroll-x">
            {animeData.episodes.map((ep) => (
              <div className="episode-box" key={ep.id}>
                <Link href={`/watch/${anime}/${ep.id}/${ep.episodeId}`} rel="noopener noreferrer">
                  <h2 className="episode-title">{ep.number}</h2>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
