var IconCanvas = (function (canvas) {
  var context = canvas.getContext('2d'),
      cx = canvas.width / 2,
      cy = canvas.height / 2;
  
  var drawRules = function(text, color){
    var radius = cx-2,
        fontSize = 45,
        pi2 = 2 * Math.PI;
    context.beginPath();
    context.arc(cx, cy, radius, 0, pi2, false);
    context.lineWidth = 3.5;
    context.strokeStyle = color;
    context.stroke();
    context.font = "bold "+fontSize+"px Times New Roman";
    context.textAlign = 'center';
    context.fillStyle = color;
    context.fillText(text, canvas.width/2, canvas.height/(1.4));
  };
  
  var drawSubSettings = function(text, color, fontSize){
    var radius = cx-2,
        pi2 = 2 * Math.PI;
    context.beginPath();
    context.arc(cx, cy, radius, 0, pi2, false);
    context.lineWidth = 3.5;
    context.strokeStyle = color;
    context.stroke();
    context.font = "bold "+fontSize+"px Times New Roman";
    context.textAlign = 'center';
    context.fillStyle = color;
    context.fillText(text, canvas.width/2, canvas.height/1.4);
  };
  
  var drawSettings = function(color) {
  // Copyright (C) Ken Fyrstenberg / Epistemex
  // MIT license (header required)
    var notches = 7,                   // num. of notches
        radiusCir = cx-2,        //radius of ring around icon
        radiusO = 0.72*cx,    // outer radius
        radiusI = 0.6*cx,     // inner radius
        radiusH = cx/3,                // hole radius
        taperO = cx/4,                 // outer taper %
        taperI = cx/7,                 // inner taper %
    
        pi2 = 2 * Math.PI,                // cache 2xPI (360deg)
        angle = pi2 / (notches * 2),      // angle between notches
        taperAI = angle * taperI * 0.010, // inner taper offset
        taperAO = angle * taperO * 0.001, // outer taper offset
        a = angle,                        // iterator (angle)
        toggle = false;                   // notch radis (i/o)
        
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
  
  var clear = function(){
    context.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  return {
    drawRules: drawRules,
    drawSettings: drawSettings,
    drawSubSettings: drawSubSettings,
    clear: clear
    };
});

module.exports = IconCanvas;