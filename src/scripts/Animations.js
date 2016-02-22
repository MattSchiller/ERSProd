var Animation = (function (canvas, color, type, removal, eventID, elementID, isSelf) {
    var context = canvas.getContext('2d'),
        x = canvas.width * 0.5,
        y = canvas.height * 0.5,
        durations = {slap: 500,
                     flip: 500},
        myColor = color,
        myEventID = eventID,
        myRemoval = removal,
        myElement = document.getElementById(elementID),
        startTime = null,
        animationFlip=isSelf;

    var drawFlip = function(timestamp) {
        var opacity=0.9, 
            flipColor = '#39B3C1',
            myElement = document.getElementById(elementID),
            width:50, height:70

            myElement.borderWidth= 1.5;
            myElement.borderStyle = "solid",
            myElement.margin = "1px",
            myElement.borderRadius = "5px",
            myElement.borderColor = color,
            myElement.WebkitBoxShadow = "0 0 10px 1px "+color,
            myElement.MozBoxShadow = "0 0 10px 1px "+color,
            myElement.boxShadow = "0 0 10px 1px "+color,
            myElement.opacity = opacity

        var _removal=removal, _myID=myID
        setTimeout(function(){_removal(_myID)}, 1000);
    };
    var drawSlap = function(timestamp) {
        console.log("In drawSlap");
        if (!startTime) startTime = timestamp;
        var progress = timestamp - startTime,
            percentThrough = progress / durations.slap;
        
        if (progress >= durations.slap) {
            myRemoval(myEventID);   //Removes self from DOM
            return;
        }
        
        var radius = x * percentThrough,
            opacity = 1 - (0.5)*percentThrough;

        context.clearRect(0, 0, 2 * x, 2 * y);
        context.globalAlpha = opacity;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI, animationFlip);
        context.lineWidth = 10 * percentThrough;
        context.strokeStyle = myColor;
        context.stroke();

        window.requestAnimationFrame(drawSlap);
    };

    console.log("In animations");
    switch (type){
        case 'slap': window.requestAnimationFrame(drawSlap); break;
    }
    
});

module.exports = Animation;