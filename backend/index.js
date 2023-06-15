import express from 'express'
import cors from 'cors';

const app = express();
app.use(cors());

const port = process.env.PORT || 8000;

app.get('/', function(req, res){
    res.send({connected: true, server: "whoisright backend"})
    console.log(req)
})

app.listen(port, function() {
    console.log(`server is running on port ${port}`)
})