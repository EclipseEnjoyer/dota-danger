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
    
    socket.on('syncPlayerDataUp', (newPlayerData) => {
      playerData = newPlayerData
      io.emit('syncPlayerDataDown', newPlayerData)
    })

    socket.on('disconnect', () => {
      socketConnectionCount--;
      console.log('Socket disconnected')
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