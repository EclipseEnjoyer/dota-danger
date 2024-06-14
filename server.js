import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
// import { sqlite3 } from 'sqlite3'
// import { open } from 'sqlite'

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let roomList = { 'defaultRoom': { playerCount: 0, playerData: []} };
let playerData = [];
let socketConnectionCount = 0;

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // const db = await open({
  //   filename: 'playerInfo.db',
  //   driver: sqlite3.Database
  // })

  // await db.exec(`
  //     CREATE TABLE IF NOT EXISTS players (
  //       id INTEGER PRIMARY KEY AUTOINCREMENT,
  //       gold_value INTEGER,
  //       player_name TEXT,
  //       room_id INTEGER
      
  //     )    
  //   `)

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socketConnectionCount++;
    console.log('Server picking up connection of socket')
    
    //Stuff like this should probably be handed over to another technology like the more familiar HTTP requests, but, whatever this will work for a small project
    socket.on('requestRoomList', () => {
      console.log('Requesting room list')
      socket.emit('getRoomList', Object.keys(roomList))
    })

    socket.on('joinRoom', ({roomName, playerInfo}) => {
      if(roomList[roomName] !== undefined) {
        socket.join(roomName)
        roomList[roomName].playerCount++
      } else {
        //This will create a new room, if it doesn't exist
        socket.join(roomName)
        roomList[roomName] = {playerCount: 1, playerData: []}
        io.emit('getRoomList', Object.keys(roomList))
      }
      //Only add player if that user is not already in the data
      if(roomList[roomName].playerData.find(player => player.uniqueUserId === playerInfo.uniqueUserId) === undefined) {
        roomList[roomName].playerData.push(playerInfo)
      }
      io.to(roomName).emit('syncRoom', roomList[roomName].playerData)
    })

    socket.on('leaveRoom', ({roomName, playerInfo}) => {
      if(roomList[roomName] !== undefined) {
        if(roomList[roomName].playerData.find(player => player.uniqueUserId === playerInfo.uniqueUserId) !== undefined) {
          let playerIndex = roomList[roomName].playerData.findIndex(player => player.uniqueUserId === playerInfo.uniqueUserId) 
          roomList[roomName].playerData.splice(playerIndex, 1)
          roomList[roomName].playerCount--
        }
      }
    })

    socket.on('disconnect', () => {
      socketConnectionCount--;
      console.log('Socket disconnected')
      socket.rooms.forEach(roomName => {
        //Is this neccessary?? Yes, because this is what the FE sees as room options. Even if the room is auto removed this has to be removed
        if(roomList[roomName].playerCount === 0 && roomName !== 'defaultRoom'){
          delete roomList.roomName
        }
      })
      //Just in case things get into a funky state this will clear it
      if(socketConnectionCount == 0) playerData = [];
    })
    
    socket.emit('syncPlayerDataDown', playerData)
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});