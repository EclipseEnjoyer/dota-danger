'use client'

import Image from "next/image";
import { motion, sync } from "framer-motion";
import { useEffect, useState } from "react";
import { socket } from "../../../socket";
import { v4 as uuidV4 } from 'uuid';

import QuestionTable from "@/components/QuestionTable";
import PlayerInformationTracker from "@/components/PlayerInformationTracker";
const boardInfo = require("../../../../public/boardFiles/basicBoard1.json");
let initialSyncOccurred = false;

//This is probably not the best way to do this, but I think it will solve my problem
let workingPlayerData = [] as Array<{name: string, gold: number, uniqueUserId: string}>;
let workingClientPlayerId = '' as string;

export default function Page({ params } : { params: {roomName: string } }) {
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState("N/A")
  const [playerArray, setPlayerArray] = useState<Array<{name: string, gold: number, uniqueUserId: string}>>([])
  const [activePlayer, setActivePlayer] = useState(0)
  const [clientPlayerId, setClientPlayerId] = useState(workingClientPlayerId)

  const roomName = params.roomName
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

    //This function seems like it does nothing, I'll leave it here cause I am still learning sockets, but, it genuinely seems like it does nothing
    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    //Basics of the socket working
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    //Socket Functions
    socket.on("syncRoom", (incomingPlayerArray) => {
      workingPlayerData = structuredClone(incomingPlayerArray)
      setPlayerArray(workingPlayerData)
    })

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [playerArray]);


  //Handles the connecting and disconnecting specifically
  useEffect(() => {
    workingClientPlayerId = (localStorage.getItem('uniqueUserId')) ? localStorage.getItem('uniqueUserId') as string : '';
    socket.connect()
    
    
    function joinRoom() {
      if(workingClientPlayerId === '' || workingClientPlayerId === undefined) {
        workingClientPlayerId = uuidV4()
        localStorage.setItem('uniqueUserId', workingClientPlayerId)
      }
      let newPlayer = { name: "PlayerOne", gold: 0, uniqueUserId: workingClientPlayerId }
      socket.emit('joinRoom', { roomName: roomName, playerInfo: newPlayer})
    }

    function removePlayer(uniqueUserId: string) {
      if(workingClientPlayerId === '' || workingClientPlayerId === undefined) {
        workingClientPlayerId = uuidV4()
        localStorage.setItem('uniqueUserId', workingClientPlayerId)
      }
      let fakePlayer = { name: 'fakePlayerRealId', gold: 0, uniqueUserId: workingClientPlayerId } 
      socket.emit('leaveRoom', fakePlayer)
    }

    if(!initialSyncOccurred){
      joinRoom()
      initialSyncOccurred = true
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