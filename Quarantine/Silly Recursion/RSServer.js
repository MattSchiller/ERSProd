var http = require("http"),
    url = require('url'),
    fs = require('fs'),
    io = require('socket.io'),
    RatscrewLogic = require('./scripts/RatscrewLogic.js');

var serverName = 'SERVER';
var server = http.createServer(function(request, response){
  var path = url.parse(request.url).pathname;
  console.log("Request for "+path+" received.");
  switch (path) {
    case '/':
    case '/Ratscrew.html':
    case '/index.html':
      response.writeHead(200, {"Content-Type": "text/html"});
      path='/index.html';break;
    case '/scripts/Ratscrew.js':
    case '/socket.io/socket.io.js':
    case "/scripts/Suits.js":
      response.writeHead(200, {"Content-Type": "application/javascript"}); break;
    case '/Ratstyle.css':
      response.writeHead(200, {"Content-Type": "text/css"}); break;
    case '/assets/woodgrain.jpg':
    case '/assets/rules.png':
    case '/assets/rulesHover.png':
    case '/assets/rules2.png':
    case '/assets/rules2-hover.png':
    case '/assets/cardPixels.png':
    case '/assets/starfield.jpg':
      response.writeHead(200, {'Content-Type': 'image/gif' }); break;
    default:
      response.writeHead(404);
      response.write("Oops this doesn't exist - 404"); break;
  }
  fs.readFile(__dirname + path, function(error, data){
    if (error) {
      response.end();
    } else {
      response.write(data, "utf8");
      response.end();
    }
    console.log("Served: "+path);
  });
});

server.listen(process.env.PORT || 8001);
console.log("listening on port 8001");
var ios = io.listen(server);

function GameRoom(){
  this.gL=new RatscrewLogic();
  this.id=Date.now();
  this.users=[];
}
function sendGameState(socket, ios, mRI, toAll){
  console.log("Sending game state to room index:", mRI);
  if (toAll) {                                        //An array of all of the players, names, and card len`gths
    ios.to(gameRooms[mRI].id).emit("gameState",{roomID:gameRooms[mRI].id, players:gameRooms[mRI].gL.gameState(), curr:gameRooms[mRI].gL.curr(),
      center:gameRooms[mRI].gL.center(), penalty:gameRooms[mRI].gL.penalty()});
  } else {
    socket.emit("gameState",{roomID:gameRooms[mRI].id, players:gameRooms[mRI].gL.gameState(), curr:gameRooms[mRI].gL.curr(),
      center:gameRooms[mRI].gL.center(), penalty:gameRooms[mRI].gL.penalty()});
  }
}
function emitMessage(socket, ios, mRI, message, isChat){
  console.log("Emitting:",message);
  if (gameRooms[mRI]===undefined) {
    console.log("emitMessage, attempting to emit to an undefined room instance");
    return;
  }
  var source, index;
  if (socket===serverName) {
    source = serverName;
    index = "purple";
  } else if (gameRooms[mRI].gL.findIndex(socket)===false) {
    source = 'Anonymous';
    index = 'gray';
  } else {
    source = gameRooms[mRI].gL.getName(socket);
    index = gameRooms[mRI].gL.findIndex(socket);
  }
  ios.to(gameRooms[mRI].id).emit("message",{"source":source, "message":message, "index":index, isChat:isChat});
}
function emitWinner(socket, ios, mRI){
  //Someone has won! Time to reset the game
  console.log("emitWinner, mRI:",mRI);
  emitMessage(serverName, ios, mRI, gameRooms[mRI].gL.getName(socket)+" has won! Reseting the game...", true);
  setTimeout(function(){                          //Intending to reset the game;
    if (gameRooms[mRI]===undefined) return;       //Room has been emptied of all users and spliced
    gameRooms[mRI].gL.resetGame();
    sendGameState(socket, ios, mRI, true);
    sendRoomsList(socket, ios, true);
    sendButtonStatus(socket, ios, mRI, !gameRooms[mRI].gL.readyForReady());
    for (var z=0;z<gameRooms[mRI].users.length;z++){
      sendID(gameRooms[mRI].users[z], mRI);
    }
  }, 2000);
}
function sendButtonStatus(socket, ios, mRI, disabled){
  console.log("Sending button status disabled:",disabled);
  ios.to(gameRooms[mRI].id).emit('readyStatus', {disabled:disabled});
}
function sendID(socket, mRI){
  myID = gameRooms[mRI].gL.getID(socket);
  if (myID===false) {
    console.log("Could not send player ID");
    return;
  }
  console.log("Sending user ID:",myID);
  socket.emit("id",{id:myID});
}
function sendRoomsList(socket, ios, toAll){
  var tempArray=[];
  for(var z=0;z<gameRooms.length;z++){
    console.log("sendingRoomsList, arraying gameRooms; z=",z,"gameRooms.length:",gameRooms.length);
    tempArray.push({name:roomPrefix+(z+1), id: gameRooms[z].id, numPlayers:gameRooms[z].gL.gameState().length});
  }
  if (toAll) ios.sockets.emit('roomsList', {roomsList:tempArray});
  else socket.emit('roomsList', {roomsList:tempArray});
}
function createRoom(socket, ios){
  console.log("Creating a new room");
  gameRooms.push(new GameRoom());
  sendRoomsList(socket, ios, true);
  return gameRooms.length-1;
}
function sitDown(socket, ios, mRI, name){
  var prevName, added;
  prevName=gameRooms[mRI].gL.getName(socket);
  added = gameRooms[mRI].gL.assignName(socket, name);
  if (added) {
    if (prevName===gameRooms[mRI].gL.getName("Garbage")) emitMessage(socket, ios, mRI, "has sat down.", false);    //First name assignment
    else emitMessage(socket, ios, mRI, "is the new name for "+prevName, false);
    if (socket) sendID(socket, mRI);
  } else {if (socket) socket.emit("fullTable"); return;}
}
function findRoomIndex(roomID){
  for(var z=0;z<gameRooms.length;z++){
    if (gameRooms[z].id===roomID) return z;
  }
  return false;
}
function joinRoom(socket, ios, roomID){
  var mRI=findRoomIndex(roomID);
  if (mRI===false) {
    console.log("User tried to join a room that doesn't exist")
    return;
  }
  if (socket){                                  //Human Player
    socket.join(roomID);
    gameRooms[mRI].users.push(socket);
    console.log("joinRoom, mRI:",mRI);
    sendID(socket,mRI);
    sendGameState(socket, ios, findRoomIndex(roomID), false);
  } else {                                      //AI Player
    gameRooms[mRI].users.push('AI');
    console.log("joinRoom (AI), mRI:",mRI);
  }
  sendRoomsList(socket, ios, true);
}
function findMyRoom(socket){
  var mRI=false, z=0, y=0;
  while (z<gameRooms.length && mRI===false) {
    y=0;
    while (y<gameRooms[z].users.length && mRI===false){
      if (gameRooms[z].users[y]===socket){
        mRI=z;
      } else y++;
    }
    z++;
  }
  return mRI;
}
function leaveRoom(socket, ios){
  var mRI=findMyRoom(socket), humanPlayers=0;
  if (mRI===false) {
    console.log("No idea what room this user is in. Whatevs.");
    return;
  }
  console.log(gameRooms[mRI].gL.getName(socket),"is leaving room:",mRI);
  gameRooms[mRI].users.splice(gameRooms[mRI].users.indexOf(socket), 1);
  socket.leave(gameRooms[mRI].id);
  for (var z=0;z<gameRooms[mRI].users.length;z++){
    if (gameRooms[mRI].users[z]!=='AI') humanPlayers++;
  }
  if (humanPlayers===0) {
    console.log("Splicing out an empty gameRoom");
    gameRooms.splice(mRI, 1);
  } else {
    if (gameRooms[mRI].gL.getID(socket)===false) emitMessage(socket,ios,mRI,"disconnected.", false);
    else {
      emitMessage(socket,ios,mRI,"disconnected; redistributing their cards...", false);
      gameRooms[mRI].gL.resetPlayer(socket);
      if (gameRooms[mRI].gL.winner!==false) emitWinner(gameRooms[mRI].gL.winner, ios, mRI);
      else {
        sendButtonStatus(socket, ios, mRI, !gameRooms[mRI].gL.readyForReady());
        sendGameState(socket, ios, mRI, true);
      }
    }
  }
  sendRoomsList(socket, ios, true);
}
function amIInRoom(socket, ios, roomID){
  var myRooms = socket.rooms;
  if (myRooms[roomID]===undefined) return false;
  return true;
}

var gameRooms = [], roomPrefix='Room ';                              //ADD IN LOBBY 'room'

ios.sockets.on('connection', function(socket){
  console.log("New user connected");
  sendRoomsList(socket, ios, false);

  socket.on('newRoom', function(data){
    var newRoomIndex;
    leaveRoom(socket,ios);
    newRoomIndex=createRoom(socket, ios);
    console.log("newRoomIndex=",newRoomIndex);
    joinRoom(socket, ios, gameRooms[newRoomIndex].id);
    sendID(socket, newRoomIndex);
  });
  socket.on('roomSelect', function(data){
    console.log("Player joining room",data.roomID);
    if (amIInRoom(socket, ios, data.roomID)) return;                //User is joining their current room
    leaveRoom(socket,ios);
    joinRoom(socket, ios, data.roomID);
  });

  //RULE SELECTION
  //BETTER UI

  socket.on('gameReq', function(data){
    var mRI=findRoomIndex(data.roomID);
    if (mRI===false) {console.log("There was a problem in finding the roomID specified (gameReq)"); return;}
    console.log("Username",gameRooms[mRI].gL.getName(socket),"requested game state");
    sendGameState(socket, ios, mRI, false);
  });
  socket.on('idReq', function(data){
    var mRI=findRoomIndex(data.roomID);
    if (mRI===false) {console.log("There was a problem in finding the roomID specified (idReq)"); return;}
    console.log("Username",gameRooms[mRI].gL.getName(socket),"requested user ID");
    sendID(socket, mRI);
  });
  socket.on('roomsReq', function(data){
    console.log("User requested rooms list");
    sendRoomsList(socket, ios, false);
  })
  socket.on('message', function(data){
    var mRI=findRoomIndex(data.roomID);
    if (mRI===false) {console.log("There was a problem in finding the roomID specified (message)"); return;}
    console.log("Username",gameRooms[mRI].gL.getName(socket),"is sending a message");
    emitMessage(socket, ios, mRI, data.msg, true);
  });
  socket.on("name", function(data){
  //Registers the user's name
    var mRI=findRoomIndex(data.roomID)
    if (mRI===false) {console.log("There was a problem in finding the roomID specified (name)"); return;}
    console.log("Username",data.name,"attempted to add to roster");
    sitDown(socket, ios, mRI, data.name);
    sendGameState(socket, ios, mRI, true);
    sendButtonStatus(socket, ios, mRI, !gameRooms[mRI].gL.readyForReady());
    sendRoomsList(socket, ios, true);
  });
  socket.on('addAI', function(data){
    var mRI;
    mRI=findRoomIndex(data.roomID);
    if (mRI===false) {console.log("There was a problem in finding the roomID specified (addAI)"); return;}
    console.log("Received AI request from:",gameRooms[mRI].gL.getName(socket));
    sitDown(null, ios, mRI, 'AI-Player');
    sendGameState(socket, ios, mRI, true);
    sendButtonStatus(socket, ios, mRI, !gameRooms[mRI].gL.readyForReady());
    sendRoomsList(socket, ios, true);
  });
  socket.on("startReady", function(data){
  //Passes user-readiness on
    var allReady=false, theNot=" not ", mRI;
    mRI=findRoomIndex(data.roomID);
    if (mRI===false) {console.log("There was a problem in finding the roomID specified (startReady)"); return;}
    console.log("Username",gameRooms[mRI].gL.getName(socket),"signaled ready:",data.readiness);
    if (data.readiness) theNot = " ";
    emitMessage(socket, ios, mRI, "is"+theNot+"ready.", false);
    allReady=gameRooms[mRI].gL.passReady(socket, data.readiness);
    if (allReady) {
      sendButtonStatus(socket, ios, mRI, true);
      sendGameState(socket, ios, mRI, true);
      emitMessage(serverName, ios, mRI, "Everyone's ready, let's begin!", true);
    }
  });
  socket.on('flip', function(data){
    var flipResult, mRI;
    mRI=findRoomIndex(data.roomID);
    if (mRI===false) {console.log("There was a problem in finding the roomID specified (flip)"); return;}
    console.log("Received a flip message from: "+gameRooms[mRI].gL.getName(socket));
    flipResult = gameRooms[mRI].gL.flip(socket);
    if (flipResult.msg==="") return;                                                    //To ignore spamming when it's not the player's turn
    emitMessage(socket, ios, mRI, flipResult.msg, false);
    if (flipResult.clear) serverClear(flipResult.clearPlayer, ios, mRI, 'Flip');
    else {
      sendGameState(socket, ios, mRI, true);
      checkForAI(ios, mRI);
    }
    console.log("Server post flip, curr:",gameRooms[mRI].gL.curr());
    if (gameRooms[mRI].gL.winner!==false) emitWinner(gameRooms[mRI].gL.winner,ios,mRI);
  });
  socket.on('slap', function(data){
    var slapOutcome, mRI, AITurn;
    mRI=findRoomIndex(data.roomID);
    if (mRI===false) {console.log("There was a problem in finding the roomID specified (slap)"); return;}
    console.log("Received slap message from:",gameRooms[mRI].gL.getName(socket));
    slapOutcome=gameRooms[mRI].gL.slap(socket);
    console.log("slapOutcome:",slapOutcome);
    if (slapOutcome.msg==="") {
      console.log("Ignoring a slap"); return;                                           //probably a lag mistake
    }
    emitMessage(socket, ios, mRI, slapOutcome.msg, false);
    if (slapOutcome.success) serverClear(gameRooms[mRI].gL.findIndex(socket), ios, mRI, 'Slap');
    else {
      sendGameState(socket, ios, mRI, true);
      checkForAI(ios, mRI);
    }
    if (gameRooms[mRI].gL.winner!==false) emitWinner(gameRooms[mRI].gL.winner,ios,mRI);
  });
  
  socket.on('disconnect', function(data){
  //Removes the player from the server list
    var mRI=false;
    console.log("User disconnected!");
    leaveRoom(socket, ios);
  });
});

function serverClear(socket, ios, mRI, clearType){
//Empties the center area and pushes the cards into another player's stack
  var subIos=ios, subSock=socket, subRoom=mRI;
  console.log("Server requesting clear.");
  gameRooms[mRI].gL.clearCenter(socket, clearType, function() {
    console.log("Running callback");
    sendGameState(subSock, subIos, subRoom, true);
    checkForAI(subIos, subRoom);
  });
}

function checkForAI(ios, mRI){
  var thisAITurn=gameRooms[mRI].gL.handleAITurn(function(aiTurnResults) {
    if (aiTurnResults.action.clear) serverClear(aiTurnResults.action.clearPlayer, ios, mRI, 'Flip');
    emitMessage(aiTurnResults.clearPlayer, ios, mRI, aiTurnResults.action.msg, false);
    sendGameState(null, ios, mRI, true);
  });
  if (thisAITurn.check) {               //It's the AI's turn and they did something
    checkForAI(ios, mRI);
  } else return;
}
