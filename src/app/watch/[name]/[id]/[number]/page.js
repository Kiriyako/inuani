"use client";
import { useEffect, useState } from "react";
import Player from "@oplayer/core";
import ui from "@oplayer/ui";
import hls from "@oplayer/hls";
import Link from "next/link";

export default function AnimePage({ params }) {
  const anime = params.name;
  const watch = params.id;
  const slug = params.number;
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
          `${process.env.NEXT_PUBLIC_ANIME_WATCH_API_URL}/api/v2/hianime/episode/sources?animeEpisodeId=${watch}?ep=${slug}&category=${category}&server=hd-2`,
          { cache: "no-store" }
        );
        const episodeData = await episodeRes.json();

        const animeRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/anime/info/${anime}`,
          { cache: "no-store" }
        );
        const animeData = await animeRes.json();

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
      source: { src: videoSource, type: "hls" },
      videoAttr: {},
    }).use([
      ui({
        theme: { primaryColor: "rgb(231 170 227)" },
        controlBar: { back: "always" },
        icons: {
          play: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
          pause: `<svg viewBox="0 0 24 24" fill="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>`,
          volume: [
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`
          ],
        },
      }),
      hls({ forceHLS: true, autoQuality: true }),
    ]);

    newPlayer.create();

    if (episodes.sources && episodes.sources.length > 0) {
      // Using the proxy URL for the m3u8 source
      const proxiedUrl = `https://gogoanime-and-hianime-proxy-nn.vercel.app/m3u8-proxy?url=${encodeURIComponent(
        episodes.sources[0].url
      )}`;

      // Log the proxied m3u8 URL to the console
      console.log("Proxied m3u8 Source:", proxiedUrl);

      // Extract subtitles from the API response, making sure the structure is correct
      const subtitleTracks = episodes.tracks
        ? episodes.tracks
            .filter(track => track.kind === "captions") // Only get caption tracks
            .map((sub) => ({
                kind: "subtitles",
                src: sub.file,
                srclang: sub.label.toLowerCase() || "en", // Default to English if no label is found
                label: sub.label || "English", // Default to "English"
                default: sub.default || false,
              }))
        : [];

      setVideoSource(proxiedUrl);
      newPlayer.changeSource({
        src: proxiedUrl,
        tracks: subtitleTracks,
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
