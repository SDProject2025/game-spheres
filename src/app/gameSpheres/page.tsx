'use client';

import React, { useState } from 'react';

const dummyGameSpheres = [
  {
    id: 1,
    name: 'gs-Fortnite',
    description: 'Fast-paced battle royale with building mechanics.',
    profilePic: '🎮',
    followers: ['Player1', 'GamerX', 'NoScope99']
  },
  {
    id: 2,
    name: 'gs-Elden_Ring',
    description: 'Challenging open-world fantasy RPG.',
    profilePic: '⚔️',
    followers: ['Tarnished', 'Mage101', 'Knighty']
  },
  {
    id: 3,
    name: 'gs-Minecraft',
    description: 'Blocky sandbox building and adventure.',
    profilePic: '🟩',
    followers: ['Steve', 'BuilderGirl', 'RedstonePro']
  },
  {
    id: 4,
    name: 'gs-Valheim',
    description: 'Norse-themed survival and exploration adventure.',
    profilePic: '🪓',
    followers: ['VikingVoyager', 'OdinFan', 'ShieldMaiden']
  },
  {
    id: 5,
    name: 'gs-Overwatch',
    description: 'Team-based hero shooter with vibrant characters.',
    profilePic: '🎯',
    followers: ['TracerMain', 'TankLord', 'SupportHero']
  },
  {
    id: 6,
    name: 'gs-Stardew_Valley',
    description: 'Chill farming and life simulation game.',
    profilePic: '🌾',
    followers: ['FarmerBob', 'GreenThumb', 'Chickens4Life']
  },
  {
    id: 7,
    name: 'gs-Apex_Legends',
    description: 'Battle royale with unique heroes and abilities.',
    profilePic: '🏹',
    followers: ['WraithMain', 'OctaneFan', 'SniperPro']
  },
  {
    id: 8,
    name: 'gs-Cyberpunk_2077',
    description: 'Open-world RPG set in a neon dystopia.',
    profilePic: '🤖',
    followers: ['VFan', 'NetRunner', 'JohnnySilverhand']
  },
  {
    id: 9,
    name: 'gs-League_of_Legends',
    description: 'Competitive MOBA with millions of players.',
    profilePic: '⚡',
    followers: ['ADC_MVP', 'MidLaneKing', 'JungleBeast']
  },
  {
    id: 10,
    name: 'gs-Call_of_Duty',
    description: 'Fast-paced first-person shooter action.',
    profilePic: '🔫',
    followers: ['QuickScopePro', 'CODMaster', 'HeadshotKing']
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
      <div className="flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-lg bg-[#111] from-[#00ff75] to-[#3700ff] transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)]">
        {/* Left column */}
        <div className="w-1/3 bg-[#1a1a1a] p-4 border-r border-cyan-500 left-column max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
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
