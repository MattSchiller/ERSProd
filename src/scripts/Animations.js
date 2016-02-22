var Animation = (function (canvas, color, elementID, isSelf) {
    var context = canvas.getContext('2d'),
        durations = {slap: 500,
                     flip: 650,
                     clear: 500
                    },
        myColor = color,
        myElement = document.getElementById(elementID),
        animationFlip=isSelf,
        myAnimations = [],
        removeQueue = [],
        animationOffset = '50%',
        x = canvas.width * 0.5,
        y = canvas.height * 0.25,
        flipDir = 1,
        cardDims = {width:50, height:70};
        
        if (animationFlip) {
          animationOffset = '-150%';
          y = canvas.height * 0.75;
          flipDir = -1;
        }
        document.getElementById(elementID).style.top = animationOffset;

    var _drawSlap = function(timestamp, index) {
        //console.log("In drawSlap, my event:",myAnimations[index]);
        var myStart = myAnimations[index].start,
            progress = timestamp - myStart,
            percentThrough = progress / durations.slap;
        //console.log("timestamp:",timestamp,"myStart:",myStart, "percent:",percentThrough);
        if (progress < 0) {
          context.rect(4, y, (2*x)-8, (y/2)-4);
          return; //Issues with first frame sending timestamp too far in the past
        }
        if (progress >= durations.slap) {
            //console.log("Added",index,"to removeQueue");
            removeQueue.push(index);
            return;
        }
        
        var radius = (0.75) * x * percentThrough,
            opacity = 1 - (0.8)*percentThrough;
        
        context.save();
        
        context.globalAlpha = opacity;
        
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI, animationFlip);
        context.lineWidth = 10 * percentThrough;
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
        if (progress < 0) {
          return; //Issues with first frame sending timestamp too far in the past
        }
        if (progress >= durations.flip) {
            //console.log("Added",index,"to removeQueue");
            removeQueue.push(index);
            return;
        }
        
        var moveDist = (0.75) * canvas.height * percentThrough * flipDir,
            opacity = 1 - (0.9)*percentThrough;

        context.save();
        
        context.globalAlpha = opacity;
        context.fillStyle = myColor;
        _rCorners(x-(cardDims.width/2), y+moveDist, cardDims.width, cardDims.height, 5, myColor, true);
        
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