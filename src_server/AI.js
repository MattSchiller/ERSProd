//DESIGNED TO EMULATE THE SERVER-PLAYERS CLASS IN RatscrewLogic.JS

function AI (serverPath, name, roomID) {
  this.name = name;
  this.roomID = roomID;
  
  var io = require('socket.io-client');
  this.socket = io.connect(serverPath, {"force new connection": true});
  console.log("In AI constructor, serverPath:", serverPath);
  this.socket.emit('roomSelect', {roomID:this.roomID});           //AI enters room
  this.socket.emit('name', {name:this.name, roomID:this.roomID}); //AI sits down
  
  this.socket.on('readyStatus', function(data){                   //AI always signals ready
    if (!data.disabled) this.socket.emit('startReady', {readiness:true, roomID:this.roomID});
  }.bind(this));
  
  this.socket.on('id', function(data){
    this.id=data.id;
  }.bind(this));
  
  this.socket.on('gameState', function(data){
    this.players = data.players;
    this.index = this._findMyIndex();
    //console.log("AI received gamestate, id:",this.id,"players:",this.players);
    if (data.curr===undefined) return;
    if (this.players[data.curr].id===this.id){ //It's my turn
      var that=this;
      setTimeout(function(){                          //Intending to reset the game;
        that.socket.emit('flip', {roomID:that.roomID});
      }, 500);
    }
  }.bind(this));
  
}

AI.prototype._findMyIndex=function() {
  var z=0;
  if (z===this.players.length) return false;
  while (z<this.players.length && this.players[z].id!==this.id) z++;
  if (z===this.players.length) return false;
  return z;
};

module.exports = AI;