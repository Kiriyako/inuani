"use client";
import { useEffect, useState, useRef } from "react";
import Player from "@oplayer/core";
import ui from "@oplayer/ui";
import hls from "@oplayer/hls";
import Image from "next/image";
import Link from "next/link";

export default function AnimePage({ params }) {
  const anime = params.name;
  const watch = params.id;
  const [episodes, setEpisodes] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState("");
  const [matchingTitle, setMatchingTitle] = useState("");
  const [matchingEpisodeNumber, setMatchingEpisodeNumber] = useState("");
  const [aniData, setAniData] = useState(null);
  const [videoSource, setVideoSource] = useState("");
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    async function getEpisodeData() {
      const res = await fetch(
        `https://api.enime.moe/anime/${encodeURIComponent(anime)}/episodes`,
        { cache: "no-store" }
      );
      const data = await res.json();
      return data;
    }

    async function getEpisodeWatch() {
      const res = await fetch(
        `https://api.consumet.org/anime/enime/watch?episodeId=${encodeURIComponent(
          watch
        )}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      return data;
    }

    async function getAniData() {
      const res = await fetch(
        `https://api.enime.moe/anime/${encodeURIComponent(anime)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      return data;
    }

    Promise.all([getEpisodeData(), getEpisodeWatch(), getAniData()]).then(
      ([episodeData, watchData, aniData]) => {
        console.log(episodeData);
        console.log(watchData);
        console.log(aniData);

        setEpisodes(episodeData);
        setAniData(aniData);
        setMatchingTitle(episodeData[0]?.title || "");
        setMatchingEpisodeNumber(episodeData[0]?.number || "");

        const playerInstance = Player.make("#app", {
          isLive: true,
          source: {
            src: "", 
            title: matchingTitle,
          },
        });

        playerInstance.use([
          ui({
            theme: {
              primaryColor: "rgb(64, 179, 255)",
            },
            controlBar: { back: "fullscreen" },
            icons: {
              play: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
              pause: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>`,
              volume: [
                `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
                `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`
              ],
              fullscreen: [
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>`,
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>`
              ],
              loop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-repeat-2"><path d="m2 9 3-3 3 3"/><path d="M13 18H7a2 2 0 0 1-2-2V6"/><path d="m22 15-3 3-3-3"/><path d="M11 6h6a2 2 0 0 1 2 2v10"/></svg>`,
              playbackRate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gauge"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>`,
            },
            keyboard: { focused: true, global: false },
            showControls: "always",
            miniProgressBar: true,
            slideToSeek: "always",
            screenshot: true,
            autoFocus: true,
            forceLandscapeOnFullscreen: true,
            progressIndicator: true,
          }),
          hls({ forceHLS: true }),
        ]);

        playerInstance.create();
        playerRef.current = playerInstance;

       

        const matchingEpisode = episodeData.find((ep) => ep.id === watch);
        if (matchingEpisode) {
          setMatchingTitle(matchingEpisode.title);
          setMatchingEpisodeNumber(matchingEpisode.number);
          if (watchData.sources && watchData.sources.length > 0) {
            setVideoSource(watchData.sources[watchData.sources.length - 1].url);
            playerInstance.changeSource({ src: watchData.sources[watchData.sources.length - 1].url });
          }
        }

        setIsPlayerReady(true);
      }
    );

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy(); 
      }
    };
  }, [params]);

  return (
    <div id="main">
      <div id="app"></div>
      {isPlayerReady && (
        <>
          {matchingEpisodeNumber && (
            <h2>
              Watching{" "}
              <Link href={`/anime/${aniData.id}`}>{aniData.title.romaji}</Link>{" "}
              Episode {matchingEpisodeNumber}: {matchingTitle}
            </h2>
          )}
          <div id="episodes">
            <h2>Episodes</h2>
            <div className="episodelist-container">
              <div id="episodelist" className="scroll-x">
                {episodes.map((ep) => (
                  <div className="episode" key={ep.id}>
                    <Link href={`/watch/${anime}/${ep.id}`}>
                      <Image
                        width={350}
                        height={200}
                        alt={ep.title}
                        src={
                          ep.image ||
                          aniData.bannerImage ||
                          aniData.coverImage
                        }
                      />
                      <h2 className="episode-title">
                        Ep. {ep.number}: {ep.title || "Untitled"}
                      </h2>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
