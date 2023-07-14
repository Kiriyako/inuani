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
              primaryColor: "rgb(255, 156, 181)",
            },
            controlBar: { back: "fullscreen" },
            icons: {},
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

        playerInstance.context.ui.menu.register({
          name: "QUALITY",
          children: watchData.sources.map((source) => ({
            name: source.quality,
            default: source.quality === "default",
            value: source.url,
          })),
          onChange({ name, value }, elm) {
            elm.innerText = name;
            setSelectedQuality(name);
            setVideoSource(value);
            playerInstance.changeSource({ src: value });
          },
        });

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
