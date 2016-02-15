//DESIGNED TO EMULATE THE SERVER-PLAYERS CLASS IN RatscrewLogic.JS

function AI (serverPath, name, id, color) {
  this.name = name+'-'+id;
  this.cards = [];
  this.color = color;
  this.id = id;
  this.ready=true;
  
  this.io = require('socket.io');
  this.socket = io.connect(serverPath, { "force new connection": true });
}
AI.prototype.flip = function(){
  if (this.cards.length > 0){return this.cards.shift();
    } else {return null;}
};

module.exports = AI;