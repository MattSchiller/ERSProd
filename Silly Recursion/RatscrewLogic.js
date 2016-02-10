function ServerPlayer(socket, name, id, color) {
    this.socket = socket;
    this.name = name;
    this.cards = [];
    this.color = color;
    this.id = id;
    this.ready=false;
  }
ServerPlayer.prototype.flip = function(){
  if (this.cards.length > 0){return this.cards.shift();
    } else {return null;}
};

function ClientPlayer(id, name, cards, color, index){
  this.name=name; this.id=id; this.cards=cards; this.color=color; this.index=index;
}

function PileCard(card, playerIndex){
  this.card=card;
  this.index=playerIndex;
}

function DeckOfCards(primer) {
  //The deck of cards and everything it does
  this.cards = primer;
}
DeckOfCards.prototype.make = function (){
    var ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"]; //J-A = 11-14
    var suits = ["C", "D", "H", "S"];
    cards = this.cards;
    for (var i=0;i<suits.length;i++){
      for (var j=0;j<ranks.length;j++){
        cards.push(ranks[j]+suits[i]);
      }
    }
  };
DeckOfCards.prototype.shuffle = function (n){
    var temp, foundCard, i, z;
    for (z=0;z<n;z++){
      for (i=0; i<this.cards.length;i++){
        foundCard = Math.floor(Math.random()*this.cards.length);
        temp = this.cards[foundCard];
        this.cards[foundCard] = this.cards[i];
        this.cards[i]=temp;
      }
    }
  };
DeckOfCards.prototype.deal =  function(){
    if (this.cards.length > 0){return this.cards.shift();
    } else {return null;}
  };
DeckOfCards.prototype.dealCards= function(players){
  var j = 0;
  this.shuffle(10);
  while (this.cards.length > 0 && players.length) {
    players[j].cards.push(this.deal());
    if (j == players.length-1){j = 0;} else {j++;}
  }
  console.log("Allocated deck");
};

function RS () {
  this.currPlayer=undefined;
  this.centerPile=[];
  this.penaltyPile=[];
  this.faceCounter=undefined;
  this.faceOff=undefined;
  this.facePlayer=undefined;
  this.clearDelay=undefined;
  this.slapIntrusion=undefined;
  this.flipLock=undefined;
  this.players=[];
  this.availableIDs=[];
  this.winner=false;
  this.openSeat="[Open Seat]";
  this.maxPlayers=4;
  this.gameRunning=undefined;
  this.prepRatscrew();
  this.AI = require('./AI.js');
}

RS.prototype.checkWinner=function(){
  //Checks for winner and sets global variable to winner's number
  var cardTotal=0;            //To allow for multi-deck support
  for(var z=0;z<this.players.length;z++){
    cardTotal+=this.players[z].cards.length;
  }
  z=0; var found=false;
  while (z<this.players.length && found===false){
    //console.log("players[",z,"].length:",players[z].length,"cardTotal:",cardTotal);
    if (this.players[z].cards.length===cardTotal) found=true;
    else z++;
  }
  if (found) {
    this.winner=this.players[z].socket;
    console.log("Winner found!");
  }
  //MAYBE ADD IN AN EVENT GENERATOR IN HERE TO BUBBLE UP THE WINNER TO THE SERVER
};
RS.prototype.nextPlayer=function(){
  var originalPlayer=this.currPlayer;
  do {
    this.currPlayer++;
    if (this.currPlayer>this.players.length-1) this.currPlayer=0;
    if (this.players[this.currPlayer]===undefined || (this.players[this.currPlayer].cards.length===0)) continue;
    else {break;}
  } while (originalPlayer!==this.currPlayer);
  this.checkWinner();
};
RS.prototype.handleAITurn=function(callBack){
  var that=this;
  if (!this.winner && this.players[this.currPlayer].socket===null) {      //It's AI's turn
//    setTimeout(function(){
      callBack({
        check: true,
        action: that.flip(null)
      });
      return {check:true};
//    }, 1200);
  } else return {check: false}
  
};
RS.prototype.nextGoodID=function(){
  for(var z=0;z<this.availableIDs.length;z++){
    if (this.availableIDs[z]===true){
      return z;}
  }
  return false;
};
RS.prototype.findIndex=function(socket){
  for (var z=0;z<this.players.length;z++){
    if (this.players[z].socket===socket) return z;
  }
  return false;
};

RS.prototype.flip=function(socket){
  if (!this.gameRunning) return;
  var num = this.findIndex(socket), returnMsg="",
      clear=false, clearPlayer;
  if (this.currPlayer !== num || this.flipLock){     //Fliplock prevents someone from over-flipping before a clear comes through
      console.log("Not that player's turn, though. Ignoring.");
      return {msg:returnMsg, clear:clear, clearPlayer:clearPlayer};
    }
  var temp = this.players[num].flip();
  if (temp===null) {                    //It's their turn and they have no cards, but need to flip, they lose
    returnMsg='has no more cards to flip!';
    clear=true;
    clearPlayer=this.facePlayer;
    this.nextPlayer();
  } else {
    this.slapIntrusion=false;                //Allowing the game to clear on face values again
    console.log("Pushing",temp);
    this.centerPile.push(new PileCard(temp, num));
    console.log("faceOff:",this.faceOff,"faceValue:",this.faceValue(temp));
    if (this.faceValue(temp)) {
      var triesOrTry=' tries';
      this.faceOff=true;
      this.faceCounter=this.faceValue(temp);
      if (this.faceCounter===1) triesOrTry=' try';
      this.facePlayer=num;
      this.nextPlayer();
      returnMsg="has flipped a face card, "+this.players[this.currPlayer].name+" has "+this.faceCounter+triesOrTry+" to also hit a face card.";
    } else if (this.faceOff==true){      //Flipped non-face, but player's on the hook for a face card
      this.faceCounter--;
      if (this.faceCounter===0){         //currPlayer just lost
        console.log(this.players[this.currPlayer].name+" has lost the pile");
        console.log(this.players[this.facePlayer].name+" has won the pile");
        this.currPlayer=this.facePlayer;
        clear=true;
        clearPlayer=this.facePlayer;
        this.faceOff=false;
        this.flipLock=true;
        returnMsg='is losing the pile to face cards.';
      } else {
        var triesOrTry=' tries';
        if (this.faceCounter===1) triesOrTry=' try';
        returnMsg="has "+this.faceCounter+triesOrTry+" to also hit a face card."}
    } else {
      this.nextPlayer();
      returnMsg="flips...";
    }
  }
  this.checkWinner();
  console.log("Post flip, curr:",this.currPlayer);
  return {
    msg: returnMsg,
    clear: clear,
    clearPlayer: clearPlayer
  };
};
RS.prototype.slap=function(socket){
  var len = this.centerPile.length; slapSuccess=false, slapReason="",
      useDoubles = useSandwich = useFlush = useStraight = useBottomStack = true,
      num = this.findIndex(socket);
  if (!this.gameRunning) return {success:slapSuccess, msg:""};
  if (len===0){                                                       //probably a lag mistake
    console.log("Probably a lag mistake. Ignoring.");
    return {success:slapSuccess, msg:""};
  } else if (len===1){                                                //Not enough cards to slap
    console.log("Not enough cards to slap");
    slapSuccess=false;
  } else if (this.faceOff==true && this.faceCounter==0 && num==this.facePlayer){     //slapping player has won the pile anyway
      slapReason="face cards";
      slapSuccess=true;
  } else {
    var top = this.centerPile[len-1].card;
    var second = this.centerPile[len-2].card;
    if (useDoubles && this.getRank(top)==this.getRank(second)){                 //doubles
      slapReason="double";
      slapSuccess=true;
    } else if (len > 2) {//can have triplet rules
      var third = this.centerPile[len-3].card;
      if (useSandwich && this.getRank(top)==this.getRank(third)){               //sandwich
        slapReason="sandwich";
        slapSuccess=true;
      } else if (useFlush && this.checkFlush(top, second, third)){         //flush
        slapReason="flush";
        slapSuccess=true;
      } else if (useStraight && this.checkStraight(top, second, third)){ //straight
        slapReason="straight";
        slapSuccess=true;
      } else if (useBottomStack && this.getRank(top)==this.getRank(this.centerPile[0].card)){//bottom-stack
        slapReason="bottom-stack";
        slapSuccess=true;
      }
    }
  }
  if (slapSuccess===false) {
    console.log("Slap, but nothing found. Initiating penalty");
    this.doPenalty(num);
    this.checkWinner()
    return {success:slapSuccess, msg:"slaps, but finds nothing! Two cards to the center!"};
  } else {
    this.slapIntrusion=true;                                               //Will block a face clear
    this.flipLock=true;
    console.log("Slap successful on", slapReason);
    this.currPlayer=num;
    this.faceOff=false;
    this.checkWinner()
    return {success:slapSuccess, msg:"slaps and finds a "+slapReason+"!"};
  }
};

//Card logic
RS.prototype.getSuit=function(card){return card.slice(-1);};
RS.prototype.getRank=function(card){return parseInt(card.slice(0, card.length-1));};
RS.prototype.convertAce=function(card){
  if (card===14){
    return 1;
  } else {return card;}
};
RS.prototype.checkFlush=function(card1, card2, card3){return (this.getSuit(card1)===this.getSuit(card2) && this.getSuit(card2)===this.getSuit(card3));};
RS.prototype.faceValue=function(card){if (this.getRank(card)>10){return this.getRank(card)-10;} else {return false;}};
RS.prototype.checkStraight=function(card1, card2, card3){
  card1 = this.getRank(card1); card2 = this.getRank(card2); card3 = this.getRank(card3);
  if ((card1==card2+1 && card2==card3+1) || (card1==card2-1 && card2==card3-1)){
    return true;
  } else if ( (card1==14 || card2==14 || card3==14) &&     //aces low handling, no wrap
    ( (this.convertAce(card1)==this.convertAce(card2)+1 && this.convertAce(card2)==this.convertAce(card3)+1) ||
      (this.convertAce(card1)==this.convertAce(card2)-1 && this.convertAce(card2)==this.convertAce(card3)-1) ) ){
    return true;
  } else {return false;}
};
RS.prototype.doPenalty=function(num){
//On an unsuccessful slap, removes the top X cards to penalty
  var penaltyNum = 2, temp;
  console.log("Penalty on:",this.players[num].name);
  if (this.players[num].cards.length===0) {
      console.log("Player has no cards to lose");
      return;
  }
  for(var z=0;z<penaltyNum;z++){
    temp = this.players[num].flip()
    this.penaltyPile.push(new PileCard(temp, num));
    if (this.players[num].cards.length===0) {
      console.log("Player has flipped out his deck in penalty");
      if (this.currPlayer===num) this.nextPlayer();     //Player is out of cards from penalty, but we need to advance the game
      break;
    }
  }
};

RS.prototype.clearCenter=function(num, clearType, callBackFnc){
//Empties the center area and pushes the cards into another player's stack
  //console.log("In gL.clearCenter",num,clearType,callBackFnc);
  var delay, clearSuccess=false, callBack=callBackFnc, that=this;
  if (clearType=='Slap') delay=0;
  else delay=this.clearDelay;
  setTimeout(function(){
    if (that.slapIntrusion===false || clearType=='Slap') {             //Allows a user to slap in before a scoop and cancel the previous clear
      var centerCards = that.centerPile.map(function(pileCard) {return pileCard.card;});
      var penaltyCards = that.penaltyPile.map(function(pileCard) {return pileCard.card;});
      that.players[num].cards=that.players[num].cards.concat(centerCards);
      that.players[num].cards=that.players[num].cards.concat(penaltyCards);
      that.centerPile = []; that.penaltyPile = [];
      that.flipLock=false;
      callBack();
    }
  }, delay);
};

RS.prototype.prepRatscrew=function(){
  //Create players, create deck, allocate piles
  this.availableIDs=[];
  this.gameRunning=false;
  for (var z=0;z<this.maxPlayers;z++){
    this.availableIDs.push(true);
  }
  console.log("Prepped Game");
};
RS.prototype.beginRatscrew=function(){
  var deck = new DeckOfCards([]);
  deck.make();
  deck.dealCards(this.players);
  this.gameRunning=true;
  this.currPlayer=0;
  this.faceOff=false;
  this.flipLock=false;
  this.slapIntrusion=false;
  this.clearDelay = 700;
  this.handleAITurn();
};

RS.prototype.curr=function(){return this.currPlayer;};
RS.prototype.center=function(){return this.centerPile;};
RS.prototype.penalty=function(){return this.penaltyPile;};
RS.prototype.gameState=function(){
  var playersToSend = [];
  for (var z=0;z<this.players.length;z++){
    playersToSend[z]= new ClientPlayer(this.players[z].id, this.players[z].name, this.players[z].cards.length, this.players[z].color, z);
  }
  return playersToSend;
};
RS.prototype.resetPlayer=function(socket){
  var myIndex=this.findIndex(socket), myName="Anonymous";
  if (myIndex===false) return;
  var playersOldCards = new DeckOfCards(this.players[myIndex].cards);
  myName=this.players[myIndex].name;
  console.log("Redistributing",myName+"'s cards")
  this.availableIDs[this.players[myIndex].id]=true;
  if (myIndex===this.currPlayer) this.nextPlayer();
  else if (myIndex===this.facePlayer) this.facePlayer=this.currPlayer;  //If you were facePlayer, you hand over ownership of the winning pile to the next player in line;
  this.players.splice(myIndex, 1);
  if (myIndex<this.currPlayer) this.currPlayer--;
  playersOldCards.dealCards(this.players);
  if (this.gameRunning) this.checkWinner();
  console.log("User: "+myName+" removed");
};
RS.prototype.assignName=function(socket, name){
  //Returns whether the player was added or not; or if the name change was successful
  //Can assign an AI player by sending a NULL socket
  var existingIndex = this.findIndex(socket),
      myID=this.nextGoodID(),
      colors = ['#4d79ff', '#00cc00', '#cc00ca','#ffcc00'];
  if (existingIndex!==false && socket!==null){               //Player is changing name
    this.players[existingIndex].name = name;
    console.log("Player",name,"updated in roster.");
    return true;
  }
  if (myID===false) {
    console.log("Player",name,"NOT added to the roster (table full).");
    return false;
  }
  this.availableIDs[myID]=false;
  if (socket) this.players.push(new ServerPlayer(socket, name, myID, colors[myID]));
  else this.players.push(new this.AI(socket, name, myID, colors[myID]));
  console.log("Player",name,"added to the roster.");
  return true;
};
RS.prototype.passReady=function(socket, readiness){
//Handles the readiness of this user and returns true or false for all ready
  this.players[this.findIndex(socket)].ready=readiness;
  if (this.players.length>1){//Let's check for table readiness
    var allReady=true, z=0;
    while (z<this.players.length && allReady==true){
      if (this.players[z].ready!==true) allReady=false;
      z++;
    }
    if (allReady) this.beginRatscrew();
    return allReady;
  } else return false;
};
RS.prototype.resetGame=function(){
  console.log("Reseting game [in gL]");
  this.centerPile = []; this.penaltyPile = []; this.players =[];
  this.currPlayer=undefined;
  this.winner=false;
  this.prepRatscrew();
};
RS.prototype.isFull=function (){
  if (this.players.length===this.maxPlayers) return true; else return false;
};
RS.prototype.isEmpty=function (){
  if (this.players.length===0) return true; else return false;
};
RS.prototype.getName=function(socket){
  if (this.findIndex(socket)===false) return 'Anonymous'
  return this.players[this.findIndex(socket)].name;
};
RS.prototype.getColor=function(socket){
  if (this.findIndex(socket)===false) return 'gray'
  return this.players[this.findIndex(socket)].color;
};
RS.prototype.getID=function(socket){
  for(var z=0;z<this.players.length;z++){
    if(this.players[z].socket==socket) return this.players[z].id;
  } return false;
};
RS.prototype.readyForReady=function(){
  if (this.gameRunning || this.players.length<=1) return false;
  return true;
};

module.exports = RS;