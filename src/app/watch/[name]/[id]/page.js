"use client";
import { useEffect, useState } from "react";
import Player from "@oplayer/core";
import ui from "@oplayer/ui";
import hls from "@oplayer/hls";
import Link from "next/link";

export default function AnimePage({ params }) {
  const animeSlugWithId = params.id; 
  const [animeSlug, setAnimeSlug] = useState("");
  const [episodeId, setEpisodeId] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [animeData, setAnimeData] = useState(null);
  const [videoSource, setVideoSource] = useState("");
  const [player, setPlayer] = useState(null);
  const [category, setCategory] = useState("sub");

  // Extract anime slug and episode ID
  useEffect(() => {
    if (!animeSlugWithId.includes("?ep=")) return;
    const [slug, queryString] = animeSlugWithId.split("?ep=");
    setAnimeSlug(slug);
    setEpisodeId(queryString);
  }, [animeSlugWithId]);

  const findEpisodeNumber = (episodeId) => {
    const episode = animeData?.episodes.find((ep) => ep.id === episodeId);
    return episode ? episode.number : "Unknown";
  };

  useEffect(() => {
    if (!animeSlug || !episodeId) return;

    async function fetchData() {
      try {
        const episodeRes = await fetch(
          `${process.env.NEXT_PUBLIC_ANIME_WATCH_API_URL}/api/v2/hianime/episode/sources?animeEpisodeId=${episodeId}&category=${category}&server=hd-2`,
          { cache: "no-store" }
        );
        const episodeData = await episodeRes.json();

        const animeRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/anime/info/${animeSlug}`,
          { cache: "no-store" }
        );
        const animeData = await animeRes.json();

        // Transform the API response
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
            id: ep.id,
            number: ep.number,
            url: `https://example.com/${animeSlug}/${ep.id}`, 
          })),
        };

        setEpisodes(episodeData);
        setAnimeData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();

    return () => {
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    };
  }, [animeSlug, episodeId, category]);

  useEffect(() => {
    if (!animeData || episodes.length === 0) return;

    const newPlayer = Player.make("#app", {
      source: { src: videoSource },
      defaultQuality: "1080p",
      videoAttr: {},
    }).use([
      ui({
        theme: {
          primaryColor: "rgb(231 170 227)",
        },
        controlBar: { back: "always" },
      }),
      hls({ forceHLS: true }),
    ]);

    newPlayer.create();

    if (episodes.sources && episodes.sources.length > 0) {
      const proxiedUrl = `https://gogoanime-and-hianime-proxy-nn.vercel.app/m3u8-proxy?url=${encodeURIComponent(
        episodes.sources[episodes.sources.length - 1].url
      )}`;

      setVideoSource(proxiedUrl);
      newPlayer.changeSource({
        src: proxiedUrl,
      });
    }

    setPlayer(newPlayer);

    return () => {
      if (newPlayer && typeof newPlayer.destroy === "function") {
        newPlayer.destroy();
      };
    };
  }, [animeData, episodes]);

  if (!animeData) {
    return <div>Now Loading...</div>;
  }

  return (
    <div id="main">
      <button onClick={() => setCategory(category === "sub" ? "dub" : "sub")}>
        {category === "sub" ? "Switch to Dub" : "Switch to Sub"}
      </button>
      <div id="app"></div>
      <text id="animetitle">Episode {findEpisodeNumber(episodeId)}</text>
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
                <Link href={`/watch/${animeSlug}?ep=${ep.id}`} rel="noopener noreferrer">
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
