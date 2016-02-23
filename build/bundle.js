/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var socket,
	    customFont = 'Orbitron, sans-serif',
	    tooltipConst = 'tooltip2';

	var CardCanvas = __webpack_require__(2),
	    IconCanvas = __webpack_require__(3),
	    Animation = __webpack_require__(4);

	var CardBox = React.createClass({
	  displayName: 'CardBox',

	  _findColor: function _findColor(index) {
	    if (this.props.players[index] === undefined) return "black";
	    return this.props.players[index].color;
	  },
	  render: function render() {
	    //console.log("in cardBox", this.props.box, this.props.cards);
	    var myClass = "centerCards";
	    if (this.props.box == "penalty") myClass = "penaltyCards";
	    if (!this.props.cards) myCards = [];else {
	      var myCards = this.props.cards.map(function (card, i) {
	        //console.log("Creating comment with id/key:",comment.id);
	        return React.createElement(CardImage, { value: card.card, color: this._findColor(card.index), box: this.props.box, pos: i, key: i, className: 'card', fade: true });
	      }.bind(this));
	    }
	    return React.createElement('div', { className: myClass }, myCards);
	  }
	});
	var CardImage = React.createClass({
	  displayName: 'CardImage',

	  getInitialState: function getInitialState() {
	    var boxScale = 1;
	    if (this.props.box == "penalty") boxScale = 0.7;else if (this.props.box == "rules") boxScale = 0.5;
	    return { width: 50, height: 70, scale: boxScale, fadeColor: '#39B3C1' };
	  },
	  componentDidMount: function componentDidMount() {
	    var myCanvas = document.getElementById(this.props.box + this.props.pos);
	    this.myImage = new CardCanvas(myCanvas);
	    this.myImage.drawCard(this.props.value, customFont, this.props.box, this.props.fade, this.state.fadeColor);
	    console.log("Mounted card:", this.props.value);
	    socket.on('clear', this._handleClear);
	  },
	  componentWillUnmount: function componentWillUnmount() {
	    socket.removeListener('clear', this._handleClear);
	  },
	  _handleClear: function _handleClear(data) {
	    if (this.props.box === 'penalty' || this.props.box === 'center') {
	      console.log("I will fade:", this.props.box, this.props.value);
	      this.myImage.eraseCard(data.dur);
	    }
	  },
	  render: function render() {
	    var cardStyle = {
	      borderWidth: 1.5,
	      borderStyle: "solid",
	      margin: "1px",
	      borderColor: this.props.color,
	      borderRadius: "5px",
	      WebkitBoxShadow: "0 0 10px 1px " + this.props.color,
	      MozBoxShadow: "0 0 10px 1px " + this.props.color,
	      boxShadow: "0 0 10px 1px " + this.props.color
	    };
	    return React.createElement('canvas', { id: this.props.box + this.props.pos, height: this.state.height * this.state.scale, width: this.state.width * this.state.scale, style: cardStyle });
	  }
	});
	var GameTable = React.createClass({
	  displayName: 'GameTable',

	  _transformPlayers: function _transformPlayers() {
	    var newPlayers = [],
	        z = 0,
	        myIndex = this._findMyIndex(),
	        newStart = myIndex + 1;
	    if (this.props.gameInfo.myPlayerID === false) return this.props.gameInfo.players; //I'm not sitting down, no manipulation;
	    if (newStart < this.props.gameInfo.players.length) newPlayers = newPlayers.concat(this.props.gameInfo.players.slice(newStart));
	    newPlayers = newPlayers.concat(this.props.gameInfo.players.slice(0, myIndex));
	    console.log("newPlayers:", newPlayers);
	    return newPlayers;
	  },
	  _findMyIndex: function _findMyIndex() {
	    var z = 0;
	    if (z === this.props.gameInfo.players.length) return false; //Checking twice: once to check for null array, and then again if we made it through the whole thing
	    while (z < this.props.gameInfo.players.length && this.props.gameInfo.players[z].id !== this.props.gameInfo.myPlayerID) {
	      z++;
	    }
	    if (z === this.props.gameInfo.players.length) return false;
	    return z;
	  },
	  render: function render() {
	    return React.createElement('div', null, React.createElement('br', null), React.createElement(PlayersBox, { players: this._transformPlayers(), curr: this.props.gameInfo.curr }), React.createElement('br', null), React.createElement('br', null), React.createElement(CardBox, { cards: this.props.gameInfo.penalty, players: this.props.gameInfo.players, box: 'penalty' }), React.createElement(CardBox, { cards: this.props.gameInfo.center, players: this.props.gameInfo.players, box: 'center' }), React.createElement(ReadyButton, { myPlayerID: this.props.gameInfo.myPlayerID, roomID: this.props.gameInfo.roomID }), React.createElement(SitDownButton, { myPlayerID: this.props.gameInfo.myPlayerID, roomID: this.props.gameInfo.roomID }), React.createElement(SelfBox, { player: this.props.gameInfo.players[this._findMyIndex()], curr: this.props.gameInfo.curr, roomID: this.props.gameInfo.roomID, numPlayers: this.props.gameInfo.players.length, max: this.props.max }));
	  }
	});
	var PlayersBox = React.createClass({
	  displayName: 'PlayersBox',

	  render: function render() {
	    var playerNodes = this.props.players.map(function (player, i) {
	      return React.createElement(SinglePlayer, { player: player, key: i, curr: this.props.curr });
	    }.bind(this));
	    return React.createElement('div', { className: 'PlayersBox' }, playerNodes);
	  }
	});
	var SinglePlayer = React.createClass({
	  displayName: 'SinglePlayer',

	  getDefaultProps: function getDefaultProps() {
	    return { isSelf: false };
	  },
	  componentWillMount: function componentWillMount() {
	    this.myID = 'player' + this.props.player.index;
	  },
	  render: function render() {
	    var spanStyle = {
	      color: this.props.player.color,
	      fontWeight: "bold",
	      fontSize: "17pt"
	    },
	        amICurr = "";
	    console.log("curr:", this.props.curr, "player:", this.props.player);
	    if (this.props.curr === this.props.player.index) {
	      amICurr = " blinking";
	      console.log("Added curr status to:", this.props.player.name);
	    }
	    return React.createElement('div', { className: this.props.className + ' singlePlayer mainTheme' + amICurr, id: this.myID }, React.createElement(EventAnimation, { pIndex: this.props.player.index, color: spanStyle.color, isSelf: this.props.isSelf, myID: 'plyr' + this.props.player.index }), React.createElement('span', { style: spanStyle }, this.props.player.name), React.createElement('br', null), ' ', React.createElement('span', null, React.createElement('b', null, 'Cards: ')), React.createElement('span', { style: { fontSize: "15pt" } }, React.createElement('b', null, this.props.player.cards)));
	  }
	});
	var EventAnimation = React.createClass({
	  displayName: 'EventAnimation',

	  componentDidMount: function componentDidMount() {
	    var myCanvas = document.getElementById(this.props.myID);
	    this.myAnimations = new Animation(myCanvas, this.props.color, this.props.isSelf); //, , this.props.type, this.props.removal, this.props.eventID, elementID, this.props.isSelf);
	    socket.on('event', this._initEvent);
	    console.log("Drawing animation, type:", this.props.type, "eventID: ", this.props.eventID);
	  },
	  componentWillUnmount: function componentWillUnmount() {
	    socket.removeEventListener('event', this._initEvent);
	  },
	  _initEvent: function _initEvent(event) {
	    if (event.index === this.props.pIndex) {
	      console.log("Adding", event.type, "to player:", this.props.pIndex);
	      this.myAnimations.add(event.type);
	    }
	  },
	  render: function render() {
	    return React.createElement('canvas', { id: this.props.myID, className: 'animation', width: 200, height: 100 });
	  }
	});

	var SelfBox = React.createClass({
	  displayName: 'SelfBox',

	  render: function render() {
	    if (this.props.player === undefined) return React.createElement('div', null);
	    return React.createElement('div', { className: 'self' }, React.createElement(SinglePlayer, { player: this.props.player, curr: this.props.curr, className: 'mainTheme', isSelf: true }), React.createElement(Settings, { roomID: this.props.roomID, numPlayers: this.props.numPlayers, idVal: 'settings', max: this.props.max }));
	  }
	});
	var SingleRoom = React.createClass({
	  displayName: 'SingleRoom',

	  _gameControls: function _gameControls(e) {
	    if (!e) e = window.event;
	    var keyCode = e.keyCode || e.which;
	    if (e.target.type === "text") return; //ignore controls in chat/name
	    if (keyCode === 32) {
	      e.stopPropagation();
	      //e.preventDefault();
	      console.log("Spacebar pressed"); //space to slap
	      socket.emit('slap', { roomID: this.props.roomID });
	    }
	    if (keyCode === 9) {
	      e.preventDefault();
	      e.stopPropagation();
	      console.log("Tab pressed");
	      socket.emit('flip', { roomID: this.props.roomID }); //tab to flip
	      //CHECK FOR SELF TURN MAYBE. LATER
	    }
	  },
	  componentDidMount: function componentDidMount() {
	    socket.emit('gameReq', { roomID: this.props.roomID });
	    window.addEventListener('keydown', this._gameControls);
	  },
	  componentWillUnmount: function componentWillUnmount() {
	    window.removeEventListener('keydown', this._gameControls);
	  },
	  render: function render() {
	    return React.createElement('div', { className: "singleRoom" }, React.createElement(GameTable, { gameInfo: this.props, max: this.props.max }), React.createElement(Chat, { players: this.props.players, roomID: this.props.roomID }), React.createElement(Rules, { rules: this.props.rules, roomID: this.props.roomID })); //
	  }
	});
	var ClientUI = React.createClass({
	  displayName: 'ClientUI',

	  getInitialState: function getInitialState() {
	    return { players: [/*{name:"Pete",
	                        color:"green",
	                        num:0,
	                        cards:25},
	                       {name:"Jack",
	                        color:"purple",
	                        num:1,
	                        cards:23}*/],
	      penalty: [/*{card:"14S", color:"green"},
	                {card:"5D", color:"green"},*/
	      ],
	      center: [/*{card:"12H", color:"green"},
	               {card:"3S", color:"purple"},
	               {card:"3D", color:"green"} */
	      ],
	      myPlayerID: false,
	      curr: undefined,
	      roomsList: [],
	      roomID: undefined,
	      rules: { doubles: true, sandwich: true, flush: true, straight: true, bottomStack: true }
	    };
	  },
	  componentDidMount: function componentDidMount() {
	    socket.on('roomsList', this._updateRoomsList);
	    socket.on('gameState', this._updateGameState);
	    socket.on('id', this._updatePlayerID);
	  },
	  componentWillUnmount: function componentWillUnmount() {
	    socket.removeEventListener('roomsList', this._updateRoomsList);
	    socket.removeEventListener('gameState', this._updateGameState);
	    socket.removeEventListener('id', this._updatePlayerID);
	  },
	  _updateGameState: function _updateGameState(data) {
	    console.log("Received gamestate update");
	    console.log(data);
	    this.setState({ players: data.players, curr: data.curr, penalty: data.penalty, center: data.center, roomID: data.roomID, rules: data.rules });
	  },
	  _updateRoomsList: function _updateRoomsList(data) {
	    console.log("Received a rooms update");
	    console.log(data);
	    this.setState({ roomsList: data.roomsList });
	  },
	  _updatePlayerID: function _updatePlayerID(data) {
	    console.log("Received an ID update:", data.id);
	    this.setState({ myPlayerID: data.id });
	  },
	  render: function render() {
	    if (this.state.roomID === undefined) {
	      console.log("No room yet, roomID:", this.state.roomID);
	      return React.createElement(RoomBox, { roomsList: this.state.roomsList, myRoom: this.state.roomID });
	    } else {
	      var roomMax = this.state.roomsList[0].max;
	      return React.createElement('div', null, React.createElement(RoomBox, { roomsList: this.state.roomsList, myRoom: this.state.roomID }), React.createElement(SingleRoom, { players: this.state.players, curr: this.state.curr, penalty: this.state.penalty, center: this.state.center, roomID: this.state.roomID,
	        myPlayerID: this.state.myPlayerID, rules: this.state.rules, max: roomMax }));
	    }
	  }
	});
	var RoomBox = React.createClass({
	  displayName: 'RoomBox',

	  getInitialState: function getInitialState() {
	    return { open: false };
	  },
	  _toggleMenu: function _toggleMenu() {
	    this.setState({ open: !this.state.open });
	  },
	  _findMyRoomName: function _findMyRoomName() {
	    var z = 0,
	        foundRoom = 'Rooms List';
	    while (z < this.props.roomsList.length && foundRoom === 'Rooms List') {
	      //console.log("z:",z,"this.props.roomsList[z]:",this.props.roomsList[z]);
	      if (this.props.roomsList[z].id === this.props.myRoom && this.props.myRoom) foundRoom = this.props.roomsList[z].name;
	      z++;
	    }
	    return foundRoom;
	  },
	  render: function render() {
	    var allRooms = [],
	        startClass = ' blinking';
	    if (this.props.myRoom !== undefined) startClass = '';
	    allRooms.push(React.createElement(Room, { name: "New Room", playerDisplay: "", isMyRoom: this.props.myRoom === undefined, isOpen: this.state.open, key: -1 }));
	    allRooms.push(this.props.roomsList.map(function (room, i) {
	      return React.createElement(Room, { name: room.name, id: room.id, playerDisplay: "[" + room.numPlayers + "/" + room.max + "]", isMyRoom: this.props.myRoom === room.id, isOpen: this.state.open, key: i });
	    }.bind(this)));
	    return React.createElement('div', { className: "roomBox mainTheme darkerNeutral" + startClass, onClick: this._toggleMenu }, this._findMyRoomName(), allRooms);
	  }
	});
	var Room = React.createClass({
	  displayName: 'Room',

	  _sendRoomSelection: function _sendRoomSelection() {
	    console.log("Attempting to change room to", this.props.id);
	    if (this.props.name === "New Room") socket.emit('newRoom');else socket.emit('roomSelect', { roomID: this.props.id });
	  },
	  render: function render() {
	    var addMyRoomClass = "";
	    if (!this.props.isOpen) return React.createElement('div', null);
	    if (this.props.isMyRoom) addMyRoomClass = " currRoom";
	    return React.createElement('div', { className: "room mainTheme" + addMyRoomClass, onClick: this._sendRoomSelection }, this.props.name, '   ', this.props.playerDisplay);
	  }
	});
	var Chat = React.createClass({
	  displayName: 'Chat',

	  getInitialState: function getInitialState() {
	    return { shown: true, messages: [{ source: '', color: 'gray', message: "You've entered a new game room.", isChat: false }] };
	  },
	  componentDidMount: function componentDidMount() {
	    socket.on('message', this._handleMessage);
	  },
	  _handleMessage: function _handleMessage(data) {
	    console.log("Received message:", data.message);
	    var currMessages = this.state.messages,
	        newMessage = { source: data.source,
	      message: data.message,
	      color: this._findColor(data),
	      isChat: data.isChat
	    };
	    console.log("newMessage:", newMessage);
	    currMessages.push(newMessage);
	    this.setState({ messages: currMessages });
	  },
	  _findColor: function _findColor(data) {
	    if (data.source === 'SERVER' || this.props.players[data.index] === undefined) return data.index;
	    return this.props.players[data.index].color;
	  },
	  _handleSubmit: function _handleSubmit(e) {
	    if (!e) e = window.event;
	    e.stopPropagation(); //Disable game controls in input
	    var keyCode = e.keyCode || e.which;
	    if (keyCode === 13) {
	      //Enter
	      var myBox = document.getElementById("chatInput"),
	          myMessage = myBox.value;
	      console.log("Attempting to transmit:", myMessage);
	      if (myMessage !== "") {
	        socket.emit('message', { msg: myMessage, roomID: this.props.roomID });
	        myBox.value = "";
	      }
	    }
	  },
	  _swapState: function _swapState() {
	    console.log("Swapping state of chat");
	    this.setState({ shown: !this.state.shown });
	  },
	  componentDidUpdate: function componentDidUpdate() {
	    var boxToScroll = $('.messages');
	    boxToScroll.scrollTop(boxToScroll.prop('scrollHeight'));
	  },
	  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
	    //To empty the chat
	    //console.log("Emptying chat:", this.state);
	    if (nextProps.roomID !== this.props.roomID) {
	      var nextMessages = this.state.messages;
	      nextMessages.push(this.state.messages[0]);
	      this.setState({ messages: nextMessages });
	    }
	  },
	  render: function render() {
	    var showMeClass = 'chat ';
	    if (this.state.shown === false) showMeClass = 'chatHide ';
	    return React.createElement('div', { className: showMeClass + "mainTheme" }, React.createElement('div', { className: 'messages' }, this.state.messages.map(function (message, i) {
	      return React.createElement(Message, { message: message, key: i });
	    })), React.createElement('input', { id: "chatInput", type: "text", className: "chatInput mainTheme", placeholder: "Trash talk goes here...", onKeyPress: this._handleSubmit }), React.createElement(ChatHandle, { swapState: this._swapState, shown: this.state.shown }));
	  }
	});
	var ChatHandle = React.createClass({
	  displayName: 'ChatHandle',

	  render: function render() {
	    var arrows = ">>";
	    if (this.props.shown === false) arrows = "<<";
	    return React.createElement('div', { className: 'chatHandle light', onClick: this.props.swapState }, arrows);
	  }
	});
	var Message = React.createClass({
	  displayName: 'Message',

	  render: function render() {
	    var msgStyle = {
	      color: this.props.message.color,
	      fontWeight: "bold"
	    },
	        tabClass = " sysMsg",
	        colon = "";
	    if (this.props.message.isChat) {
	      tabClass = "";
	      colon = ":";
	    }
	    return React.createElement('div', { className: "message" + tabClass }, React.createElement('span', { style: msgStyle }, this.props.message.source, colon, ' '), React.createElement('span', null, this.props.message.message));
	  }
	});
	var SitDownButton = React.createClass({
	  displayName: 'SitDownButton',

	  getInitialState: function getInitialState() {
	    return { caption: "Enter name to sit down" };
	  },
	  componentDidUpdate: function componentDidUpdate() {
	    ReactDOM.findDOMNode(this.refs.nameInput).focus();
	  },
	  _handleEnter: function _handleEnter(e) {
	    if (!e) e = window.event;
	    var keyCode = e.keyCode || e.which;
	    if (keyCode === 13) this._sendName();
	  },
	  _sendName: function _sendName() {
	    var myBox = document.getElementById("nameBox");
	    if (myBox.value == "" || myBox.value == this.state.caption) {
	      alert("You have to enter a name, SIR!");return;
	    } else {
	      var myName = myBox.value;
	      console.log("Thank you, your name is: " + myName);
	      socket.emit("name", { "name": myName, roomID: this.props.roomID });
	      console.log("Sent name: " + myName);
	      this._handleFocus();
	    }
	  },
	  _handleFocus: function _handleFocus() {
	    console.log(" Removing focus from name entry");
	    document.getElementById("nameBox").blur();
	  },
	  render: function render() {
	    if (this.props.myPlayerID === false) {
	      return React.createElement('input', { id: 'nameBox', type: "text", className: 'singlePlayer self sitDown mainTheme activeTwo', placeholder: this.state.caption, style: { color: "black" }, onKeyPress: this._handleEnter, ref: 'nameInput' });
	    } else return React.createElement('div', { ref: 'nameInput' });
	  }
	});
	var ReadyButton = React.createClass({
	  displayName: 'ReadyButton',

	  getInitialState: function getInitialState() {
	    return { disabled: true,
	      caption: "Click me if you are",
	      readinessToSend: true
	    };
	  },
	  componentDidMount: function componentDidMount() {
	    socket.on('readyStatus', this._toggleButton);
	  },
	  _toggleButton: function _toggleButton(data) {
	    var readinessToMaintain = true;
	    if (this.props.myPlayerID === false) {
	      //If we don't have an ID, don't show the ready button
	      this.setState({ disabled: true });
	      return;
	    }
	    if (data.disabled === true) readinessToMaintain = false; //If we're told to turn off the button, reset readiness to false(?)
	    console.log("button disabled:", data.disabled);
	    this.setState({ disabled: data.disabled, readinessToSend: readinessToMaintain });
	  },
	  _handleClick: function _handleClick() {
	    console.log("Sent readiness:", this.state.readinessToSend);
	    socket.emit('startReady', { readiness: this.state.readinessToSend, roomID: this.props.roomID });
	    this.setState({ readinessToSend: !this.state.readinessToSend });
	  },
	  render: function render() {
	    if (this.state.disabled || this.props.myPlayerID === false) {
	      return React.createElement('div', null);
	    }
	    var text = " ",
	        backColor = "";
	    if (!this.state.readinessToSend) {
	      text = " not ";
	      backColor = " notReady";
	    }
	    return React.createElement('button', { className: "readyButton mainTheme activeTwo" + backColor, onClick: this._handleClick }, this.state.caption, text, 'ready');
	  }
	});
	var Settings = React.createClass({
	  displayName: 'Settings',

	  getInitialState: function getInitialState() {
	    return { showButtons: false,
	      height: 45,
	      width: 45,
	      color: '#39B3C1'
	    };
	  },
	  componentDidMount: function componentDidMount() {
	    var myCanvas = document.getElementById(this.props.idVal),
	        myImage = new IconCanvas(myCanvas);
	    myImage.drawSettings(this.state.color);
	  },
	  _toggleSettings: function _toggleSettings() {
	    this.setState({ showButtons: !this.state.showButtons });
	  },
	  render: function render() {
	    var tooltipClass = tooltipConst;
	    if (this.state.showButtons) tooltipClass = '';
	    return React.createElement('div', null, React.createElement('div', { className: tooltipClass, 'data-title': 'Settings', 'title-width': '150px' }, React.createElement('canvas', { id: this.props.idVal, className: this.props.idVal, height: this.state.height, width: this.state.width, onClick: this._toggleSettings })), React.createElement('div', { className: 'subSettings' }, React.createElement(StandUpButton, { roomID: this.props.roomID, showMe: this.state.showButtons, height: this.state.height * 0.75, width: this.state.width * 0.75 }), React.createElement(AIButton, { roomID: this.props.roomID, numPlayers: this.props.numPlayers, showMe: this.state.showButtons, color: this.state.color,
	      height: this.state.height * 0.9, width: this.state.width * 0.9, cb: this._toggleSettings, max: this.props.max })));
	  }
	});
	var StandUpButton = React.createClass({
	  displayName: 'StandUpButton',

	  getInitialState: function getInitialState() {
	    return { caption: 'X',
	      color: '#E68A00',
	      idVal: 'standUp',
	      fontSize: 22.5
	    };
	  },
	  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
	    var myCanvas = document.getElementById(this.state.idVal),
	        myImage = new IconCanvas(myCanvas);
	    if (nextProps.showMe) myImage.drawSubSettings(this.state.caption, this.state.color, this.state.fontSize, customFont, 0);else myImage.clear();
	  },
	  _sendStandUp: function _sendStandUp() {
	    console.log("Sending stand up notice");
	    socket.emit('standUp', { roomID: this.props.roomID });
	  },
	  render: function render() {
	    var myClass = this.state.idVal,
	        tooltipClass = tooltipConst;
	    if (!this.props.showMe) {
	      myClass = '';
	      tooltipClass = '';
	    }
	    return React.createElement('div', { className: tooltipClass, 'data-title': 'Leave game', 'title-width': '200px' }, React.createElement('canvas', { id: this.state.idVal, height: this.props.height, width: this.props.width, onClick: this._sendStandUp, className: myClass }));
	  }
	});
	var AIButton = React.createClass({
	  displayName: 'AIButton',

	  getInitialState: function getInitialState() {
	    return { difficulty: 'hard',
	      aiLevels: [['easy', 'green'], ['medium', 'yellow'], ['hard', 'orange'], ['brutal', 'red']],
	      showAIs: false,
	      caption: 'AI',
	      idVal: 'AI',
	      fontSize: 25.3
	    };
	  },
	  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
	    var myCanvas = document.getElementById(this.state.idVal),
	        myImage = new IconCanvas(myCanvas);
	    if (nextProps.numPlayers < this.props.max && nextProps.showMe) myImage.drawSubSettings(this.state.caption, nextProps.color, this.state.fontSize, customFont, 0);else myImage.clear();
	  },
	  _showAIs: function _showAIs() {
	    if (!this.props.showMe) return;
	    this.setState({ showAIs: !this.state.showAIs });
	  },
	  _toggleSubSettings: function _toggleSubSettings() {
	    this._showAIs();
	    this.props.cb();
	  },
	  render: function render() {
	    var myClass = this.state.idVal,
	        tooltipClass = tooltipConst;
	    if (this.state.showAIs || this.props.numPlayers >= this.props.max || !this.props.showMe) tooltipClass = '';
	    if (this.props.numPlayers >= this.props.max || !this.props.showMe) {
	      myClass = '';
	      tooltipClass = '';
	    }
	    return React.createElement('div', null, React.createElement('div', { className: tooltipClass, 'data-title': 'Add AI Player', 'title-width': '400px' }, React.createElement('canvas', { id: this.state.idVal, height: this.props.height, width: this.props.width, onClick: this._showAIs, className: myClass })), React.createElement('div', { className: 'aiLevels' }, this.state.aiLevels.map(function (level, i) {
	      var rank;
	      switch (i) {
	        case 0:
	          rank = 'I';break;
	        case 1:
	          rank = 'II';break;
	        case 2:
	          rank = 'III';break;
	        case 3:
	          rank = 'IIII';break;
	      };
	      return React.createElement(AIDifficulty, { difficulty: level[0], color: level[1], key: i, rank: rank, height: this.props.height * 0.9, roomID: this.props.roomID,
	        width: this.props.width * 0.9, cb: this._toggleSubSettings, fontSize: this.state.fontSize * 0.9, showMe: this.state.showAIs && this.props.showMe });
	    }.bind(this))));
	  }
	});
	var AIDifficulty = React.createClass({
	  displayName: 'AIDifficulty',

	  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
	    var myCanvas = document.getElementById(nextProps.difficulty),
	        myImage = new IconCanvas(myCanvas);
	    if (nextProps.showMe) myImage.drawSubSettings(nextProps.rank, nextProps.color, nextProps.fontSize, customFont, 0);else myImage.clear();
	  },
	  _sendAIRequest: function _sendAIRequest() {
	    if (!this.props.showMe) return;
	    console.log("Requesting an AI player, difficulty:", this.props.difficulty);
	    this.props.cb();
	    socket.emit('addAI', { roomID: this.props.roomID, difficulty: this.props.difficulty });
	  },
	  render: function render() {
	    var myClass = this.props.difficulty,
	        tooltipClass = tooltipConst;
	    if (!this.props.showMe) {
	      myClass = '';
	      tooltipClass = '';
	    }
	    return React.createElement('div', { className: tooltipClass, 'data-title': this.props.difficulty, 'title-width': '330px' }, React.createElement('canvas', { id: this.props.difficulty, height: this.props.height, width: this.props.width, onClick: this._sendAIRequest, className: myClass }));
	  }
	});
	var Rules = React.createClass({
	  displayName: 'Rules',

	  getInitialState: function getInitialState() {
	    return { showRules: false,
	      height: 60,
	      width: 60,
	      color: '#39B3C1',
	      fontSize: 45
	    };
	  },
	  componentDidMount: function componentDidMount() {
	    var myCanvas = document.getElementById('rulesIcon'),
	        myImage = new IconCanvas(myCanvas);
	    myImage.drawSubSettings('?', this.state.color, this.state.fontSize, customFont, -0.05);
	    window.addEventListener('ruleChange', this._sendRules);
	  },
	  _toggleRules: function _toggleRules() {
	    this.setState({ showRules: !this.state.showRules });
	  },
	  _hideRules: function _hideRules() {
	    this.setState({ showRules: false });
	  },
	  _sendRules: function _sendRules(e) {
	    console.log("Rule listener triggered", e.detail);
	    socket.emit('rule', { rule: e.detail, roomID: this.props.roomID });
	  },
	  render: function render() {
	    return React.createElement('div', null, React.createElement('div', { className: 'rulesBox tooltip', 'data-title': 'Click for rules' }, React.createElement('canvas', { id: 'rulesIcon', className: 'rulesIcon', height: this.state.height, width: this.state.width, onClick: this._toggleRules })), React.createElement(RulesModal, { willShowMe: this.state.showRules, hide: this._hideRules, rules: this.props.rules, roomID: this.props.roomID }));
	  }
	});
	var RulesModal = React.createClass({
	  displayName: 'RulesModal',

	  getInitialState: function getInitialState() {
	    return { doubles: [['13H', '13C'], ['5S', '5H'], ['10D', '10H']],
	      sandwich: [['8D', '14H', '8S'], ['3H', '9D', '3S']],
	      flush: [['2S', '11S', '10S'], ['12D', '2D', '9D']],
	      straight: [['10H', '11D', '12S'], ['3S', '2D', '14C'], ['12H', '13C', '14D']],
	      bottomstack: [['6C', '11D', '14H', '4S', '9H', '6D']]
	    };
	  },
	  render: function render() {
	    if (this.props.willShowMe == true) {
	      var myBox = "rules",
	          doubles = [],
	          sandwich = [],
	          flush = [],
	          straight = [],
	          bottomstack = [],
	          j = 0;
	      for (var z = 0; z < this.state.doubles.length; z++) {
	        doubles.push(this.state.doubles[z].map(function (card, i) {
	          return React.createElement(CardImage, { value: card, color: "black", box: myBox, pos: i + j * 10, key: i, className: 'card' });
	        }));
	        doubles.push(", ");
	        j++;
	      }
	      doubles.pop();
	      for (var z = 0; z < this.state.sandwich.length; z++) {
	        sandwich.push(this.state.sandwich[z].map(function (card, i) {
	          return React.createElement(CardImage, { value: card, color: "black", box: myBox, pos: i + j * 10, key: i, className: 'card' });
	        }));
	        sandwich.push(", ");
	        j++;
	      }
	      sandwich.pop();
	      for (var z = 0; z < this.state.flush.length; z++) {
	        flush.push(this.state.flush[z].map(function (card, i) {
	          return React.createElement(CardImage, { value: card, color: "black", box: myBox, pos: i + j * 10, key: i, className: 'card' });
	        }));
	        flush.push(", ");
	        j++;
	      }
	      flush.pop();
	      for (var z = 0; z < this.state.straight.length; z++) {
	        straight.push(this.state.straight[z].map(function (card, i) {
	          return React.createElement(CardImage, { value: card, color: "black", box: myBox, pos: i + j * 10, key: i, className: 'card' });
	        }));
	        straight.push(", ");
	        j++;
	      }
	      straight.pop();
	      for (var z = 0; z < this.state.bottomstack.length; z++) {
	        bottomstack.push(this.state.bottomstack[z].map(function (card, i) {
	          var color = 'black';
	          if (i == 0 || i == this.state.bottomstack[z].length - 1) color = 'red';
	          return React.createElement(CardImage, { value: card, color: color, box: myBox, pos: i + j * 10, key: i, className: 'card' });
	        }.bind(this)));
	        bottomstack.push(", ");
	        j++;
	      }
	      bottomstack.pop();
	      var ruleOff = 'ruleOff',
	          doublesClass = '',
	          sandwichClass = '',
	          flushClass = '',
	          straightClass = '',
	          bottomStackClass = '';
	      if (this.props.rules.doubles === false) doublesClass = ruleOff;
	      if (this.props.rules.sandwich === false) sandwichClass = ruleOff;
	      if (this.props.rules.flush === false) flushClass = ruleOff;
	      if (this.props.rules.straight === false) straightClass = ruleOff;
	      if (this.props.rules.bottomStack === false) bottomStackClass = ruleOff;
	      return (//onClick={this.props.hide} onBlur={this.props.hide}
	        React.createElement('div', { className: 'rulesModal mainTheme' }, React.createElement('span', { style: { fontSize: "17pt" } }, React.createElement('u', null, React.createElement('b', null, 'Rules of Egyptian Ratscrew:'))), React.createElement('ul', null, React.createElement('li', null, 'The point of the game is to get all the cards.'), ' ', React.createElement('br', null), ' ', React.createElement('li', null, 'Players have two actions: ', React.createElement('ul', null, React.createElement('li', null, 'On their turn, flip a card: ', React.createElement('span', { className: 'controls' }, '[TAB]')), ' ', React.createElement('li', null, 'At any time, slap: ', React.createElement('span', { className: 'controls' }, '[SPACEBAR]')), ' '), ' ', React.createElement('br', null)), React.createElement('li', null, 'Starting with the first player to sit down, players flip the top card off their pile and place it face-up in the middle. If the card played is a number card, the next player puts down a card, too. This continues around the table until somebody puts down a ', React.createElement('span', { className: 'controls' }, 'face card (J, Q, K, or A)'), '.'), ' ', React.createElement('br', null), ' ', React.createElement('li', null, 'When a face card (Aces are face cards!) is played, the next person in the sequence must flip another face card in the alloted number of chances in order for play to continue.'), ' ', React.createElement('br', null), ' ', React.createElement('li', null, ' ', React.createElement('span', { className: 'controls' }, ' Chances provided:'), ' ', React.createElement('ul', null, React.createElement('li', null, 'J -> 1'), React.createElement('li', null, 'Q -> 2'), React.createElement('li', null, 'K -> 3'), React.createElement('li', null, 'A -> 4'), ' ')), ' ', React.createElement('br', null), ' ', React.createElement('li', null, 'If the next person in the sequence does NOT play a face card within their allotted number of chances, the person who played the last face card wins the round and all the cards in the center go to them. This pile winner begins the next round of play.'), ' ', React.createElement('br', null), ' ', React.createElement('li', null, 'The only thing that overrides the face card rule is the slap rule. If a slap pattern is present, no matter the status of the pile, the first person to slap is the winner of that round.'), ' ', React.createElement('br', null), ' ', React.createElement('li', null, 'If you slap and there is nothing to slap on, you lose two cards to the penalty pile (that the next pile winner will collect).'), ' '), ' ', React.createElement('p', null, ' ', React.createElement('span', { className: 'controls' }, ' ', React.createElement('u', null, 'Slappable Patterns:'), ' ', React.createElement('em', null, '(click to toggle each rule on/off)'), ' '), ' '), ' ', React.createElement('ul', null, React.createElement('hr', null), React.createElement('li', null, ' ', React.createElement(RuleExample, { className: doublesClass, type: 'doubles', title: 'Doubles', caption: ' any 2 cards of the same rank:', cardArray: doubles })), ' ', React.createElement('hr', null), React.createElement('li', null, React.createElement(RuleExample, { className: sandwichClass, type: 'sandwich', title: 'Sandwich', caption: ' 2 cards of the same rank with 1 card between them:', cardArray: sandwich })), React.createElement('hr', null), React.createElement('li', null, React.createElement(RuleExample, { className: flushClass, type: 'flush', title: 'Flush', caption: ' 3 cards in a row of the same suit:', cardArray: flush })), React.createElement('hr', null), React.createElement('li', null, React.createElement(RuleExample, { className: straightClass, type: 'straight', title: 'Straight', caption: ' 3 cards in a row of ascending or descending ranks, no \'Ace wrap-a-rounds\':', cardArray: straight })), React.createElement('hr', null), React.createElement('li', null, React.createElement(RuleExample, { className: bottomStackClass, type: 'bottomStack', title: 'Bottom-stack', caption: ' a \'super sandwich\' with the top card and the bottom card of the whole stack of the same rank:', cardArray: bottomstack }))))
	      );
	    } else {
	      return React.createElement('div', null);
	    }
	  }
	});
	var RuleExample = React.createClass({
	  displayName: 'RuleExample',

	  _ruleToggle: function _ruleToggle() {
	    console.log('Triggering rule change:', this.props.type);
	    var event = new CustomEvent('ruleChange', { 'detail': this.props.type });
	    window.dispatchEvent(event);
	  },
	  render: function render() {
	    return React.createElement('div', { className: this.props.className, onClick: this._ruleToggle }, React.createElement('span', { className: 'controls' }, this.props.title), ':', this.props.caption, React.createElement('br', null), this.props.cardArray);
	  }
	});

	socket = io.connect();

	ReactDOM.render(React.createElement(ClientUI, null), document.getElementById('content'));

	socket.on('fullTable', function (data) {
	  //No room to sit down
	  console.log("Received a fullTable msg from server");
	  alert("Sorry, this table is full right now.");
	});

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var CardCanvas = function CardCanvas(canvas) {
	    var context = canvas.getContext('2d'),
	        x = canvas.width * 0.5,
	        y = canvas.height * 0.5,
	        width = canvas.width * 0.4,
	        height = canvas.height * 0.4,
	        fontSize = canvas.height / 70 * 23,
	        fontX = canvas.width / 2,
	        fontY = canvas.height * 2.2 / 7,
	        fading = false,
	        fadeColor,
	        startTime,
	        dur,
	        card,
	        customFont,
	        fadeReverse = false;

	    var drawSpade = function drawSpade(color) {
	        context.save();
	        var bottomWidth = width * 0.7;
	        var topHeight = height * 0.7;
	        var bottomHeight = height * 0.3;

	        context.beginPath();
	        context.moveTo(x, y);

	        context.fillStyle = color;

	        // top left of spade
	        context.bezierCurveTo(x, y + topHeight / 2, // control point 1
	        x - width / 2, y + topHeight / 2, // control point 2
	        x - width / 2, y + topHeight // end point
	        );

	        // bottom left of spade
	        context.bezierCurveTo(x - width / 2, y + topHeight * 1.3, // control point 1
	        x, y + topHeight * 1.3, // control point 2
	        x, y + topHeight // end point
	        );

	        // bottom right of spade
	        context.bezierCurveTo(x, y + topHeight * 1.3, // control point 1
	        x + width / 2, y + topHeight * 1.3, // control point 2
	        x + width / 2, y + topHeight // end point
	        );

	        // top right of spade
	        context.bezierCurveTo(x + width / 2, y + topHeight / 2, // control point 1
	        x, y + topHeight / 2, // control point 2
	        x, y // end point
	        );

	        context.closePath();
	        context.fill();

	        // bottom of spade
	        context.beginPath();
	        context.moveTo(x, y + topHeight);
	        context.quadraticCurveTo(x, y + topHeight + bottomHeight, // control point
	        x - bottomWidth / 2, y + topHeight + bottomHeight // end point
	        );
	        context.lineTo(x + bottomWidth / 2, y + topHeight + bottomHeight);
	        context.quadraticCurveTo(x, y + topHeight + bottomHeight, // control point
	        x, y + topHeight // end point
	        );
	        context.closePath();
	        context.fillStyle = color;
	        context.fill();
	        context.restore();
	    };

	    var drawHeart = function drawHeart(color) {
	        context.save();
	        context.beginPath();
	        var topCurveHeight = height * 0.3;
	        context.moveTo(x, y + topCurveHeight);
	        // top left curve
	        context.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);

	        // bottom left curve
	        context.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);

	        // bottom right curve
	        context.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);

	        // top right curve
	        context.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);

	        context.closePath();
	        context.fillStyle = color;
	        context.fill();
	        context.restore();
	    };

	    var drawClub = function drawClub(color) {
	        context.save();
	        var circleRadius = width * 0.3;
	        var bottomWidth = width * 0.5;
	        var bottomHeight = height * 0.35;
	        context.fillStyle = color;

	        // top circle
	        context.beginPath();
	        context.arc(x, y + circleRadius + height * 0.05, circleRadius, 0, 2 * Math.PI, false);
	        context.fill();

	        // bottom right circle
	        context.beginPath();
	        context.arc(x + circleRadius, y + height * 0.6, circleRadius, 0, 2 * Math.PI, false);
	        context.fill();

	        // bottom left circle
	        context.beginPath();
	        context.arc(x - circleRadius, y + height * 0.6, circleRadius, 0, 2 * Math.PI, false);
	        context.fill();

	        // center filler circle
	        context.beginPath();
	        context.arc(x, y + height * 0.5, circleRadius / 2, 0, 2 * Math.PI, false);
	        context.fill();

	        // bottom of club
	        context.moveTo(x, y + height * 0.6);
	        context.quadraticCurveTo(x, y + height, x - bottomWidth / 2, y + height);
	        context.lineTo(x + bottomWidth / 2, y + height);
	        context.quadraticCurveTo(x, y + height, x, y + height * 0.6);
	        context.closePath();
	        context.fill();
	        context.restore();
	    };

	    var drawDiamond = function drawDiamond(color) {
	        context.save();
	        context.beginPath();
	        context.moveTo(x, y);

	        // top left edge
	        context.lineTo(x - width / 2, y + height / 2);

	        // bottom left edge
	        context.lineTo(x, y + height);

	        // bottom right edge
	        context.lineTo(x + width / 2, y + height / 2);

	        // closing the path automatically creates
	        // the top right edge
	        context.closePath();

	        context.fillStyle = color;
	        context.fill();
	        context.restore();
	    };

	    var _draw = function _draw(timestamp) {
	        var rank = parseInt(card.slice(0, card.length - 1)),
	            suit = card.slice(-1),
	            color,
	            opacity,
	            progress = timestamp - startTime,
	            percentThrough = progress / dur;

	        if (progress >= dur) fading = false;

	        context.clearRect(0, 0, canvas.width, canvas.height);

	        if (fading) {
	            if (!fadeReverse) {
	                opacity = percentThrough;
	                context.globalAlpha = opacity;
	                context.save();
	                context.fillStyle = "#F1E9D2";
	                context.fillRect(0, 0, canvas.width, canvas.height);
	                context.restore();
	                if (suit == 'C' || suit == 'S') color = 'black';else color = 'red';
	            } else {
	                color = fadeColor;
	                opacity = 1 - percentThrough;
	                context.globalAlpha = opacity;
	            }
	        } else {
	            if (!fadeReverse) {
	                //Just a regular card to display now
	                opacity = 1;
	                context.save();
	                context.globalAlpha = opacity;
	                context.fillStyle = "#F1E9D2";
	                context.fillRect(0, 0, canvas.width, canvas.height);
	                context.restore();
	            }
	        }

	        switch (suit) {
	            case 'C':
	                drawClub(color);break;
	            case 'D':
	                drawDiamond(color);break;
	            case 'H':
	                drawHeart(color);break;
	            case 'S':
	                drawSpade(color);break;
	        }

	        switch (rank) {
	            case 11:
	                rank = 'J';break;
	            case 12:
	                rank = 'Q';break;
	            case 13:
	                rank = 'K';break;
	            case 14:
	                rank = 'A';break;
	        }
	        context.font = "bold " + fontSize + "px " + customFont;
	        context.textAlign = 'center';
	        context.fillStyle = color;
	        context.fillText(rank, fontX, fontY);

	        if (fading) window.requestAnimationFrame(_draw);
	    };

	    var drawCard = function drawCard(myCard, myFont, box, useFade, fColor) {

	        card = myCard;
	        customFont = myFont;
	        if (box === 'center') dur = 225;else if (box === 'penalty') dur = 500;else dur = 0;

	        if (useFade) {
	            fading = true;
	            fadeColor = fColor;
	            startTime = window.performance.now();
	        }

	        _draw(startTime);
	    };

	    var eraseCard = function eraseCard(duration) {
	        fadeReverse = true;
	        dur = duration;
	        startTime = window.performance.now();
	        fading = true;
	        window.requestAnimationFrame(_draw);
	    };
	    return {
	        drawCard: drawCard,
	        eraseCard: eraseCard
	    };
	};

	module.exports = CardCanvas;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	var IconCanvas = function IconCanvas(canvas) {
	    var context = canvas.getContext('2d'),
	        cx = canvas.width / 2,
	        cy = canvas.height / 2;

	    /*var drawRules = function(text, color){
	      var radius = cx-2,
	          fontSize = 45,
	          pi2 = 2 * Math.PI;
	      context.beginPath();
	      context.arc(cx, cy, radius, 0, pi2, false);
	      context.lineWidth = 3.5;
	      context.strokeStyle = color;
	      context.stroke();
	      context.font = "bold "+fontSize+"px "+customFont;
	      context.textAlign = 'center';
	      context.fillStyle = color;
	      context.fillText(text, canvas.width/2, canvas.height/(1.4));
	    };*/

	    var drawSubSettings = function drawSubSettings(text, color, fontSize, customFont, offset) {
	        var radius = cx - 2,
	            pi2 = 2 * Math.PI;
	        context.beginPath();
	        context.arc(cx, cy, radius, 0, pi2, false);
	        context.lineWidth = 3;
	        context.strokeStyle = color;
	        context.stroke();
	        context.font = fontSize + "px " + customFont;
	        context.textAlign = 'center';
	        context.fillStyle = color;
	        context.fillText(text, canvas.width / 2 * 0.98, canvas.height / (1.37 + offset));
	    };

	    var drawSettings = function drawSettings(color) {
	        // Copyright (C) Ken Fyrstenberg / Epistemex
	        // MIT license (header required)
	        var notches = 7,

	        // num. of notches
	        radiusCir = cx - 2,

	        //radius of ring around icon
	        radiusO = 0.72 * cx,

	        // outer radius
	        radiusI = 0.6 * cx,

	        // inner radius
	        radiusH = cx / 3,

	        // hole radius
	        taperO = cx / 4,

	        // outer taper %
	        taperI = cx / 7,

	        // inner taper %

	        pi2 = 2 * Math.PI,

	        // cache 2xPI (360deg)
	        angle = pi2 / (notches * 2),

	        // angle between notches
	        taperAI = angle * taperI * 0.010,

	        // inner taper offset
	        taperAO = angle * taperO * 0.001,

	        // outer taper offset
	        a = angle,

	        // iterator (angle)
	        toggle = false; // notch radis (i/o)

	        // starting point
	        context.moveTo(cx + radiusO * Math.cos(taperAO), cy + radiusO * Math.sin(taperAO));

	        // loop
	        for (; a <= pi2; a += angle) {

	            // draw inner part
	            if (toggle) {
	                context.lineTo(cx + radiusI * Math.cos(a - taperAI), cy + radiusI * Math.sin(a - taperAI));
	                context.lineTo(cx + radiusO * Math.cos(a + taperAO), cy + radiusO * Math.sin(a + taperAO));
	            }
	            // draw outer part
	            else {
	                    context.lineTo(cx + radiusO * Math.cos(a - taperAO), cy + radiusO * Math.sin(a - taperAO));
	                    context.lineTo(cx + radiusI * Math.cos(a + taperAI), cy + radiusI * Math.sin(a + taperAI));
	                }

	            // switch
	            toggle = !toggle;
	        }

	        // close the final line
	        context.closePath();

	        context.fillStyle = color;
	        context.fill();

	        context.lineWidth = 2;
	        context.strokeStyle = color;
	        context.stroke();

	        // Punch hole in gear
	        context.beginPath();
	        context.globalCompositeOperation = 'destination-out';
	        context.moveTo(cx + radiusH, cy);
	        context.arc(cx, cy, radiusH, 0, pi2);
	        context.closePath();

	        context.fill();

	        context.globalCompositeOperation = 'source-over';
	        context.stroke();

	        //Draw ring around icon
	        context.beginPath();
	        context.arc(cx, cy, radiusCir, 0, 2 * Math.PI, false);
	        context.lineWidth = 3.5;
	        context.strokeStyle = color;
	        context.stroke();
	    };

	    var clear = function clear() {
	        context.clearRect(0, 0, canvas.width, canvas.height);
	    };

	    return {
	        //drawRules: drawRules,
	        drawSettings: drawSettings,
	        drawSubSettings: drawSubSettings,
	        clear: clear
	    };
	};

	module.exports = IconCanvas;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	var Animation = function Animation(canvas, color, isSelf) {
	    var context = canvas.getContext('2d'),
	        durations = { slap: 400,
	        flip: 650,
	        clear: 1100
	    },
	        myColor = color,
	        myAnimations = [],
	        removeQueue = [],
	        animationFlip = isSelf,
	        flipDir = 1,
	        animationOffset = '100%',
	        x = canvas.width * 0.5,
	        y = canvas.height * 0.1,
	        scale = 1,
	        cardDims = { width: 50 * scale, height: 70 * scale };

	    if (animationFlip) {
	        animationOffset = '-200%';
	        flipDir = -1;
	    }
	    canvas.style.top = animationOffset;

	    var _drawSlap = function _drawSlap(timestamp, index) {
	        //console.log("In drawSlap, my event:",myAnimations[index]);
	        var myStart = myAnimations[index].start,
	            progress = timestamp - myStart,
	            percentThrough = progress / durations.slap;
	        //console.log("timestamp:",timestamp,"myStart:",myStart, "percent:",percentThrough);
	        if (progress >= durations.slap) {
	            //console.log("Added",index,"to removeQueue");
	            removeQueue.push(index);
	            return;
	        }

	        var radius = 0.5 * x * percentThrough,
	            opacity = 1 - 0.8 * percentThrough;

	        if (animationFlip) y = canvas.height;else y = 0;

	        context.save();

	        context.globalAlpha = opacity;

	        context.beginPath();
	        context.arc(x, y, radius, 0, Math.PI, animationFlip);
	        context.lineWidth = 20 * percentThrough;
	        context.strokeStyle = myColor;
	        context.stroke();
	        context.closePath();

	        context.restore();
	    };

	    var _drawFlip = function _drawFlip(timestamp, index) {
	        //console.log("In drawSlap, my event:",myAnimations[index]);
	        var myStart = myAnimations[index].start,
	            progress = timestamp - myStart,
	            percentThrough = progress / durations.flip;
	        //console.log("timestamp:",timestamp,"myStart:",myStart, "percent:",percentThrough);
	        if (progress >= durations.flip) {
	            //console.log("Added",index,"to removeQueue");
	            removeQueue.push(index);
	            return;
	        }

	        var moveDist = 0.35 * canvas.height * percentThrough * flipDir,
	            opacity = 1 - percentThrough;

	        if (animationFlip) y = canvas.height * 0.3;else y = 0;
	        context.save();

	        context.globalAlpha = opacity;
	        context.fillStyle = myColor;
	        _rCorners(x - cardDims.width / 2, y + moveDist, cardDims.width, cardDims.height, 5, myColor, true);

	        context.restore();
	    };

	    var _drawClear = function _drawClear(timestamp, index) {
	        var myStart = myAnimations[index].start,
	            progress = timestamp - myStart,
	            percentThrough = progress / durations.clear;
	        console.log("clear: timestamp:", timestamp, "myStart:", myStart, "percent:", percentThrough);
	        if (progress >= durations.clear) {
	            //console.log("Added",index,"to removeQueue");
	            removeQueue.push(index);
	            return;
	        }

	        var radius = 0.8 * x * (1 - percentThrough),
	            opacity = 0.2 + 0.8 * percentThrough;

	        if (animationFlip) y = canvas.height;else y = 0;

	        context.save();

	        context.globalAlpha = opacity;

	        context.beginPath();
	        context.arc(x, y, radius, 0, Math.PI, animationFlip);
	        context.lineWidth = 20 * percentThrough;
	        context.strokeStyle = myColor;
	        context.stroke();
	        context.closePath();

	        context.restore();
	    };

	    var _rCorners = function _rCorners(_x, _y, _width, _height, _radius, _color, stroke) {
	        if (typeof stroke == 'undefined') {
	            stroke = true;
	        }
	        //_radius = 5;
	        context.beginPath();
	        context.moveTo(_x + _radius, _y);
	        context.lineTo(_x + _width - _radius, _y);
	        context.quadraticCurveTo(_x + _width, _y, _x + _width, _y + _radius);
	        context.lineTo(_x + _width, _y + _height - _radius);
	        context.quadraticCurveTo(_x + _width, _y + _height, _x + _width - _radius, _y + _height);
	        context.lineTo(_x + _radius, _y + _height);
	        context.quadraticCurveTo(_x, _y + _height, _x, _y + _height - _radius);
	        context.lineTo(_x, _y + _radius);
	        context.quadraticCurveTo(_x, _y, _x + _radius, _y);
	        context.closePath();
	        context.fill();
	        if (stroke) {
	            context.stroke();
	        }
	    };

	    var add = function add(type) {
	        //console.log("type:",type,"perf:",window.performance.now());
	        myAnimations.push({ type: type, start: window.performance.now() });
	        //console.log("Just added, myAnimations:",myAnimations);
	        window.requestAnimationFrame(_draw);
	    };

	    var _handleQueue = function _handleQueue() {
	        //Removes elements in reverse order so that the assigned indeces don't change during manipulation
	        var removeIndex;
	        while (removeQueue.length) {
	            removeIndex = removeQueue.pop();
	            myAnimations.splice(removeIndex, 1);
	        }
	    };

	    var _draw = function _draw(timestamp) {
	        //console.log("In draw, animations:",myAnimations);
	        _clear();
	        for (var z = 0; z < myAnimations.length; z++) {
	            switch (myAnimations[z].type) {
	                case 'slap':
	                    _drawSlap(timestamp, z);break;
	                case 'flip':
	                    _drawFlip(timestamp, z);break;
	                case 'clear':
	                    _drawClear(timestamp, z);break;
	            }
	        }
	        if (removeQueue.length > 0) _handleQueue();
	        if (myAnimations.length > 0) window.requestAnimationFrame(_draw);else _clear();
	    };

	    var _clear = function _clear() {
	        context.clearRect(0, 0, canvas.width, canvas.height);
	    };

	    //console.log("In animations");

	    return {
	        add: add
	    };
	};

	module.exports = Animation;

/***/ }
/******/ ]);