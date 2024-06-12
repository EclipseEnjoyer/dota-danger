'use client'

import Image from "next/image";
import { motion, sync } from "framer-motion";
import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { v4 as uuidV4 } from 'uuid';

import QuestionTable from "@/components/QuestionTable";
import PlayerInformationTracker from "@/components/PlayerInformationTracker";
const boardInfo = require("../../../public/boardFiles/basicBoard1.json");
let initialSyncOccurred = false;

//This is probably not the best way to do this, but I think it will solve my problem
let workingPlayerData = [] as Array<{name: string, gold: number, uniqueUserId: string}>;
let workingClientPlayerId = '' as string;

export default function Page() {
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState("N/A")
  const [playerArray, setPlayerArray] = useState<Array<{name: string, gold: number, uniqueUserId: string}>>([]);
  const [activePlayer, setActivePlayer] = useState(0)
  const [clientPlayerId, setClientPlayerId] = useState(workingClientPlayerId)

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
    let playerArrayIndex = clonedPlayerArray.findIndex((player) => player.uniqueUserId === workingClientPlayerId)
    clonedPlayerArray[playerArrayIndex].name = name
    setPlayerArray(clonedPlayerArray)
    socket.emit('syncPlayerDataUp', clonedPlayerArray)
  }

  //So, this is where all the socket communication happens, but not what is actually what is reponsible for connecting and disconnecting it
  useEffect(() => {
    workingClientPlayerId = (localStorage.getItem('uniqueUserId')) ? localStorage.getItem('uniqueUserId') as string : '';
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
      workingPlayerData = structuredClone(incomingPlayerArray)
      if (!initialSyncOccurred) {
        initialSyncOccurred = true;
        initialSyncUp();
      }
    }
    
    function addPlayer(name: string, goldValue: number, uniqueUserId: string) {
      let clonedPlayerArray = structuredClone(workingPlayerData)
      if(clonedPlayerArray.find(player => player.uniqueUserId === uniqueUserId) === undefined) {
        let newPlayer = { name: name, gold: goldValue, uniqueUserId: uniqueUserId }
        clonedPlayerArray.push(newPlayer)
        socket.emit('syncPlayerDataUp', clonedPlayerArray)
      }
    }

    function initialSyncUp(){
      //This process will need to be thrown in a database at some point to truly make sure that these are unique, but a problem for another day
      let uniqueUserId = localStorage.getItem('uniqueUserId')
      if(uniqueUserId === null || uniqueUserId === undefined) {
        uniqueUserId = uuidV4()
        localStorage.setItem('uniqueUserId', uniqueUserId)
      }
      workingClientPlayerId = uniqueUserId;
      setClientPlayerId(uniqueUserId);
      addPlayer('PlayerAlpha', 0, uniqueUserId)
    }

    //This function seems like it does nothing, I'll leave it here cause I am still learning sockets, but, it genuinely seems like it does nothing
    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    //Basics of the socket working
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    //Socket Functions
    socket.on("syncPlayerDataDown", (incomingPlayerArray) => {
      workingPlayerData = structuredClone(playerArray)
      syncDown(incomingPlayerArray)
      setPlayerArray(workingPlayerData)
    })

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [playerArray]);


  //Handles the connecting and disconnecting specifically
  useEffect(() => {
    socket.connect()

    function removePlayer(uniqueUserId: string) {
      let clonedPlayerArray = structuredClone(workingPlayerData)
      let playerIndex = clonedPlayerArray.findIndex(player => player.uniqueUserId === uniqueUserId) 
      if(playerIndex > 0) {
        clonedPlayerArray.splice(playerIndex, 1)
        socket.emit('syncPlayerDataUp', clonedPlayerArray)
      }
    }

    return () => {
      initialSyncOccurred = false
      removePlayer(workingClientPlayerId)
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
        <PlayerInformationTracker key="player1-gold-tracker" playerArray={playerArray} nameAdjustmentFunction={setPlayerName} clientUserId={clientPlayerId}/>
      </div>
    </main>
  );
}