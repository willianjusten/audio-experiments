/*******************************************************************************
* bars flying from center
*/
function VizFlyout() {
  this.dampen = false;
  this.hasVariants = false;

  this.distances = [];
  for (var i = 0; i < bandCount; i++) {
    this.distances.push(0);
  }
}

VizFlyout.prototype.resize = function() {}

VizFlyout.prototype.draw = function(array) {
  ctx.clearRect(0, 0, cv.width, cv.height)
  ctx.translate(cv.width / 2, cv.height / 2);
  ctx.rotate(allRotate);
  for (var i = 0; i < bandCount; i++) {
    ctx.rotate(rotateAmount);
    ctx.lineWidth = 1 + (array[i] / 256 * 5);
    if (array[i] < 50) {
      this.distances[i] += (50 * heightMultiplier / 40);
    } else {
      this.distances[i] += (array[i] * heightMultiplier / 40);
    }

    if (this.distances[i] > (longestSide * 0.71)) {
      this.distances[i] = 0;
    } else {
      var hue = (360.0 / bandCount * i) / 360.0;
      var brightness = constrain(array[i] * 1.0 / 150, 0.3, 1);
      ctx.strokeStyle = HSVtoRGB(hue, 1, brightness);
      ctx.beginPath();
      ctx.arc(0, 0, this.distances[i], 0, rotateAmount * .75);
      ctx.stroke();
      ctx.closePath();
      var offset = longestSide * .71 / 2;
      if (this.distances[i] > longestSide * .71 / 2) {
        offset *= -1;  
      } 
      ctx.strokeStyle = HSVtoRGB(hue, 1, brightness);
      ctx.beginPath();
      ctx.arc(0, 0, this.distances[i] + offset, 0, rotateAmount * .75);
      ctx.stroke();
      ctx.closePath();
    }
  }
  allRotate += 0.002;
}