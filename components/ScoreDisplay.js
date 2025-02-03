import { useState } from "react";

export default function ScoreDisplay({ gameData }) {
  if (!gameData) {
    return (
      <div className="bg-white shadow-md text-black rounded-lg p-4 mb-6 max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="flex justify-center items-center space-x-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-12 mx-auto mt-2"></div>
            </div>
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-12 mx-auto mt-2"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md text-black rounded-lg p-4 mb-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">Super Bowl LVIII</h2>
      <div className="flex justify-center items-center space-x-8">
        <div className="text-center">
          <img
            src={gameData.awayLogo}
            alt={gameData.awayTeam}
            className="h-16 w-16 mx-auto mb-2 object-contain"
          />
          <div className="font-bold">{gameData.awayTeam}</div>
          <div className="text-2xl font-bold">{gameData.awayScore}</div>
        </div>

        <div className="text-xl font-bold">VS</div>

        <div className="text-center">
          <img
            src={gameData.homeLogo}
            alt={gameData.homeTeam}
            className="h-16 w-16 mx-auto mb-2 object-contain"
          />
          <div className="font-bold">{gameData.homeTeam}</div>
          <div className="text-2xl font-bold">{gameData.homeScore}</div>
        </div>
      </div>

      <div className="text-center mt-4 text-sm text-gray-600">
        {gameData.status === "pre" ? (
          <span>
            Game starts at {new Date(gameData.gameDate).toLocaleTimeString()}
          </span>
        ) : gameData.status === "post" ? (
          <span>Final Score</span>
        ) : (
          <span>
            {gameData.clock} - Q{gameData.quarter}
          </span>
        )}
      </div>
    </div>
  );
}
