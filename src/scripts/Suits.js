var CardCanvas = (function (canvas) {
    var context = canvas.getContext('2d'),
        x = canvas.width * 0.5,
        y = canvas.height * 0.5,
        width = canvas.width * 0.4,
        height = canvas.height * 0.4,
        fontSize = (canvas.height / 70)*23,
        fontX = canvas.width / 2,
        fontY = canvas.height * 2.2/7;
    context.save();
    context.fillStyle= "#F1E9D2";
    context.fillRect(0,0,canvas.width, canvas.height);
    context.restore();
    
    var drawSpade = function (color){
        context.save();
        var bottomWidth = width * 0.7;
        var topHeight = height * 0.7;
        var bottomHeight = height * 0.3;
        
        context.beginPath();
        context.moveTo(x, y);
        
        // top left of spade
        context.bezierCurveTo(
    		x, y + topHeight / 2, // control point 1
        	x - width / 2, y + topHeight / 2, // control point 2
        	x - width / 2, y + topHeight // end point
        );
        
        // bottom left of spade
        context.bezierCurveTo(
    		x - width / 2, y + topHeight * 1.3, // control point 1
        	x, y + topHeight * 1.3, // control point 2
        	x, y + topHeight // end point
        );
        
        // bottom right of spade
        context.bezierCurveTo(
    		x, y + topHeight * 1.3, // control point 1
        	x + width / 2, y + topHeight * 1.3, // control point 2
        	x + width / 2, y + topHeight // end point
        );
        
        // top right of spade
        context.bezierCurveTo(
    		x + width / 2, y + topHeight / 2, // control point 1
        	x, y + topHeight / 2, // control point 2
        	x, y // end point
        );
        
        context.closePath();
        context.fill();
        
        // bottom of spade
        context.beginPath();
        context.moveTo(x, y + topHeight);
        context.quadraticCurveTo(
    		x, y + topHeight + bottomHeight, // control point
        	x - bottomWidth / 2, y + topHeight + bottomHeight // end point
        );
        context.lineTo(x + bottomWidth / 2, y + topHeight + bottomHeight);
        context.quadraticCurveTo(
    		x, y + topHeight + bottomHeight, // control point
        	x, y + topHeight // end point
        );
        context.closePath();
        context.fillStyle = color;
        context.fill();
        context.restore();
    };

    var drawHeart = function (color){
    	context.save();
        context.beginPath();
    	var topCurveHeight = height * 0.3;
        context.moveTo(x, y + topCurveHeight);
        // top left curve
        context.bezierCurveTo(
    		x, y,
    		x - width / 2, y,
    		x - width / 2, y + topCurveHeight
    	);
        
        // bottom left curve
        context.bezierCurveTo(
    		x - width / 2, y + (height + topCurveHeight) / 2,
    		x, y + (height + topCurveHeight) / 2,
    		x, y + height
    	);
        
        // bottom right curve
        context.bezierCurveTo(
    		x, y + (height + topCurveHeight) / 2,
    		x + width / 2, y + (height + topCurveHeight) / 2,
    		x + width / 2, y + topCurveHeight
    	);
        
        // top right curve
        context.bezierCurveTo(
    		x + width / 2, y,
    		x, y,
    		x, y + topCurveHeight
    	);
        
        context.closePath();
        context.fillStyle = color;
        context.fill();
    	context.restore();
    };

    var drawClub = function (color){
    	context.save();
    	var circleRadius = width * 0.3;
    	var bottomWidth = width * 0.5;
    	var bottomHeight = height * 0.35;
        context.fillStyle = color;
    	
        // top circle
        context.beginPath();
        context.arc(
    		x, y + circleRadius + (height * 0.05),
    		circleRadius, 0, 2 * Math.PI, false
    	);
        context.fill();
        
        // bottom right circle
        context.beginPath();
        context.arc(
    		x + circleRadius, y + (height * 0.6),
    		circleRadius, 0, 2 * Math.PI, false
    	);
        context.fill();
        
        // bottom left circle
        context.beginPath();
        context.arc(
    		x - circleRadius, y + (height * 0.6),
    		circleRadius, 0, 2 * Math.PI, false
    	);
        context.fill();
        
        // center filler circle
        context.beginPath();
        context.arc(
    		x, y + (height * 0.5),
    		circleRadius / 2, 0, 2 * Math.PI, false
    	);
        context.fill();
        
        // bottom of club
        context.moveTo(x, y + (height * 0.6));
        context.quadraticCurveTo(
    		x, y + height,
    		x - bottomWidth / 2, y + height
    	);
        context.lineTo(x + bottomWidth / 2, y + height);
        context.quadraticCurveTo(
    		x, y + height,
    		x, y + (height * 0.6)
    	);
        context.closePath();
        context.fill();
    	context.restore();
    };

    var drawDiamond = function (color){
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

    var drawCard = function (card){
        var rank = parseInt(card.slice(0, card.length-1)),
            suit = card.slice(-1),
            color = 'red';
        if (suit=='C' || suit=='S') color = 'black';
        switch (suit){
            case 'C':
                drawClub(color); break;
            case 'D':
                drawDiamond(color); break;
            case 'H':
                drawHeart(color); break;
            case 'S':
                drawSpade(color); break;
        }
        switch (rank){
            case 11:
                rank='J'; break;
            case 12:
                rank='Q'; break;
            case 13:
                rank='K'; break;
            case 14:
                rank='A'; break;
        }
        context.font = "bold "+fontSize+"px Times New Roman";
        context.textAlign = 'center';
        context.fillStyle = color;
        context.fillText(rank, fontX, fontY);
    };
    return {
        drawCard: drawCard
    };
});

module.exports = CardCanvas;