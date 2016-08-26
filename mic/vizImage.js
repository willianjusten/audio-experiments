/*******************************************************************************
* an image that's colored to the beat
*/
VizImage.prototype.generateGreyscaleBuckets = function(image, divisions) {
  this.width = image.width;
  this.height = image.height;

  cv2.width = this.width;
  cv2.height = this.height;
  var buffer = cv2.getContext("2d");
  buffer.clearRect(0, 0, this.width, this.height);
  buffer.drawImage(image, 0, 0, this.width, this.height);

  var imageData = buffer.getImageData(0, 0, this.width, this.height);
  this.greyscaled = [];
  this.greyscaled2 = [];
  for (var i = 0; i < divisions; i++) {
    this.greyscaled2.push([]);
  }

  // analyze each pixel
  for (var j = 0; j < this.width * this.height; j++) {
    var grey = Math.round(imageData.data[j*4]   * 0.2126 +
                          imageData.data[j*4+1] * 0.7152 +
                          imageData.data[j*4+2] * 0.0722);

    // ensure we stay within 8-bit range
    if (grey < 0) { grey = 0; }
    else if (grey > 255) { grey = 255; }
    // force into 128 buckets (fix me later)
    grey = Math.floor((255 - grey) / 2);

    /*var interval = Math.floor(256 / divisions)
    grey = (grey - (grey % interval));*/
    this.greyscaled[j] = grey;
    this.greyscaled2[grey].push([j % this.width, Math.floor(j / this.width)]);
  }

  // create temporary frame to be modified each draw call
  this.frame = buffer.createImageData(this.width, this.height);
  for (var i = 0; i < this.width * this.height; i++) {
    this.frame.data[i*4+0] = 255;
    this.frame.data[i*4+1] = 255 * (i % 4);
    this.frame.data[i*4+2] = 255;
    this.frame.data[i*4+3] = 255;
  }
}

function VizImage() {
  this.dampen = true;
  this.hasVariants = false;

  this.generateGreyscaleBuckets(document.getElementById("image"), 128);
  this.resize();
  this.hueOffset = 0;

}

VizImage.prototype.resize = function() {
  var sW = Math.floor(window.innerWidth / this.width);
  var sH = Math.floor(window.innerHeight / this.height);
  this.scale = Math.min(sW, sH);
  if (this.scale == 0) { this.scale = 1; }
  this.tX = Math.floor((window.innerWidth - (this.width * this.scale)) / 2),
  this.tY = Math.floor((window.innerHeight - (this.height * this.scale)) / 2)
}

VizImage.prototype.draw = function(array) {
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.translate(this.tX, this.tY);
  this.hueOffset += 1;

  for (var i = 0; i < this.greyscaled.length; i++) {
    var intensity = this.greyscaled[i];
    var hue = Math.floor(array[intensity] + this.hueOffset) % 360;
    var brightness = constrain(Math.floor(array[intensity] / 1.5), 0, 99);
    var color = bigColorMap2[hue * 100 + brightness];
    this.frame.data[i*4]   = color[0];
    this.frame.data[i*4+1] = color[1];
    this.frame.data[i*4+2] = color[2];
  }

  cv2.width = this.width;
  cv2.height = this.height;
  var buffer = cv2.getContext("2d");
  buffer.putImageData(this.frame, 0, 0);
  ctx.scale(this.scale, this.scale);
  ctx.drawImage(cv2, 0, 0);
  ctx.scale(1, 1);
}
