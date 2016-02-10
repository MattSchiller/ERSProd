var socket;

var CardBox = React.createClass({
  _findColor: function(index) {
    if (this.props.players[index]===undefined) return "black";
    return this.props.players[index].color;
  },
  render: function() {
    //console.log("in cardBox", this.props.box, this.props.cards);
    var myClass="centerCards";
    if (this.props.box=="penalty") myClass="penaltyCards"
    if (!this.props.cards) myCards=[];
    else{
      var myCards = this.props.cards.map(function(card, i) {
        //console.log("Creating comment with id/key:",comment.id);
        return (
          <CardImage value={card.card} color={this._findColor(card.index)} box={this.props.box} pos={i} key={i} className="card"/>
        );
      }.bind(this));
    }
    return (
      <div className={myClass}>
        {myCards}
      </div>
    );
  }
});

var CardImage = React.createClass({
  getInitialState: function() {
    var boxScale = 1;
    if (this.props.box=="penalty") boxScale = (0.7);
    else if (this.props.box=="rules") boxScale = (0.5);
    return {width:50, height:70, scale:boxScale};
  },
  componentDidMount: function() {
    var myCanvas = document.getElementById(this.props.box+this.props.pos),
        myImage = new CardCanvas(myCanvas);
    myImage.drawCard(this.props.value);
  },
  _rescaleCard: function(newScale) {
    this.setState({scale:newScale});
  },
  render: function() {
    var cardStyle = {
        borderWidth: 1.5,
        borderStyle: "solid",
        margin: "1px",
        borderColor: this.props.color,
        borderRadius: "5px",
        WebkitBoxShadow:"0 0 10px 1px "+this.props.color,
        MozBoxShadow: "0 0 10px 1px "+this.props.color,
        boxShadow: "0 0 10px 1px "+this.props.color
    };
    return (
      <canvas id={this.props.box+this.props.pos} height={this.state.height*this.state.scale} width={this.state.width*this.state.scale} style={cardStyle} />
      );
  }
});

var GameTable = React.createClass({
  _transformPlayers: function() {
    var newPlayers = [],
        z = 0,
        myIndex=this._findMyIndex(),
        newStart=myIndex+1;
    if (this.props.gameInfo.myPlayerID===false) return this.props.gameInfo.players;     //I'm not sitting down, no manipulation;
    if (newStart<this.props.gameInfo.players.length) newPlayers=newPlayers.concat(this.props.gameInfo.players.slice(newStart));
    newPlayers = newPlayers.concat(this.props.gameInfo.players.slice(0, myIndex));
    console.log("newPlayers:",newPlayers)
    return newPlayers;
  },
  _findMyIndex: function() {
    var z=0;
    if (z===this.props.gameInfo.players.length) return false;   //twice: once to check for null array, and then again if we made it through the whole thing
    while (z<this.props.gameInfo.players.length && this.props.gameInfo.players[z].id!==this.props.gameInfo.myPlayerID){
      z++;
    }
    if (z===this.props.gameInfo.players.length) return false;
    return z;
  },
  render: function() {
    return (
      <div>
        <PlayersBox players={this._transformPlayers()} curr={this.props.gameInfo.curr}/>
        <CardBox cards={this.props.gameInfo.penalty} players={this.props.gameInfo.players} box="penalty"/>
        <CardBox cards={this.props.gameInfo.center} players={this.props.gameInfo.players} box="center"/>
        <SelfBox player={this.props.gameInfo.players[this._findMyIndex()]} curr={this.props.gameInfo.curr}/>
      </div>
    );
  }
});
var PlayersBox = React.createClass({
  getInitialState: function() {
    return ({});
  },
  render: function() {
    var playerNodes = this.props.players.map(function(player,i) {
      return (
        <SinglePlayer player={player} key={i} curr={this.props.curr}/>
      );
    }.bind(this));
    return (
      <div className='PlayersBox'>
        {playerNodes}
      </div>
    );
  }
});
var SinglePlayer = React.createClass({
  render: function() {
    var spanStyle = {
      color:this.props.player.color,
      fontWeight: "bold",
      fontSize: "17pt"
      },
      amICurr="";
      console.log("curr:",this.props.curr,"player:",this.props.player);
      if(this.props.curr===this.props.player.index) {
        amICurr=" currPlayer";
        console.log("Added curr status to:",this.props.player.name);
      }
    return (
      <div className={this.props.className+' singlePlayer mainTheme theme'+amICurr}>
        <span style={spanStyle}>{this.props.player.name}</span>
        <br/> <span><b>Cards: </b></span><span style={{fontSize:"15pt"}}><b>{this.props.player.cards}</b></span>
      </div>
    );
  }
});
var SelfBox = React.createClass({
  render: function() {
    if (this.props.player===undefined) return <div />;
    return (
      <SinglePlayer player={this.props.player} curr={this.props.curr} className={'self theme mainTheme'}/>
      )
  }
});
var SingleRoom = React.createClass({
  _gameControls: function(e) {
    if (!e) e=window.event;
    var keyCode=e.keyCode || e.which;
    if (e.target.type==="text") return;                 //ignore controls in chat/name
    if (keyCode===32) {
      e.stopPropagation();
      //e.preventDefault();
      console.log("Spacebar pressed");                  //space to slap
      socket.emit('slap', {roomID:this.props.roomID});
    }
    if (keyCode===9) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Tab pressed");
      socket.emit('flip', {roomID:this.props.roomID});                              //tab to flip
      //CHECK FOR SELF TURN MAYBE. LATER
    }
  },
  componentDidMount: function(){
    socket.emit('gameReq', {roomID:this.props.roomID});
    window.addEventListener('keydown', this._gameControls);
  },
  componentWillUnmount: function(){
    window.removeEventListener('keydown', this._gameControls);
  },
  render: function() {
    return (
      <div className={"singleRoom"} >
        <GameTable gameInfo={this.props}/>
        <ReadyButton myPlayerID={this.props.myPlayerID} roomID={this.props.roomID} />
        <SitDownButton myPlayerID={this.props.myPlayerID} roomID={this.props.roomID} />
        <Chat players={this.props.players} roomID={this.props.roomID} />
        <Rules />
      </div>
    );
  }
});
var ClientUI = React.createClass({
  getInitialState: function() {
    return {players:[/*{name:"Pete",
                      color:"green",
                      num:0,
                      cards:25},
                     {name:"Jack",
                      color:"purple",
                      num:1,
                      cards:23}*/],
            penalty:[/*{card:"14S", color:"green"},
                    {card:"5D", color:"green"},*/
                    ],
            center:[/*{card:"12H", color:"green"},
                    {card:"3S", color:"purple"},
                    {card:"3D", color:"green"} */
                    ],
            myPlayerID:false,
            curr:undefined,
            roomsList: [],
            roomID:undefined
            };
  },
  componentDidMount: function() {
    socket.on('roomsList', this._updateRoomsList);
    socket.on('gameState', this._updateGameState);
    socket.on('id', this._updatePlayerID);
  },
  _updateGameState: function(data){
    console.log("Received gamestate update");
    console.log(data);
    this.setState({players:data.players, curr:data.curr, penalty:data.penalty, center:data.center, roomID:data.roomID});
  },
  _updateRoomsList: function(data){
    console.log("Received a rooms update");
    console.log(data);
    this.setState({roomsList:data.roomsList});
  },
  _updatePlayerID: function(data) {
    console.log("Received an ID update:",data.id);
    this.setState({myPlayerID:data.id});
  },
  render: function(){
    if (this.state.roomID===undefined) {
      console.log("No room yet, roomID:",this.state.roomID);
      return (
        <RoomBox roomsList={this.state.roomsList} myRoom={this.state.roomID} />
        );
    } else {
      return (
        <div>
          <RoomBox roomsList={this.state.roomsList} myRoom={this.state.roomID} />
          <SingleRoom players={this.state.players} curr={this.state.curr} penalty={this.state.penalty} center={this.state.center} roomID={this.state.roomID} myPlayerID={this.state.myPlayerID} />
        </div>
        );
    }
  }
})
var RoomBox = React.createClass({
  render: function(){
    return (
      <div className="roomBox mainTheme darkerNeutral">
        <Room name={"New Room"} playerDisplay={""} isMyRoom={this.props.myRoom===undefined}/>
        {
          this.props.roomsList.map(function(room,i) {
            return (
              <div key={i}>
              |<Room name={room.name} id={room.id} playerDisplay={room.numPlayers + "/4"} isMyRoom={this.props.myRoom===room.id} />
              </div>
            );
          }.bind(this))
        }
      </div>
      );
  }
})
var Room = React.createClass({
  _sendRoomSelection: function() {
    console.log("Attempting to change room to", this.props.id);
    if (this.props.name==="New Room") socket.emit('newRoom');
    else socket.emit('roomSelect', {roomID:this.props.id});
  },
  render: function(){
    var addMyRoomClass="";
    if (this.props.isMyRoom) addMyRoomClass=" currRoom";
    return (
      <div className={"room mainTheme"+addMyRoomClass} onClick={this._sendRoomSelection}>
        {this.props.name} {this.props.playerDisplay}
      </div>
      );
  }
})
var Chat = React.createClass({
  getInitialState: function() {
    return {shown:true, messages:[{source:'', color:'gray', message:"You've entered a new game room.", isChat:false}]};
  },
  componentDidMount: function() {
    socket.on('message', this._handleMessage);
  },
  _handleMessage: function(data) {
    console.log("Received message:",data.message);
    var currMessages = this.state.messages,
        newMessage = {source: data.source,
                      message: data.message,
                      color: this._findColor(data),
                      isChat: data.isChat
        };
    console.log("newMessage:",newMessage);
    currMessages.push(newMessage);
    this.setState({messages:currMessages});
  },
  _findColor: function(data) {
    if (data.source==='SERVER' || this.props.players[data.index]===undefined) return data.index;
    return this.props.players[data.index].color;
  },
  _handleSubmit: function(e) {
    if (!e) e = window.event;
    e.stopPropagation();                                //Disable game controls in input
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) { //Enter
      var myBox = document.getElementById("chatInput"),
          myMessage = myBox.value
      console.log("Attempting to transmit:", myMessage);
      if (myMessage!=="") {
        socket.emit('message',{msg:myMessage, roomID:this.props.roomID});
        myBox.value = "";
      }
    }
  },
  _swapState: function(){
    console.log("Swapping state of chat");
    this.setState({shown:!this.state.shown});
  },
  componentDidUpdate: function() {
    var boxToScroll = $('.messages');
    boxToScroll.scrollTop(boxToScroll.prop('scrollHeight'));
  },
  componentWillReceiveProps: function(nextProps) {
  //To empty the chat
  //  console.log("Emptying chat:", this.state);
  //  if (nextProps.roomID!==this.props.roomID) this.setState(this.getInitialState());
  },
  render: function() {
    var showMeClass='chat ';
    if (this.state.shown===false) showMeClass='chatHide ';
    return (
      <div className={showMeClass+"mainTheme theme"}>
        <ChatHandle swapState={this._swapState} shown={this.state.shown}/>
        <div className={'messages'}>
          {
            this.state.messages.map(function(message,i) {
              return (
                <Message message={message} key={i}/>
              );
            })
          }
        </div>
        <input id={"chatInput"} type={"text"} className={"chatInput mainTheme theme"} placeholder={"Trash talk goes here..."} onKeyPress={this._handleSubmit}/>
      </div>
    )
  }
});
var ChatHandle = React.createClass({
  render: function() {
    var arrows=">>";
    if (this.props.shown===false) arrows="<<";
    return (
      <div className='chatHandle light' onClick={this.props.swapState}>{arrows}</div>
      );
  }
})
var Message = React.createClass({
  render: function(){
    var msgStyle = {
          color: this.props.message.color,
          fontWeight: "bold"
        },
        tabClass = " sysMsg",
        colon = "";
    if (this.props.message.isChat) {
      tabClass="";
      colon=":";
    }
    return (
      <div className={"message"+ tabClass}>
        <span style={msgStyle}>{this.props.message.source}{colon} </span>
        <span>{this.props.message.message}</span>
      </div>
      );
  }
});
var SitDownButton = React.createClass({
  getInitialState: function() {
    return {caption:"Enter name to sit down"};
  },
  componentDidUpdate: function(){
    ReactDOM.findDOMNode(this.refs.nameInput).focus();
  },
  _handleEnter: function(e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) this._sendName();
  },
  _sendName: function() {
    var myBox = document.getElementById("nameBox");
      if (myBox.value=="" || myBox.value==this.state.caption){
        alert("You have to enter a name, SIR!"); return;
      } else {
        var myName=myBox.value;
        console.log("Thank you, your name is: "+myName);
        socket.emit("name",{"name":myName, roomID:this.props.roomID});
        console.log("Sent name: "+myName);
        this._handleFocus();
      }
  },
  _handleFocus: function() {
    console.log(" Removing focus from name entry");
    document.getElementById("nameBox").blur();
  },
  render: function(){
    if (this.props.myPlayerID===false) {
      return (
        <input id="nameBox" type={"text"} className="self sitDown mainTheme activeTwo" placeholder={this.state.caption} style={{color:"black"}} onKeyPress={this._handleEnter} ref="nameInput" />
      )
    } else return <div ref="nameInput"/>;
  }
});
var ReadyButton = React.createClass({
  getInitialState: function() {
    return {disabled:true,
            caption:"Click me if you are",
            readinessToSend:true
    };
  },
  componentDidMount: function() {
    socket.on('readyStatus', this._toggleButton)
  },
  _toggleButton: function(data) {
    var readinessToMaintain = true;
    if (this.props.myPlayerID===false) return;          //If we don't have an ID, don't show the ready button
    if (data.disabled===true) readinessToMaintain=false;    //If we're told to turn off the button, reset readiness to false(?)
    console.log("button disabled:",data.disabled)
    this.setState({disabled:data.disabled, readinessToSend:readinessToMaintain});
  },
  _handleClick: function() {
    console.log("Sent readiness:",this.state.readinessToSend);
    socket.emit('startReady', {readiness:this.state.readinessToSend, roomID:this.props.roomID});
    this.setState({readinessToSend:!this.state.readinessToSend});
  },
  render: function() {
    if (!this.state.disabled) {
      var text=" ", backColor="";
      if (!this.state.readinessToSend) {
        text=" not ";
        backColor=" notReady";
      }
      return (
        <button className={"readyButton mainTheme activeTwo"+backColor} onClick={this._handleClick}>
          {this.state.caption}{text}ready
        </button>
        )
    }
    return <div/>
  }
});
var Rules = React.createClass({
  getInitialState: function() {
    return {showRules:false};
  },
  _displayRules: function() {
    this.setState({showRules:true});
  },
  _hideRules: function() {
    this.setState({showRules:false});
  },
  render: function() {
    return (
      <div>
        <div className={"rulesIcon"} onClick={this._displayRules} />
        <RulesModal willShowMe={this.state.showRules} hide={this._hideRules}/>
      </div>
      );
      
  }
});
var RulesModal = React.createClass({
  getInitialState: function() {
    return {doubles:[['13H', '13C'],['5S', '5H'], ['10D', '10H']],
            sandwich: [['8D','14H','8S'], ['3H','9D','3S']],
            flush: [['2S','11S','10S'],['12D','2D','9D']],
            straight: [['10H', '11D', '12S'],['3S','2D','14C'], ['12H','13C','14D']],
            bottomstack: [['6C', '11D', '14H', '4S', '9H', '6D']]
    };
  },
  render: function() {
    if (this.props.willShowMe==true){
      var myBox="rules", doubles = [], sandwich= [], flush =[], straight = [], bottomstack = [], j=0;
      for (var z=0;z<this.state.doubles.length; z++){
        doubles.push(this.state.doubles[z].map(function(card, i) {
          return (
            <CardImage value={card} color={"black"} box={myBox} pos={i+(j*10)} key={i} className="card"/>
          );
        }) )
        doubles.push(", ");
        j++;
      }
      doubles.pop();
      for (var z=0;z<this.state.sandwich.length; z++){
        sandwich.push(this.state.sandwich[z].map(function(card, i) {
          return (
            <CardImage value={card} color={"black"} box={myBox} pos={i+(j*10)} key={i} className="card"/>
          );
        }) )
        sandwich.push(", ");
        j++;
      }
      sandwich.pop();
      for (var z=0;z<this.state.flush.length; z++){
        flush.push(this.state.flush[z].map(function(card, i) {
          return (
            <CardImage value={card} color={"black"} box={myBox} pos={i+(j*10)} key={i} className="card"/>
          );
        }) )
        flush.push(", ");
        j++;
      }
      flush.pop();
      for (var z=0;z<this.state.straight.length; z++){
        straight.push(this.state.straight[z].map(function(card, i) {
          return (
            <CardImage value={card} color={"black"} box={myBox} pos={i+(j*10)} key={i} className="card"/>
          );
        }) )
        straight.push(", ");
        j++;
      }
      straight.pop();
      for (var z=0;z<this.state.bottomstack.length; z++){
        bottomstack.push(this.state.bottomstack[z].map(function(card, i) {
          var color = 'black';
          if (i==0 || i == this.state.bottomstack[z].length-1) color='red';
          return (
            <CardImage value={card} color={color} box={myBox} pos={i+(j*10)} key={i} className="card"/>
          );
        }.bind(this) ))
        bottomstack.push(", ");
        j++;
      }
      bottomstack.pop();
      return (
        <div className={'rulesModal mainTheme theme'} onClick={this.props.hide} onBlur={this.props.hide}>
          <span style={{fontSize:"17pt"}}><u><b>Rules of Egyptian Ratscrew:</b></u></span>
          <ul>
            <li>The point of the game is to get all the cards. Players have two actions: flip <b>[TAB]</b> and slap <b>[SPACEBAR]</b>.
          </li><li>Starting with the first player to sit down, players flip the top card off their pile and place it face-up in the middle. If the card played is a number card, the next player puts down a card, too. This continues around the table until somebody puts down a face card <b>(J, Q, K, or A)</b>.
          </li><li>When a face card (aces are face cards!) is played, the next person in the sequence must flip another face card in the alloted number of chances in order for play to continue.
          </li><li><b>Chances provided: J -> 1, Q -> 2, K -> 3, A -> 4.</b>
          </li><li>If the next person in the sequence does NOT play a face card within their allotted number of chances, the person who played the last face card wins the round and the whole pile goes to them. The winner begins the next round of play.
          </li><li>The only thing that overrides the face card rule is the slap rule. If a slap pattern is present, no matter the status of the pile, the first person to slap is the winner of that round.
          </li><li>If you slap and there is nothing to slap on, you lose two cards to the penalty pile (that the next pile winner will collect).
          </li></ul><ul type={"circle"}><b><u>Slappable Patterns:</u></b>
            <li><b>Doubles</b>: any 2 cards of the same rank:</li>
            {doubles}
            <li><b>Sandwich</b>: 2 cards of the same rank with 1 card between them:</li>
            {sandwich}
            <li><b>Flush</b>: 3 cards in a row of the same suit:</li>
            {flush}
            <li><b>Straight</b>: 3 cards in a row of ascending or descending ranks, no 'Ace wrap-a-rounds':</li>
            {straight}
            <li><b>Bottom-stack</b>: a 'super sandwich' with the top card and the bottom card of the whole stack of the same rank:</li>
            {bottomstack}
          </ul>
        </div>
    )} else {
      return (<div/>)
    }
  }
});

socket = io.connect();

ReactDOM.render(
  <ClientUI />,
  document.getElementById('content')
);

socket.on('fullTable', function(data){
  //No room to sit down
  console.log("Received a fullTable msg from server");
  alert("Sorry, this table is full right now.");
});