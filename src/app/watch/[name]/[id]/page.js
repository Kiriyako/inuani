"use client";
import { useEffect, useState } from "react";
import Player from "@oplayer/core";
import ui from "@oplayer/ui";
import hls from "@oplayer/hls";
import Link from "next/link";

export default function AnimePage({ params }) {
  const anime = params.name;
  const watch = params.id;
  const [episodes, setEpisodes] = useState([]);
  const [animeData, setAnimeData] = useState(null);
  const [videoSource, setVideoSource] = useState("");
  const [player, setPlayer] = useState(null);

  const findEpisodeNumber = (episodeId) => {
    const episode = animeData?.episodes.find((ep) => ep.id === episodeId);
    return episode ? episode.number : "Unknown";
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const episodeRes = await fetch(`https://api-consumet-org-gamma-sage.vercel.app/anime/gogoanime/watch/${watch}`, { cache: "no const episodeData = await episodeRes.json();
        const animeRes = await fetch(`https://api-consumet-org-gamma-sage.vercel.app/anime/gogoanime/info/${anime}`, { cache: "no-store" });
        const animeData = await animeRes.json();

        setEpisodes(episodeData);
        setAnimeData(animeData);
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
  }, [anime, watch]);

  useEffect(() => {
    if (!animeData || episodes.length === 0) return;

    const newPlayer = Player.make("#app", {
      source: { src: videoSource },
      defaultQuality: "1080p",
      videoAttr: {
        // crossOrigin: "anonymous"
      },
    }).use([
      ui({
        theme: {
          primaryColor: "rgb(231 170 227)",
        },
        controlBar: { back: "always" },
        icons: {
          play: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
          pause: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="4"/></svg>`,
        },
      }),
      hls({ forceHLS: true }),
    ]);

    newPlayer.create();

    // Proxy the video source through the HLS proxy URL
    if (episodes.sources && episodes.sources.length > 0) {
      const originalSource = episodes.sources[episodes.sources.length - 1].url;
      const proxiedSource = `https://gogoanime-and-hianime-proxy.vercel.app/hls-proxy?url=${encodeURIComponent(originalSource)}`;

      setVideoSource(proxiedSource);

      newPlayer.changeSource({
        src: proxiedSource,
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
      <div id="app"></div>
      <text id="animetitle">Episode {findEpisodeNumber(watch)}</text>
      <br></br>
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
                  <h2 className="episode2>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
