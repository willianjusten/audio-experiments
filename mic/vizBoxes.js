/*******************************************************************************
* a wall of boxes that brighten
*/
function VizBoxes(variant) {
  this.dampen = true;
  this.hasVariants = true;
  this.variants = [[false], [true]];

  this.vary(variant);
  this.hueOffset = 0;
}

VizBoxes.prototype.resize = function() {}

VizBoxes.prototype.vary = function(variant) {
  this.variant = variant;
  this.grow = this.variants[variant][0];
}

VizBoxes.prototype.draw = function(array) {
  this.hueOffset += 0.25;
  //array = reduceBuckets(array, 81);
  ctx.clearRect(0, 0, cv.width, cv.height);

  var size = 11;
  var i = 0;
  var x = Math.floor((size - 1) / 2);
  var y = x;
  var loop = 0;

  var dx = 0;
  var dy = 0;
  
  var cw = cv.width / size;
  var ch = cv.height / size;
  
  while (i < size * size) {
    switch(loop % 4) {
    case 0: dx = 1; dy = 0; break;
    case 1: dx = 0; dy = 1; break;
    case 2: dx = -1; dy = 0; break;
    case 3: dx = 0; dy = -1; break;
    }

    for (var j = 0; j < Math.floor(loop / 2) + 1; j++) {
      //console.log(i + ": [" + x + "," + y + "] " + (loop / 2 + 1));
      var hue = Math.floor(360.0 / (size * size) * i + this.hueOffset) % 360;
      var brightness = constrain(Math.floor(array[i] / 1.5), 10, 99);
      ctx.fillStyle = bigColorMap[hue * 100 + brightness];
      var intensity = 0.9;
      if (this.grow) {
        intensity = array[i] / 255 / 4 + 0.65;
        //intensity = constrain(intensity, 0.1, 0.9);
      }
      ctx.fillRect(x * cw + cw / 2 * (1 - intensity),
        y * ch + ch / 2 * (1 - intensity), cw * intensity, ch * intensity);
      
      x += dx;
      y += dy;
      i++;
    }
    loop++;
  }
}