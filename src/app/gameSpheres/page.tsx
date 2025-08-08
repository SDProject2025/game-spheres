'use client';

import React, { useState } from 'react';

const dummyGameSpheres = [
  {
    id: 1,
    name: 'Fortnite',
    description: 'Fast-paced battle royale with building mechanics.',
    profilePic: '🎮',
    followers: ['Player1', 'GamerX', 'NoScope99']
  },
  {
    id: 2,
    name: 'Elden Ring',
    description: 'Challenging open-world fantasy RPG.',
    profilePic: '⚔️',
    followers: ['Tarnished', 'Mage101', 'Knighty']
  },
  {
    id: 3,
    name: 'Minecraft',
    description: 'Blocky sandbox building and adventure.',
    profilePic: '🟩',
    followers: ['Steve', 'BuilderGirl', 'RedstonePro']
  }
];

export default function GameSpheres() {
  const [selected, setSelected] = useState(dummyGameSpheres[0]);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      {/* Animated sphere placeholder */}
      <div className="relative flex flex-col items-center justify-center mb-10">
        <div className="ball"></div>
        <div className="shadow"></div>
      </div>

      {/* Main content */}
      <div className="flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-lg bg-[#111]">
        {/* Left column */}
        <div className="w-1/3 bg-[#1a1a1a] p-4 border-r border-cyan-500">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">GameSpheres</h2>
          {dummyGameSpheres.map((sphere) => (
            <div
              key={sphere.id}
              className={`mb-2 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                selected.id === sphere.id
                  ? 'bg-cyan-600 text-black font-bold'
                  : 'bg-[#222] hover:bg-[#333]'
              }`}
              onClick={() => setSelected(sphere)}
            >
              {sphere.name}
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="w-2/3 p-6 flex flex-col justify-between">
          <div>
            <div className="text-6xl mb-4">{selected.profilePic}</div>
            <h2 className="text-3xl font-semibold mb-2 text-cyan-300">{selected.name}</h2>
            <p className="text-gray-300 mb-4">{selected.description}</p>
            <button className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-2 px-4 rounded-full transition self-start cursor-pointer">
              Follow
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Followers:</h3>
            <ul className="list-disc list-inside text-gray-300">
              {selected.followers.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
