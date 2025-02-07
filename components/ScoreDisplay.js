import { useState } from "react";
import Image from "next/image";

export default function ScoreDisplay({ gameData }) {
  if (!gameData) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-gray-100 rounded-lg shadow-xl overflow-hidden animate-pulse">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-300 rounded-full" />
              <div className="h-4 bg-gray-300 rounded w-24" />
              <div className="h-8 bg-gray-300 rounded w-12" />
            </div>
            <div className="text-center space-y-2">
              <div className="h-6 bg-gray-300 rounded w-32" />
              <div className="h-8 bg-gray-300 rounded w-24" />
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-300 rounded-full" />
              <div className="h-4 bg-gray-300 rounded w-24" />
              <div className="h-8 bg-gray-300 rounded w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    awayTeam,
    homeTeam,
    awayScore,
    homeScore,
    status,
    quarter,
    time,
    awayLogo,
    homeLogo,
    awayColor = "#E31837",
    homeColor = "#004C54",
  } = gameData;

  return (
    <div className="w-full max-w-3xl mx-auto rounded-lg shadow-xl overflow-hidden">
      <div
        className="p-6 text-white"
        style={{
          background: `linear-gradient(to right, ${homeColor}, ${awayColor})`,
        }}
      >
        <div className="flex justify-between items-center">
          {/* Home Team */}
          <TeamSection
            name={homeTeam}
            logo={homeLogo}
            score={homeScore}
            color={homeColor}
            isHome={true}
          />

          {/* Game Info */}
          <div className="text-center space-y-2 bg-black/30 p-4 rounded-xl">
            <p className="text-xl md:text-2xl font-semibold">Q{quarter}</p>
            <p className="text-2xl md:text-4xl font-bold">{time}</p>
            <p className="text-sm uppercase tracking-wider">{status}</p>
          </div>

          {/* Away Team */}
          <TeamSection
            name={awayTeam}
            logo={awayLogo}
            score={awayScore}
            color={awayColor}
            isHome={false}
          />
        </div>
      </div>
    </div>
  );
}

function TeamSection({ name, logo, score, color, isHome }) {
  const textColor = isColorLight(color) ? "text-gray-800" : "text-white";
  const darkModeText = "dark:text-gray-100";

  return (
    <div
      className={`flex flex-col items-center space-y-2 ${textColor} ${darkModeText}`}
    >
      <div className="relative w-16 h-16 md:w-24 md:h-24">
        <Image
          src={logo}
          alt={`${name} logo`}
          layout="fill"
          objectFit="contain"
          className="rounded-full bg-white p-1"
        />
      </div>
      <h2 className="text-lg md:text-xl font-bold text-center">{name}</h2>
      <p className="text-3xl md:text-5xl font-bold">{score}</p>
    </div>
  );
}

// Helper function to determine text color based on background
function isColorLight(color) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}
