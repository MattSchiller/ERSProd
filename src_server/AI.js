//DESIGNED TO EMULATE THE SERVER-PLAYERS CLASS IN RatscrewLogic.JS

function AI (socket, name, id, color) {
  this.socket = socket;
  this.name = name+'-'+id;
  this.cards = [];
  this.color = color;
  this.id = id;
  this.ready=true;
}
AI.prototype.flip = function(){
  if (this.cards.length > 0){return this.cards.shift();
    } else {return null;}
};

module.exports = AI;