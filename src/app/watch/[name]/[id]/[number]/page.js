"use client";
import { useEffect, useState } from "react";
import Player from "@oplayer/core";
import ui from "@oplayer/ui";
import hls from "@oplayer/hls";
import Link from "next/link";

// Helper function to apply video source and subtitles
const applyVideoSourceAndSubtitles = (player, proxiedUrl, subtitleTracks) => {
  console.log("applyVideoSourceAndSubtitles called");

  if (!player || !proxiedUrl || !subtitleTracks) {
    console.error("Player, proxiedUrl, or subtitleTracks data is missing");
    return;
  }

  console.log("Proxied Video Source:", proxiedUrl);
  console.log("Subtitle Tracks:", subtitleTracks);

  // Apply the source and subtitle tracks to the player
  player.changeSource({
    src: proxiedUrl,
    tracks: subtitleTracks,
  });

  console.log("Video source and subtitles applied.");
};

export default function AnimePage({ params }) {
  const anime = params.name;
  const watch = params.id;
  const slug = params.number;
  const [episodes, setEpisodes] = useState([]);
  const [animeData, setAnimeData] = useState(null);
  const [videoSource, setVideoSource] = useState("");
  const [player, setPlayer] = useState(null);
  const [category, setCategory] = useState("sub");
  const [isPlayerReady, setIsPlayerReady] = useState(false); // Flag to check player readiness

  const findEpisodeNumber = (episodeId) => {
    const episode = animeData?.episodes.find((ep) => ep.id === episodeId);
    return episode ? episode.number : "Unknown";
  };

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching episode data...");
        // Fetch episode data
        const episodeRes = await fetch(
          `${process.env.NEXT_PUBLIC_ANIME_WATCH_API_URL}/api/v2/hianime/episode/sources?animeEpisodeId=${watch}?ep=${slug}&category=${category}&server=hd-2`,
          { cache: "no-store" }
        );
        const episodeData = await episodeRes.json();
        console.log("Episode Data Fetched:", episodeData);

        // Fetch anime data
        const animeRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/anime/info/${anime}`,
          { cache: "no-store" }
        );
        const animeData = await animeRes.json();
        console.log("Anime Data Fetched:", animeData);

        // Transform the data into a usable format
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

        // Set state with fetched data
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
    console.log("useEffect triggered. Anime Data:", animeData);
    console.log("Episodes:", episodes);

    if (!animeData || episodes.length === 0) {
      console.error("No anime data or episodes found.");
      return;
    }

    // Fetch video source and captions
    const fetchVideoData = async () => {
      console.log("Fetching video source and captions...");

      // Wait until we get the video source and caption data
      const episodeSource = episodes.sources && episodes.sources[0] ? episodes.sources[0].url : null;
      const episodeTracks = episodes.tracks || [];

      if (episodeSource) {
        console.log("Raw Video Source URL:", episodeSource); // Log the raw source

        // Proxy the video source URL
        const proxiedUrl = `https://gogoanime-and-hianime-proxy-nn.vercel.app/m3u8-proxy?url=${encodeURIComponent(episodeSource)}`;
        console.log("Proxied Video Source URL:", proxiedUrl); // Log the proxied URL

        setVideoSource(proxiedUrl); // Set video source state

        // Create subtitle tracks
        const subtitleTracks = episodeTracks.map((track) => ({
          kind: "subtitles",
          src: track.file,
          srclang: track.label.toLowerCase() || "en",
          label: track.label || "English",
          default: track.default || false,
        }));

        console.log("Subtitle Tracks:", subtitleTracks);

        // Initialize the player now that everything is ready
        if (player) {
          console.log("Initializing Player with Source and Captions...");
          applyVideoSourceAndSubtitles(player, proxiedUrl, subtitleTracks);
          setIsPlayerReady(true); // Mark the player as ready
        } else {
          console.error("Player is not initialized yet.");
        }
      } else {
        console.error("No episode source found.");
      }
    };

    // Only call fetchVideoData if the anime data and episodes are available
    if (animeData && episodes.length > 0) {
      fetchVideoData();
    }

  }, [animeData, episodes, player]);

  useEffect(() => {
    console.log("Initializing the player...");
    if (!document.getElementById("app")) {
      console.error("The #app element doesn't exist in the DOM.");
      return;
    }

    // Initialize player only when everything is ready
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

    console.log("Player Initialized:", newPlayer);

    newPlayer.create();
    setPlayer(newPlayer);

    return () => {
      if (newPlayer && typeof newPlayer.destroy === "function") {
        newPlayer.destroy();
      }
    };
  }, [videoSource]);

  if (!animeData) {
    return <div>Now Loading...</div>;
  }

  return (
    <div id="main">
      <button onClick={() => setCategory(category === "sub" ? "dub" : "sub")}>
        {category === "sub" ? "Switch to Dub" : "Switch to Sub"}
      </button>
      <div id="app"></div> {/* Ensure this element is here before initialization */}
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
