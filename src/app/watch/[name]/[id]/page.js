"use client"
import { useEffect, useState } from "react";
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
        console.log(aniData)

        setEpisodes(episodeData);
        setAniData(aniData);

        const player = Player.make("#app", {
          isLive: true,
          source: {
            src: `${watchData.sources[3].url}`,
          },
        });

        player.use([
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

        player.create();

        player.context.ui.menu.register({
          name: "QUALITY",
          children: watchData.sources.map((source) => ({
            name: source.quality,
            default: source.quality === "default",
            value: source.url,
          })),
          onChange({ name, value }, elm) {
            elm.innerText = name;
            setSelectedQuality(name);
            player.changeSource({ src: value });
          },
        });

        const matchingEpisode = episodeData.find((ep) => ep.id === watch);
        if (matchingEpisode) {
          setMatchingTitle(matchingEpisode.title);
          setMatchingEpisodeNumber(matchingEpisode.number);
        }
      }
    );
  }, [params]);

  return (
    <div id="main">
      <div id="app"></div>
      {matchingEpisodeNumber && (
        <h2>
          Watching {aniData.title.romaji} Episode {matchingEpisodeNumber}: {matchingTitle}
        </h2>
      )}
      <div id="episodes">
        <h2>Episodes</h2>
        <div className="episodelist-container">
          <div id="episodelist" className="scroll-x">
            {episodes.map((ep) => (
              <div className="episode" key={ep.id}>
                <Link href={`/watch/${anime}/${ep.id}`} key={ep.id}>
                  <Image width="350" height="200" alt={ep.title} src={ep.image || aniData.bannerImage} />
                  <h2 className="episode-title">
                    Ep. {ep.number}: {ep.title}
                  </h2>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedQuality && <p>Selected Quality: {selectedQuality}</p>}
    </div>
  );
}
