import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';


const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });
  
  
io.on('connection', (socket) => {
    console.log('a user connected');
});

const port = process.env.PORT || 8000;

app.get('/', function(req, res){
    res.send({connected: true, server: "whoisright backend"})
    console.log(req)
})

io.listen(port, function() {
    console.log(`server is running on port ${port}`)
})