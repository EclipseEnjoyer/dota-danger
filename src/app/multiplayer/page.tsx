'use client'

import Image from "next/image";
import { motion, sync } from "framer-motion";
import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { v4 as uuidV4 } from 'uuid';

import QuestionTable from "@/components/QuestionTable";
import PlayerInformationTracker from "@/components/PlayerInformationTracker";
const boardInfo = require("../../../public/boardFiles/basicBoard1.json")
let initialSyncOccurred = false

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
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState("N/A")
  const [playerArray, setPlayerArray] = useState<Array<{name: string, gold: number, uniqueUserId: string}>>([]);
  const [activePlayer, setActivePlayer] = useState(0)
  const [clientPlayer, setClientPlayer] = useState(0)

  function setActivePlayerGold(index: number, goldValue: number){
    let clonedPlayerArray = structuredClone(playerArray)
    clonedPlayerArray[activePlayer].gold = goldValue
    setPlayerArray(clonedPlayerArray)
    socket.emit('syncPlayerDataUp', clonedPlayerArray)
  }

  const adjustActivePlayerGold = (goldValue: number, positive: boolean) => {
    let clonedPlayerArray = structuredClone(playerArray)
    if(positive) clonedPlayerArray[activePlayer].gold += goldValue
    else clonedPlayerArray[activePlayer].gold -= goldValue
    setPlayerArray(clonedPlayerArray)
    socket.emit('syncPlayerDataUp', clonedPlayerArray)
  }

  //This shouldn't use active player in the long run but just for ease of implementation right now
  const setPlayerName = (name: string) => {
    let clonedPlayerArray = structuredClone(playerArray)
    clonedPlayerArray[activePlayer].name = name
    setPlayerArray(clonedPlayerArray)
    socket.emit('syncPlayerDataUp', clonedPlayerArray)
  }

  const addPlayer = (name: string, goldValue: number, uniqueUserId: string) => {
    let clonedPlayerArray = structuredClone(playerArray)
    let newPlayer = { name: name, gold: goldValue, uniqueUserId: uniqueUserId }
    console.log('Cloned Player Array', clonedPlayerArray)
    clonedPlayerArray.push(newPlayer)
    setPlayerArray(clonedPlayerArray)
    console.log('Player Array before emit', playerArray)
    console.log('Cloned player array before emit', clonedPlayerArray)
    socket.emit('syncPlayerDataUp', clonedPlayerArray)
    console.log('Add player after socket emit', uniqueUserId)
  }

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function syncDown(incomingPlayerArray : Array<{name: string, gold: number, uniqueUserId: string}>){
      console.log('Sync down happening', incomingPlayerArray)
      let cloneOfIncomingPlayerArray = structuredClone(incomingPlayerArray)
      setPlayerArray(cloneOfIncomingPlayerArray)
      console.log('Initial Sync checked?', initialSyncOccurred)
      if(!initialSyncOccurred) {
        console.log()
        initialSyncOccurred = true
        initialSyncUp(cloneOfIncomingPlayerArray)
      } 
    }

    function initialSyncUp(playerArray){
      //This process will need to be thrown in a database at some point to truly make sure that these are unique, but a problem for another day
      let uniqueUserId = localStorage.getItem('uniqueUserId')
      if(uniqueUserId === null || uniqueUserId === undefined) {
        uniqueUserId = uuidV4()
        localStorage.setItem('uniqueUserId', uniqueUserId)
      }
      console.log('Initital Sync up')
      addPlayer('PlayerAlpha', 0, uniqueUserId)
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    //Basics of the socket working
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    //Socket Functions
    socket.on("syncPlayerDataDown", (incomingPlayerArray) => {
      syncDown(incomingPlayerArray)
    })

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);


  //Hnadles the connecting and disconnecting specifically
  useEffect(() => {
    socket.connect()

    return () => {
      socket.disconnect();
    }
  },[]);

  return (
    <main className="flex h-4/6 flex-col items-center justify-between p-12">
      <div>Connection Status: {isConnected ? "Connected" : "Disconnected"}</div>
      <div className="z-10 w-full text-center flex justify-center">
        <QuestionTable key="question-table" boardInfo={boardInfo} goldAdjustmentFunction={adjustActivePlayerGold}/>
      </div>
      <div className="fixed bottom-0 z-20 flex text-center justify-center h-1/6 mx-5">
        <PlayerInformationTracker key="player1-gold-tracker" playerArray={playerArray} nameAdjustmentFunction={setPlayerName}/>
      </div>
    </main>
  );
}