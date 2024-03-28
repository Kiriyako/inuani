"use client";
import React, { useState, useEffect } from "react";

export default function AnimePage({ params }) {
  const anime = params.name;

  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`https://api-consumet-org-gamma-sage.vercel.app/anime/gogoanime/info/${anime}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) {
    return null;
  }

  return (
    <div id="animeInfo">
      <div id="i1">
        <div id="image">
          <img width={250} height={350} alt={data.title} src={data.image} />
        </div>
        <div id="info">
          <h2>{data.title}</h2>
          <h2>
            {data.status} | {data.type} | {data.genres.join(", ")}
          </h2>
          <div id="descriptionContainer" style={{ maxHeight: '200px', overflowY: 'auto' }}>
        <h2
          dangerouslySetInnerHTML={{
            __html: data.description || "No description available",
          }}
        ></h2>
      </div>
        </div>
      </div>
      <div id="episodes">
        <h2>Episodes ({data.totalEpisodes})</h2>
        <div className="episodelist-container">
          <div id="episodelist" className="scroll-x">
            {data.episodes.map((ep) => (
              <div className="episode-box" key={ep.id}>
                <a href={`/watch/${anime}/${ep.id}`} rel="noopener noreferrer">
                  <h2 className="episode-title">{ep.number}</h2>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
