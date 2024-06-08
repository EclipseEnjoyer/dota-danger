'use client'

import Image from "next/image";
//Leaving motion just in case some of the styling issues that need to be fixed are in this
import { motion } from "framer-motion";
import { act, useState } from "react";
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
  const [playerArray, setPlayerArray] = useState([{name: 'Player1', gold: 500}]);
  const [activePlayer, setActivePlayer] = useState(0)

  function setActivePlayerGold(index: number, goldValue: number){
    let newPlayerArray = playerArray
    newPlayerArray[activePlayer].gold = goldValue
    setPlayerArray(newPlayerArray)
  }

  const adjustActivePlayerGold = (goldValue: number, positive: boolean) => {
    let newPlayerArray = structuredClone(playerArray)
    if(positive) newPlayerArray[activePlayer].gold += goldValue
    else newPlayerArray[activePlayer].gold -= goldValue
    setPlayerArray(newPlayerArray)
  }

  //This shouldn't use active player in the long run but just for ease of implementation right now
  const setPlayerName = (name: string) => {
    let newPlayerArray = playerArray
    newPlayerArray[activePlayer].name = name
    setPlayerArray(newPlayerArray)
  }

  return (
    <main className="flex h-4/6 flex-col items-center justify-between p-12">
      <div className="z-10 w-full text-center flex justify-center">
        <QuestionTable key="question-table" boardInfo={boardInfo} goldAdjustmentFunction={adjustActivePlayerGold}/>
      </div>
      <div className="fixed bottom-0 z-20 flex text-center justify-center h-1/6 mx-5">
        <PlayerGoldTracker key="player1-gold-tracker" playerName={playerArray[0].name} gold={playerArray[0].gold}/>
      </div>
    </main>
  );
}