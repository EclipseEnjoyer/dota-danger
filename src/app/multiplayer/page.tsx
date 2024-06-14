'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useRouter } from "next/navigation";
import Link from 'next/link';

let initialRoomPullHappened = false

export default function Page() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState("N/A")
  const [roomList, setRoomList] = useState<Array<string>>([])
  
  function createNewRoom(){
    let newRoomName = window.prompt("What would you like the game to be called?")
    router.push('/multiplayer/' + newRoomName)
  }
  
  //So, this is where all the socket communication happens, but not what is actually what is reponsible for connecting and disconnecting it
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

    //This function seems like it does nothing, I'll leave it here cause I am still learning sockets, but, it genuinely seems like it does nothing
    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
      // initialRoomPullHappened = false;
    }

    function getRoomList(roomList: Array<string>){
      setRoomList(roomList)
    }

    //Basics of the socket working
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("getRoomList", getRoomList);

    if(!initialRoomPullHappened){
      socket.emit('requestRoomList')
      initialRoomPullHappened = true;
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [isConnected, roomList]);

  const roomLinks = Object.values(roomList).map((roomName) =>
    <Link key={roomName} href={'/multiplayer/' + roomName} className="font-serif text-5xl">
      <h2>Join { roomName }</h2>
    </Link>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div className="z-10 w-full text-center flex flex-col gap-4">
        { roomLinks }
        <h2 className="font-serif text-5xl" onClick={createNewRoom}>Create New Room</h2>
      </div>
    </main>
  )
}