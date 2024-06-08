'use client'

import Image from "next/image";
//Leaving motion just in case some of the styling issues that need to be fixed are in this
import { motion } from "framer-motion";
import { useState } from "react";
import QuestionTable from "@/components/QuestionTable";
const boardInfo = require("../../../public/boardFiles/basicBoard1.json")

function PlayerGoldTracker({ playerName, gold } : {playerName: string, gold: number}){
  return (
    <div className="bg-teal-900 w-60 flex flex-col text-center gap-4 border-solid border-black border-2">
      <div className="flex flex-row gap-1 text-center items-center justify-center">
          <Image
            src="/icons/Gold_symbol.webp"
            alt="Gold Symbol"
            width={18}
            height={18}
            priority
          />
        <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 via-amber-300 to-amber-950">{ gold }</span>
      </div>
      <div className="text-4xl">{ playerName }</div>
    </div>
  )
}

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [player1Gold, setPlayer1Gold] = useState(0)

  let stateObject = { player1Gold, setPlayer1Gold }

  return (
    <main className="flex h-4/6 flex-col items-center justify-between p-12">
      <div className="z-10 w-full text-center flex justify-center">
        <QuestionTable key="question-table" boardInfo={boardInfo} stateObject={stateObject} />
      </div>
      <div className="fixed bottom-0 z-20 flex text-center justify-center h-1/6 mx-5">
        <PlayerGoldTracker key="player1-gold-tracker" playerName="Player1" gold={player1Gold}/>
      </div>
    </main>
  );
}