/*******************************************************************************
* spikes coming from off screen
*/
function VizSpikes() {
  this.dampen = true;
  this.hasVariants = false;

  this.hueOffset = 0;
}

VizSpikes.prototype.resize = function() {}

VizSpikes.prototype.draw = function(array) {
  this.hueOffset += 1;
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.translate(cv.width / 2, cv.height / 2);
  ctx.rotate(Math.PI / 2);
  
  for (var i = 0; i < bandCount; i++) {
    var hue = Math.floor(360.0 / bandCount * i + this.hueOffset) % 360;
    var brightness = constrain(Math.floor(array[i] / 1.5), 15, 99);
    ctx.fillStyle = bigColorMap[hue * 100 + brightness];

    var inner = shortestSide / 2;
    inner = inner - (inner - centerRadius) * (array[i] / 255);
    ctx.beginPath();
    ctx.arc(0, 0, hypotenuse / 2, -rotateAmount / 2, rotateAmount / 2);
    ctx.lineTo(inner, 0);
    ctx.fill();
    ctx.closePath();
    ctx.rotate(rotateAmount);
  }
  //allRotate += 0.002;
}