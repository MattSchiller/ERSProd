# ERSProd
Welcome to E-Ratscrew, the future of slappable card games! Ah, don't mind the over-enthusiasm there, I'm just excited at what I've built here.

The rules of the game (Egyptian Ratscrew) are listed in the client, but in brief, it's a game of flipping cards from your deck and signaling a 'slap' if you recognize a specific pattern in the flipped cards (doubles, for instance). There's more to it, but let's start talking technical.

##Module Synopsis
###*src/scripts/*Ratscrew.js
The front-end is written with React, which was a dream for handling the variable number of players, center cards, and overall game state. Everything except the starfield background image is created with canvas elements, which was another great learning experience (drawing the cards & suits, the flip/slap animations, and the fading animations).

#####RSServer.js
The server is built without Express because I wanted to understand the 'nitty gritty' of file-serving. The server also handles all socket.IO communications to/from the clients, and capably deals with rooms for several game tables all at once. Node/npm is of course used to handle the external libraries, of which there are delightfully few (Socket.IO, Webpack, and Babel mostly).

#####src_server/RatscrewLogic.js
For each game room, there is a single instance of the gameLogic.js instantiated. This library keeps track of things like whose turn it is, what cards everyone has, and whether game actions that users communicate to the server are valid game moves. It also handles the AI players that a user may request, spawning an instance of the AI.js module, which connects, reacts, and communicates with the server as though it were a normal player.

#####*src_server/*AI.js
Each AI level (there are four) is managed with probability hurdles for the Math.random() function to clear. That is, the AI 'knows' when a good move is available, but will only execute it a certain percentage of the time based on its difficulty. Further, the speed at which it acts--its reaction time--is another aspect of 'randomness', with a base delay time multiplied by a random number between 0.5 - 1.5. The introduction of multiple probability calculations creates a dynamic gameplay experience that better simulates a living, breathing opponent.


This project was my major project during my time at the Recurse Center in NYC, and while there are certainly more features and better graphics that I can implement going forward, I'll leave this repo as it is for now to preserve this as a milestone in my coding journey.

##Thanks for checking it out!