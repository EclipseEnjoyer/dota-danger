'use client'

import Image from "next/image";
//Leaving motion just in case some of the styling issues that need to be fixed are in this
import { motion } from "framer-motion";
import { act, useState } from "react";
import QuestionTable from "@/components/QuestionTable";
import PlayerInformationTracker from "@/components/PlayerInformationTracker";
const boardInfo = require("../../../public/boardFiles/basicBoard1.json")

export default function Page() {
  const [playerArray, setPlayerArray] = useState([{name: 'Player1', gold: 500}]);
  const [activePlayer, setActivePlayer] = useState(0)
  const [clientPlayer, setClientPlayer] = useState(0)

  function setActivePlayerGold(index: number, goldValue: number){
    let newPlayerArray = structuredClone(playerArray)
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
    let newPlayerArray = structuredClone(playerArray)
    newPlayerArray[activePlayer].name = name
    setPlayerArray(newPlayerArray)
  }

  return (
    <main className="flex h-4/6 flex-col items-center justify-between p-12">
      <div className="z-10 w-full text-center flex justify-center">
        <QuestionTable key="question-table" boardInfo={boardInfo} goldAdjustmentFunction={adjustActivePlayerGold}/>
      </div>
      <div className="fixed bottom-0 z-20 flex text-center justify-center h-1/6 mx-5">
        <PlayerInformationTracker key="player1-gold-tracker" playerArray={playerArray} nameAdjustmentFunction={setPlayerName}/>
      </div>
    </main>
  );
}