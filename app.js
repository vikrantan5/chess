const express = require('express');
const path = require('path');
const socket = require("socket.io");
const http = require('http');
const {Chess} = require("chess.js");

const app = express()

const server = http.createServer(app);


const io = socket(server)


// express ka jo app banaya hai ye routing middleware setup sab karega lekin socket ko chahiye https ka server jo express ke server pe based hona chahiye .....

// express k saath socket use karne ke liye to express ke instance ko wo create server me pass kar dena hai ab isse jo instance cretae hoga use socket io me pass kar dena hai

const chess  = new Chess();

let players = {}

let currentPlayer = "W"

// mera pahla playesr white hoga

app.set("view engine" , "ejs")  /// iseee humlog ejs use kar payenge
app.use(express.static(path.join(__dirname ,"public"))); ///isse hum humare sattic files like vanillajs  , images use kar payenge

app.get('/' , function(req , res){
    res.render("index" , {title:"Chess game"})
})


io.on("connection" , function(uniquesocket){
    console.log("connected");



    // for connedted
    // uniquesocket.on("churan" , function(){
    //     io.emit("churan papri"); 

    // })



    // for disconnected

    // uniquesocket.on("disconnect" , function(){
    //     console.log("disconnected")

    // })

    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole" , "w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole" , "b");
    }
    else{
        uniquesocket.emit("spectatorRole")
    }


    uniquesocket.on("disconnect" , function(){
        if(uniquesocket.id === players.white){
            delete players.white
        }
        else if(uniquesocket.id === players.black){
            delete players.black
        }

        
    })


    uniquesocket.on("move" , function(move){  //front end pe koi v move chalne ki kosis
        try{
            if(chess.turn() ==="w" && uniquesocket.id !== players.white) return; //check kar rhahai jiska turn hai whi kar rha h n
            if(chess.turn() ==="b" && uniquesocket.id !== players.black) return;



            const result = chess.move(move); //agar move hi galat de diya to try will fail and catch chalega backend pe
            if(result){
                currentPlayer = chess.turn()  //current player mil jayega
                io.emit("move" , move);  //move event hai frontend ke liye
                io.emit("boardState" , chess.fen())
            }
            else{
                console.log("Invalid move");
                uniquesocket.emit(move);

            }
        }
        catch(err){

            console.log(err);
            uniquesocket.emit("Invalid move :" ,move )
        }

    })



})


// cket ko frontend pe aur backend pe v setup karna hoga

server.listen(3000 , function(){
    console.log("server chal rha hai")
})