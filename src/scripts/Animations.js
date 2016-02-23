var Animation = (function (canvas, color, isSelf) {      
    var context = canvas.getContext('2d'),
        durations = {slap: 400,
                     flip: 650,
                     clear: 1100
                    },
        myColor = color,
        myAnimations = [],
        removeQueue = [],
        animationFlip=isSelf,
        flipDir = 1, 
        animationOffset = '100%',
        x = canvas.width * 0.5,
        y = canvas.height * 0.1,
        scale = 1,
        cardDims = {width:50*scale, height:70*scale};        
        
        if (animationFlip) {
          animationOffset = '-200%';
          flipDir = -1;
        }
        canvas.style.top = animationOffset; 

    var _drawSlap = function(timestamp, index) {
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
        
        var radius = (0.5) * x * percentThrough,
            opacity = 1 - (0.8)*percentThrough;

        if (animationFlip) y=canvas.height;
        else y = 0;
        
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
    
    var _drawFlip = function(timestamp, index) {
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
        
        var moveDist = (0.35) * canvas.height * percentThrough * flipDir,
            opacity = 1 - percentThrough;

        if (animationFlip) y = canvas.height*0.3;
        else y = 0;
        context.save();
        
        context.globalAlpha = opacity;
        context.fillStyle = myColor;
        _rCorners(x-(cardDims.width/2), y+moveDist, cardDims.width, cardDims.height, 5, myColor, true);
        
        context.restore();
    };

    var _drawClear = function(timestamp, index) {
       var myStart = myAnimations[index].start,
            progress = timestamp - myStart,
            percentThrough = progress / durations.clear;
        if (progress >= durations.clear) {
            //console.log("Added",index,"to removeQueue");
            removeQueue.push(index);
            return;
        }

        var radius = (0.8) * x * (1-percentThrough),
            opacity = 0.2 + (0.8) * percentThrough;

        if (animationFlip) y=canvas.height;
        else y = 0;
        
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
    
    var _rCorners = function(_x, _y, _width, _height, _radius, _color, stroke) {
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
    
    var add = function(type){
      //console.log("type:",type,"perf:",window.performance.now());
      myAnimations.push({type:type, start:window.performance.now()});
      //console.log("Just added, myAnimations:",myAnimations);
      window.requestAnimationFrame(_draw);
    };
    
    var _handleQueue = function(){//Removes elements in reverse order so that the assigned indeces don't change during manipulation
      var removeIndex;
      while (removeQueue.length) {
        removeIndex=removeQueue.pop();
        myAnimations.splice(removeIndex, 1);
      }
    };
    
    var _draw = function(timestamp){
      //console.log("In draw, animations:",myAnimations);
      _clear();
      for(var z=0;z<myAnimations.length;z++){
        switch (myAnimations[z].type){
          case ('slap'):
            _drawSlap(timestamp, z); break;
          case ('flip'):
            _drawFlip(timestamp, z); break;
          case ('clear'):
            _drawClear(timestamp, z); break;
        }
      }
      if (removeQueue.length>0) _handleQueue();
      if (myAnimations.length>0) window.requestAnimationFrame(_draw);
      else _clear();
    };
    
    var _clear = function(){
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    //console.log("In animations");
    
    return {
        add: add
    };
    
});

module.exports = Animation;