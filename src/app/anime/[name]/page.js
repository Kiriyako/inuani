"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AnimePage() {
  const { name: anime } = useParams(); // ✅ safely gets [name] route param
  const [data, setData] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!anime) return;

    fetch(`https://hianime-mapper-ten.vercel.app/anime/info/${anime}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const episodesList = Array.isArray(data.data.episodesList)
          ? data.data.episodesList
          : [];

        const transformed = {
          id: data.data.id?.toString(),
          title: data.data.title?.userPreferred || data.data.title?.english || "Untitled",
          image: data.data.coverImage?.large || "",
          banner: data.data.bannerImage || "",
          status: data.data.status || "Unknown",
          type: data.data.format || "Unknown",
          genres: data.data.genres || [],
          description: data.data.description || "No description",
          totalEpisodes: data.data.episodes || 0,
          episodes: episodesList.map((ep) => ({
            id: ep.id?.split("?")[0],
            number: ep.number,
            param: ep.episodeId,
          })),
        };

        setData(transformed);
      })
      .catch((err) => console.error("Fetch error:", err));
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
  }, [data]);

  if (!data) return <p>Loading...</p>;

  return (
    <div id="animeInfo">
      {data.banner && (
        <div id="banner">
          <img
            src={data.banner}
            alt={`${data.title} Banner`}
            style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }}
          />
        </div>
      )}

      <div id="i1">
        <div id="image">
          <img width={250} height={350} alt={data.title} src={data.image} />
        </div>
        <div id="info">
          <h2>{data.title}</h2>
          <h2>
            {data.status} | {data.type} | {data.genres.join(", ")}
          </h2>
          <div
            id="descriptionContainer"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <h2
              dangerouslySetInnerHTML={{
                __html: data.description,
              }}
            ></h2>
          </div>
        </div>
      </div>

      <div id="episodes">
        <h2>Episodes ({data.totalEpisodes})</h2>
        <div id="episodelist" className="scroll-x" ref={scrollRef}>
          {data.episodes.map((ep) => (
            <div className="episode-box" key={`${ep.id}-${ep.number}`}>
              <Link
                href={`/watch/${anime}/${ep.id}/${ep.param}`}
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
