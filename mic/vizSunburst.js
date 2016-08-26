/*******************************************************************************
* particles drawn as a cloud of smoke
*/
function Particle() {
  this.cx = -200;
  this.cy = -200;
  this.regenerate();
}

Particle.prototype.regenerate = function() {
  var angle = Math.random() * 2 * Math.PI;
  this.x = Math.cos(angle) * Math.random() * 500 + this.cx;
  this.y = Math.sin(angle) * Math.random() * 500 + this.cy;
  angle = Math.random() * 2 * Math.PI;
  this.dx = Math.cos(angle);
  this.dy = Math.sin(angle);
  this.intensity = 0;
  this.di = 0.01 + Math.random() / 50;
  }

Particle.prototype.move = function() {
  this.x += this.dx * Math.random() * 4;
  this.y += this.dy * Math.random() * 4;
  this.intensity += this.di;
  if (this.intensity < 0) {
    this.regenerate();
  } else if (this.intensity > 1) {
    this.intensity = 1;
    this.di *= -1;
  }
}

/*******************************************************************************
* sunburst, optionally on clouds
*/
function VizSunburst(variant) {
  this.dampen = true;
  this.hasVariants = true;
  this.variants = [[true], [false]];

  this.vary(variant);

  /*cv.width = 200;
  cv.height = 200;
  ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, cv.width, cv.height)
  var grd = ctx.createRadialGradient(100, 100, 10, 100, 100, 100);
  grd.addColorStop(0,"#aaaaaa");
  grd.addColorStop(1,"#000000");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 200, 200);
  var src = cv.toDataURL();
  this.particleImage = new Image();
  this.particleImage.src = src;*/
  this.particleImage = document.getElementById("particleImage");
  
  this.particles = [];
  for (var i = 0; i < 25; i++) {
    this.particles.push(new Particle());
  }
}

VizSunburst.prototype.resize = function() {}

VizSunburst.prototype.vary = function(variant) {
  // blending is horrifically slow on Firefox, so skip that variant
  if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    variant = 1;
  }
  this.variant = variant;
  this.clouds = this.variants[variant][0];
}

VizSunburst.prototype.draw = function(array) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.translate(cv.width / 2, cv.height / 2);
  
  if (this.clouds) {
    ctx.globalCompositeOperation = "screen";
    for (var i = 0; i < this.particles.length; i++) {
      ctx.globalAlpha = this.particles[i].intensity;
      ctx.drawImage(this.particleImage, this.particles[i].x,
        this.particles[i].y);
      this.particles[i].move();
    }
  }
  
  ctx.rotate(allRotate);
  if (this.clouds) {
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 1.0;
  }
  
  for (var i = 0; i < bandCount; i++) {
    ctx.rotate(rotateAmount);
    var hue = Math.floor(360.0 / bandCount * i) % 360;
    var brightness = constrain(Math.floor(array[i] / 2), 10, 99);
    ctx.fillStyle = bigColorMap[hue * 100 + brightness];
    ctx.beginPath();
    ctx.arc(0, 0, longestSide * 1.5, 0, rotateAmount + 0.1);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.closePath();
  }
  allRotate += 0.002;
}