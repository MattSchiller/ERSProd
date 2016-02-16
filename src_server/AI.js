//DESIGNED TO EMULATE A REAL PLAYER TO RSServer.JS
var CardLogic = require('./CardLogic.js');

function AI (serverPath, name, roomID, difficulty) {
  this.name = name;
  this.roomID = roomID;
  this.difficulty = difficulty;
  this.hurdle = [];
  this.hurdle['easy'] = 0.7;      //Probability of not slapping when pile is slappable
  this.hurdle['medium'] = 0.45;
  this.hurdle['hard'] = 0.15;
  this.hurdle['insane'] = 0.05;
  this.speed = [];
  this.speed['easy'] = 1500;      //Time in ms
  this.speed['medium'] = 1000;
  this.speed['hard'] = 500;
  this.speed['insane'] = 300;
  this.cL = new CardLogic();
  
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
    if (data.curr===undefined) return;
    //this.index = this._findMyIndex();
    
    //SLAP BEHAVIOR
    var isSlappable = false, top, second, third, bottom,
        that=this, slappableCenter;
    this.center = data.center;
    if (data.center.length > 1) {
      top = data.center[data.center.length-1].card;
      second = data.center[data.center.length-2].card;
      if (data.rules.doubles && this.cL.checkDoubles(top, second)) isSlappable = true;
      else if (data.center.length > 2) {
        third = data.center[data.center.length-3].card;
        bottom = data.center[0].card;
        if ( (data.rules.sandwich && this.cL.checkDoubles(top, third))
          || (data.rules.flush && this.cL.checkFlush(top, second, third))
          || (data.rules.straight && this.cL.checkStraight(top, second, third))
          || (data.rules.bottomStack && this.cL.checkDoubles(top, bottom))) isSlappable = true;
      }
      if ( (isSlappable) && (Math.random() >= this.hurdle[this.difficulty]) ) {   //AI will slap
        console.log('AI will slap');
        slappableCenter = data.center;
        setTimeout(function(){
          //Need to check if the center pile has changed since we decided to slap
          if (that.center===slappableCenter) that.socket.emit('slap', {roomID:that.roomID});
        }, (this.speed[this.difficulty] * (Math.random()+0.5) ) );                //Slap delay = speed[]*(.5<->1.5) for some unpredictability
        return;     //Don't want to ALSO send a flip notice that would otherwise block the AI's own slap
      }
    }
    //FLIP BEHAVIOR
    if (data.players[data.curr].id===this.id && data.players.length>1){ //It's my turn
      setTimeout(function(){                          //Intending to reset the game;
        that.socket.emit('flip', {roomID:that.roomID});
      }, 600);
    }
  }.bind(this));
}

module.exports = AI;