import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';


const app = express();
const server = http.createServer(app);
const io = new Server(server)
app.use(cors());
  
io.on('connection', (socket) => {
    console.log('a user connected');
});

const port = process.env.PORT || 8000;

app.get('/', function(req, res){
    res.send({connected: true, server: "whoisright backend"})
    console.log(req)
})

app.listen(port, function() {
    console.log(`server is running on port ${port}`)
})