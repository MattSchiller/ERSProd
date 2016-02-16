function CardLogic (){
  this.getSuit = function(card){
    return card.slice(-1);
  };
  this.getRank = function(card) {
    //console.log('In getRank, card:',card);
    return parseInt(card.slice(0, card.length-1));
  };
  this._convertAce = function(card) {
    if (card===14){
      return 1;
    } else {return card;}
  };
  this.checkDoubles = function(card1, card2) {     //This code reused for sandwich & bottomstack
    return (this.getRank(card1)===this.getRank(card2));
  };
  this.checkFlush = function(card1, card2, card3) {
    return (this.getSuit(card1)===this.getSuit(card2) && this.getSuit(card2)===this.getSuit(card3));
  };
  this.checkStraight = function(card1, card2, card3) {
    card1 = this.getRank(card1); card2 = this.getRank(card2); card3 = this.getRank(card3);
    if ((card1==card2+1 && card2==card3+1) || (card1==card2-1 && card2==card3-1)){
      return true;
    } else if ( (card1==14 || card2==14 || card3==14) &&     //aces low handling, no wrap
      ( (this._convertAce(card1)==this._convertAce(card2)+1 && this._convertAce(card2)==this._convertAce(card3)+1) ||
        (this._convertAce(card1)==this._convertAce(card2)-1 && this._convertAce(card2)==this._convertAce(card3)-1) ) ){
      return true;
    } else {return false;}
  };
}

module.exports = CardLogic;