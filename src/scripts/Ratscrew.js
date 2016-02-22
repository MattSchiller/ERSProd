var socket,
    customFont = 'Orbitron, sans-serif',
    tooltipConst = 'tooltip2';

var CardCanvas = require('./Cards.js'),
    IconCanvas = require('./Icons.js'),
    Animation = require('./Animations.js');

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
          <CardImage value={card.card} color={this._findColor(card.index)} box={this.props.box} pos={i} key={i} className="card" fade={true}/>
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
    return {width:50, height:70, scale:boxScale, fadeColor:'#39B3C1'};
  },
  componentDidMount: function() {
    var myCanvas = document.getElementById(this.props.box+this.props.pos);
    this.myImage = new CardCanvas(myCanvas);
    this.myImage.drawCard(this.props.value, customFont, this.props.box, this.props.fade, this.state.fadeColor);
    console.log("Mounted card:",this.props.value);
    socket.on('clear', this._handleClear);
  },
  componentWillUnmount: function() {
    socket.removeListener('clear', this._handleClear);
  },
  _handleClear: function(data){
    if (this.props.box === 'penalty' || this.props.box === 'center'){
      console.log("I will fade:",this.props.box, this.props.value);
      this.myImage.eraseCard(data.dur);
    }
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
    if (z===this.props.gameInfo.players.length) return false; //Checking twice: once to check for null array, and then again if we made it through the whole thing
    while (z<this.props.gameInfo.players.length && this.props.gameInfo.players[z].id!==this.props.gameInfo.myPlayerID){
      z++;
    }
    if (z===this.props.gameInfo.players.length) return false;
    return z;
  },
  render: function() {
    return (
      <div>
        <br/>
        <PlayersBox players={this._transformPlayers()} curr={this.props.gameInfo.curr}/>
        <br/>
        <CardBox cards={this.props.gameInfo.penalty} players={this.props.gameInfo.players} box="penalty"/>
        <CardBox cards={this.props.gameInfo.center} players={this.props.gameInfo.players} box="center"/>
        <ReadyButton myPlayerID={this.props.gameInfo.myPlayerID} roomID={this.props.gameInfo.roomID} />
        <SitDownButton myPlayerID={this.props.gameInfo.myPlayerID} roomID={this.props.gameInfo.roomID} />
        <SelfBox player={this.props.gameInfo.players[this._findMyIndex()]} curr={this.props.gameInfo.curr} roomID={this.props.gameInfo.roomID} numPlayers={this.props.gameInfo.players.length} max={this.props.max}/>
      </div>
    );
  }
});
var PlayersBox = React.createClass({
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
  getDefaultProps: function() {
    return ({isSelf: false});
  },
  componentWillMount: function() {
    this.myID = 'player'+this.props.player.index;
  },
  render: function() {
    var spanStyle = {
      color:this.props.player.color,
      fontWeight: "bold",
      fontSize: "17pt"
      },
      amICurr="";
      console.log("curr:",this.props.curr,"player:",this.props.player);
      if(this.props.curr===this.props.player.index) {
        amICurr=" blinking";
        console.log("Added curr status to:",this.props.player.name);
      }
    return (
      <div className={this.props.className+' singlePlayer mainTheme'+amICurr} id={this.myID}>
        <EventAnimation pIndex={this.props.player.index} color={spanStyle.color} isSelf={this.props.isSelf} />
        <span style={spanStyle}>{this.props.player.name}</span>
        <br/> <span><b>Cards: </b></span><span style={{fontSize:"15pt"}}><b>{this.props.player.cards}</b></span>
      </div>
    );
  }
});
var EventAnimation = React.createClass({
  componentDidMount: function() {
    var elementID = '#'+this.props.pIndex,
        myCanvas = document.getElementById(elementID);
    this.myAnimations = new Animation(myCanvas, this.props.color, elementID, this.props.isSelf);//, , this.props.type, this.props.removal, this.props.eventID, elementID, this.props.isSelf);
    socket.on('event', this._initEvent);
    console.log("Drawing animation, type:",this.props.type,"eventID: ",this.props.eventID);
  },
  componentWillUnmount: function(){
    socket.removeEventListener('event', this._initEvent);
  },
  _initEvent: function(event){
    if (event.index===this.props.pIndex) {
      console.log("Adding",event.type,"to player:",this.props.pIndex);
      this.myAnimations.add(event.type);
    }
  },
  render: function() {
    return (
      <canvas id={'#'+this.props.pIndex} className='animation'/>
      );
  }
});

var SelfBox = React.createClass({
  render: function() {
    if (this.props.player===undefined) return <div />;
    return (
      <div className='self'>
        <SinglePlayer player={this.props.player} curr={this.props.curr} className='mainTheme' isSelf={true}/>
        <Settings roomID={this.props.roomID} numPlayers={this.props.numPlayers} idVal='settings' max={this.props.max}/>
      </div>
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
        <GameTable gameInfo={this.props} max={this.props.max}/>
        <Chat players={this.props.players} roomID={this.props.roomID} />
        <Rules rules={this.props.rules} roomID={this.props.roomID} />
      </div>
    );//
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
            roomID:undefined,
            rules: {doubles:true, sandwich:true, flush:true, straight:true, bottomStack:true}
            };
  },
  componentDidMount: function() {
    socket.on('roomsList', this._updateRoomsList);
    socket.on('gameState', this._updateGameState);
    socket.on('id', this._updatePlayerID);
  },
  componentWillUnmount: function() {
    socket.removeEventListener('roomsList', this._updateRoomsList);
    socket.removeEventListener('gameState', this._updateGameState);
    socket.removeEventListener('id', this._updatePlayerID);
  },
  _updateGameState: function(data){
    console.log("Received gamestate update");
    console.log(data);
    this.setState({players:data.players, curr:data.curr, penalty:data.penalty, center:data.center, roomID:data.roomID, rules:data.rules});
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
      var roomMax=this.state.roomsList[0].max;
      return (
        <div>
          <RoomBox roomsList={this.state.roomsList} myRoom={this.state.roomID} />
          <SingleRoom players={this.state.players} curr={this.state.curr} penalty={this.state.penalty} center={this.state.center} roomID={this.state.roomID}
            myPlayerID={this.state.myPlayerID} rules={this.state.rules} max={roomMax}/>
        </div>
        );
    }
  }
})
var RoomBox = React.createClass({
  getInitialState: function() {
    return ({open:false});
  },
  _toggleMenu: function() {
    this.setState({open:!this.state.open});
  },
  _findMyRoomName: function() {
    var z=0, foundRoom='Rooms List';
    while (z<this.props.roomsList.length && foundRoom==='Rooms List'){
      //console.log("z:",z,"this.props.roomsList[z]:",this.props.roomsList[z]);
      if (this.props.roomsList[z].id===this.props.myRoom && this.props.myRoom) foundRoom=this.props.roomsList[z].name;
      z++;
    }
    return foundRoom;
  },
  render: function(){
    var allRooms=[],
        startClass=' blinking';
    if (this.props.myRoom!==undefined) startClass='';
    allRooms.push(<Room name={"New Room"} playerDisplay={""} isMyRoom={this.props.myRoom===undefined} isOpen={this.state.open} key={-1}/>);
    allRooms.push(this.props.roomsList.map(function(room,i) {
      return(
        <Room name={room.name} id={room.id} playerDisplay={"["+room.numPlayers+"/"+room.max+"]"} isMyRoom={this.props.myRoom===room.id} isOpen={this.state.open} key={i}/>
      );
    }.bind(this))
    );
    return (
      <div className={"roomBox mainTheme darkerNeutral"+startClass} onClick={this._toggleMenu} >
        {this._findMyRoomName()}
        {allRooms}
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
    if (!this.props.isOpen) return (<div/>);
    if (this.props.isMyRoom) addMyRoomClass=" currRoom";
    return (
      <div className={"room mainTheme"+addMyRoomClass} onClick={this._sendRoomSelection}>
        {this.props.name}   {this.props.playerDisplay}
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
    //console.log("Emptying chat:", this.state);
    if (nextProps.roomID!==this.props.roomID) {
      var nextMessages=this.state.messages;
      nextMessages.push(this.state.messages[0]);
      this.setState({messages:nextMessages});
    }
  },
  render: function() {
    var showMeClass='chat ';
    if (this.state.shown===false) showMeClass='chatHide ';
    return (
      <div className={showMeClass+"mainTheme"}>
        <div className={'messages'}>
          {
            this.state.messages.map(function(message,i) {
              return (
                <Message message={message} key={i}/>
              );
            })
          }
        </div>
        <input id={"chatInput"} type={"text"} className={"chatInput mainTheme"} placeholder={"Trash talk goes here..."} onKeyPress={this._handleSubmit}/>
        <ChatHandle swapState={this._swapState} shown={this.state.shown}/>
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
        <input id="nameBox" type={"text"} className="singlePlayer self sitDown mainTheme activeTwo" placeholder={this.state.caption} style={{color:"black"}} onKeyPress={this._handleEnter} ref="nameInput" />
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
    if (this.props.myPlayerID===false) {                    //If we don't have an ID, don't show the ready button
      this.setState({disabled:true});
      return;
    }
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
    if (this.state.disabled || (this.props.myPlayerID===false)) {
      return <div/>;
    }
    var text=" ", backColor="";
    if (!this.state.readinessToSend) {
      text=" not ";
      backColor=" notReady";
    }
    return (
      <button className={"readyButton mainTheme activeTwo"+backColor} onClick={this._handleClick}>
        {this.state.caption}{text}ready
      </button>
      );
  }
});
var Settings = React.createClass({
  getInitialState: function() {
    return {showButtons:false,
            height: 45,
            width: 45,
            color: '#39B3C1'
    };
  },
  componentDidMount: function() {
    var myCanvas = document.getElementById(this.props.idVal),
        myImage = new IconCanvas(myCanvas);
    myImage.drawSettings(this.state.color);
  },
  _toggleSettings: function() {
    this.setState({showButtons:!this.state.showButtons});
  },
  render: function() {
    var tooltipClass=tooltipConst;
    if (this.state.showButtons) tooltipClass='';
    return (
      <div>
        <div className={tooltipClass} data-title='Settings' title-width='150px'>
          <canvas id={this.props.idVal} className={this.props.idVal} height={this.state.height} width={this.state.width} onClick={this._toggleSettings}/>
        </div>
        <div className='subSettings'>
          <StandUpButton roomID={this.props.roomID} showMe={this.state.showButtons} height={this.state.height*0.75} width={this.state.width*0.75}/>
          <AIButton roomID={this.props.roomID}  numPlayers={this.props.numPlayers} showMe={this.state.showButtons} color={this.state.color}
            height={this.state.height*0.9} width={this.state.width*0.9} cb={this._toggleSettings} max={this.props.max}/>
        </div>
      </div>
    );
  }
})
var StandUpButton = React.createClass({
  getInitialState: function() {
    return {caption: 'X',
            color: '#E68A00',
            idVal:'standUp',
            fontSize: 22.5
    };
  },
  componentWillReceiveProps: function(nextProps) {
    var myCanvas=document.getElementById(this.state.idVal),
        myImage = new IconCanvas(myCanvas);
    if (nextProps.showMe) myImage.drawSubSettings(this.state.caption, this.state.color, this.state.fontSize, customFont, 0);
    else myImage.clear();
  },
  _sendStandUp: function() {
    console.log("Sending stand up notice");
    socket.emit('standUp', {roomID: this.props.roomID});
  },
  render: function() {
    var myClass = this.state.idVal,
        tooltipClass = tooltipConst;
    if (!this.props.showMe) {
      myClass='';
      tooltipClass = '';
    }
    return (
      <div className={tooltipClass} data-title='Leave game' title-width='200px'>
        <canvas id={this.state.idVal} height={this.props.height} width={this.props.width} onClick={this._sendStandUp} className={myClass} />
      </div>
    );
  }
});
var AIButton = React.createClass({
  getInitialState: function() {
    return {difficulty:'hard',
            aiLevels: [['easy','green'], ['medium','yellow'], ['hard','orange'], ['brutal','red']],
            showAIs: false,
            caption: 'AI',
            idVal: 'AI',
            fontSize: 25.3
    };
  },
  componentWillReceiveProps: function(nextProps) {
    var myCanvas=document.getElementById(this.state.idVal),
        myImage = new IconCanvas(myCanvas);
    if (nextProps.numPlayers<this.props.max && nextProps.showMe) myImage.drawSubSettings(this.state.caption, nextProps.color, this.state.fontSize, customFont, 0);
    else myImage.clear()
  },
  _showAIs: function(){
    if (!this.props.showMe) return;
    this.setState({showAIs:!this.state.showAIs});
  },
  _toggleSubSettings: function() {
    this._showAIs();
    this.props.cb();
  },
  render: function() {
    var myClass = this.state.idVal,
        tooltipClass = tooltipConst;
    if (this.state.showAIs || this.props.numPlayers >= this.props.max || !this.props.showMe) tooltipClass='';
    if (this.props.numPlayers >= this.props.max || !this.props.showMe) {
      myClass='';
      tooltipClass='';
    }
    return (
      <div>
        <div className={tooltipClass} data-title='Add AI Player' title-width='400px'>
          <canvas id={this.state.idVal} height={this.props.height} width={this.props.width} onClick={this._showAIs} className={myClass} />
        </div>
        <div className={'aiLevels'}>{
          this.state.aiLevels.map(function(level,i) {
            var rank;
            switch (i){
              case 0: rank='I'; break;
              case 1: rank='II'; break;
              case 2: rank='III'; break;
              case 3: rank='IIII'; break;
            };
            return (
              <AIDifficulty difficulty={level[0]} color={level[1]} key={i} rank={rank} height={this.props.height*0.9} roomID={this.props.roomID}
                width={this.props.width*0.9} cb={this._toggleSubSettings} fontSize={this.state.fontSize*0.9} showMe={(this.state.showAIs && this.props.showMe)} />
            );
          }.bind(this) )
        }</div>
      </div>
    );
  }
});
var AIDifficulty = React.createClass({
  componentWillReceiveProps: function(nextProps) {
    var myCanvas=document.getElementById(nextProps.difficulty),
        myImage = new IconCanvas(myCanvas);
    if (nextProps.showMe) myImage.drawSubSettings(nextProps.rank, nextProps.color, nextProps.fontSize, customFont, 0);
    else myImage.clear();
  },
  _sendAIRequest: function() {
    if (!this.props.showMe) return;
    console.log("Requesting an AI player, difficulty:",this.props.difficulty);
    this.props.cb();
    socket.emit('addAI', {roomID:this.props.roomID, difficulty:this.props.difficulty});
  },
  render: function() {
    var myClass = this.props.difficulty,
        tooltipClass = tooltipConst;
    if (!this.props.showMe) {
      myClass='';
      tooltipClass='';
    }
    return (
      <div className={tooltipClass} data-title={this.props.difficulty} title-width='330px'>
        <canvas id={this.props.difficulty} height={this.props.height} width={this.props.width} onClick={this._sendAIRequest} className={myClass} />
      </div>
    );
  }
});
var Rules = React.createClass({
  getInitialState: function() {
    return {showRules:false,
            height:60,
            width: 60,
            color: '#39B3C1',
            fontSize: 45
    };
  },
  componentDidMount: function() {
    var myCanvas = document.getElementById('rulesIcon'),
        myImage = new IconCanvas(myCanvas);
    myImage.drawSubSettings('?', this.state.color, this.state.fontSize, customFont, -0.05);
    window.addEventListener('ruleChange', this._sendRules);
  },
  _toggleRules: function() {
    this.setState({showRules:!this.state.showRules});
  },
  _hideRules: function() {
    this.setState({showRules:false});
  },
  _sendRules: function(e) {
    console.log("Rule listener triggered", e.detail);
    socket.emit('rule', {rule:e.detail, roomID:this.props.roomID});
  },
  render: function() {
    return (
      <div>
        <div className='rulesBox tooltip' data-title='Click for rules'>
          <canvas id='rulesIcon' className='rulesIcon' height={this.state.height} width={this.state.width} onClick={this._toggleRules}/>
        </div>
        <RulesModal willShowMe={this.state.showRules} hide={this._hideRules} rules={this.props.rules} roomID={this.props.roomID}/>
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
      var ruleOff='ruleOff', doublesClass='', sandwichClass='', flushClass='', straightClass='', bottomStackClass='';
      if (this.props.rules.doubles===false) doublesClass=ruleOff;
      if (this.props.rules.sandwich===false) sandwichClass=ruleOff;
      if (this.props.rules.flush===false) flushClass=ruleOff;
      if (this.props.rules.straight===false) straightClass=ruleOff;
      if (this.props.rules.bottomStack===false) bottomStackClass=ruleOff;
      return (//onClick={this.props.hide} onBlur={this.props.hide}
        <div className={'rulesModal mainTheme'} >
          <span style={{fontSize:"17pt"}}><u><b>Rules of Egyptian Ratscrew:</b></u></span>
          <ul>
            <li>The point of the game is to get all the cards.
            </li> <br/> <li>Players have two actions: <ul>
            <li>On their turn, flip a card: <span className="controls">[TAB]</span>
            </li> <li>At any time, slap: <span className="controls">[SPACEBAR]</span>
            </li> </ul> <br/>
            </li><li>Starting with the first player to sit down, players flip the top card off their pile and place it face-up in the middle. If the card played is a number card, the next player puts down a card, too. This continues around the table until somebody puts down a <span className='controls'>face card (J, Q, K, or A)</span>.
            </li> <br/> <li>When a face card (Aces are face cards!) is played, the next person in the sequence must flip another face card in the alloted number of chances in order for play to continue.
            </li> <br/> <li> <span className='controls'> Chances provided:<ul>
                <li>J -> 1</li>
                <li>Q -> 2</li>
                <li>K -> 3</li>
                <li>A -> 4</li> </ul> </span>
            </li> <br/> <li>If the next person in the sequence does NOT play a face card within their allotted number of chances, the person who played the last face card wins the round and all the cards in the center go to them. This pile winner begins the next round of play.
            </li> <br/> <li>The only thing that overrides the face card rule is the slap rule. If a slap pattern is present, no matter the status of the pile, the first person to slap is the winner of that round.
            </li> <br/> <li>If you slap and there is nothing to slap on, you lose two cards to the penalty pile (that the next pile winner will collect).
            </li> </ul> <p> <span className='controls'> <u>Slappable Patterns:</u> <em>(click to toggle each rule on/off)</em> </span> </p> <ul><hr />
            <li> <RuleExample className={doublesClass} type='doubles' title='Doubles' caption=' any 2 cards of the same rank:' cardArray={doubles} />
              </li> <hr />
            <li><RuleExample className={sandwichClass} type='sandwich' title='Sandwich' caption=' 2 cards of the same rank with 1 card between them:' cardArray={sandwich} />
              </li><hr />
            <li><RuleExample className={flushClass} type='flush' title='Flush' caption=' 3 cards in a row of the same suit:' cardArray={flush} />
              </li><hr />
            <li><RuleExample className={straightClass} type='straight' title='Straight' caption=" 3 cards in a row of ascending or descending ranks, no 'Ace wrap-a-rounds':" cardArray={straight} />
              </li><hr />
            <li><RuleExample className={bottomStackClass} type='bottomStack' title='Bottom-stack' caption=" a 'super sandwich' with the top card and the bottom card of the whole stack of the same rank:" cardArray={bottomstack} />
              </li>
          </ul>
        </div>
    )} else {
      return (<div/>)
    }
  }
});
var RuleExample= React.createClass({
  _ruleToggle: function(){
    console.log('Triggering rule change:',this.props.type);
    var event = new CustomEvent('ruleChange', {'detail': this.props.type});
    window.dispatchEvent(event);
  },
  render: function(){
    return (
      <div className={this.props.className} onClick={this._ruleToggle}>
        <span className='controls'>{this.props.title}</span>:{this.props.caption}<br/>
        {this.props.cardArray}
      </div>
      );
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