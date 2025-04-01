"use client";
import { useEffect, useState } from "react";
import Player from "@oplayer/core";
import ui from "@oplayer/ui";
import hls from "@oplayer/hls";
import Link from "next/link";

export default function AnimePage({ params }) {
  const anime = params.name;
  const watch = params.id;
  const [animeSlug, queryString] = params.id.split("?");
const slug = new URLSearchParams(queryString).get("ep");
  const [episodes, setEpisodes] = useState([]);
  const [animeData, setAnimeData] = useState(null);
  const [videoSource, setVideoSource] = useState("");
  const [player, setPlayer] = useState(null);
  const [category, setCategory] = useState("sub");

  const findEpisodeNumber = (episodeId) => {
    const episode = animeData?.episodes.find((ep) => ep.id === episodeId);
    return episode ? episode.number : "Unknown";
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const episodeRes = await fetch(
          `${process.env.NEXT_PUBLIC_ANIME_WATCH_API_URL}/api/v2/hianime/episode/sources?animeEpisodeId${watch}?${slug}&category=${category}&server=hd-2`,
          { cache: "no-store" }
        );
        const episodeData = await episodeRes.json();

        const animeRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/anime/info/${anime}`,
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
            url: `https://example.com/${anime}/${ep.id}`, 
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
  }, [anime, watch, category]);

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
        icons: {
          play: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
          pause: `<svg viewBox="0 0 24 24" fill="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>`,
          volume: [
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`
          ],
        },
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
      }
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
      <text id="animetitle">Episode {findEpisodeNumber(watch)}</text>
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
                <Link href={`/watch/${anime}/${ep.id}`} rel="noopener noreferrer">
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
