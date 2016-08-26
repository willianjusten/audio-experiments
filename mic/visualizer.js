var cv = document.getElementById("canvas");
var cv2 = document.getElementById("buffer");
var ctx;

var visualizers = [];
var currentViz = 0;
var initialized = false;

// for graphics processing
var fpsInterval = 1000 / 45;
var shortestSide, longestSide, hypotenuse;
var allRotate = 0;
var rotateAmount, centerRadius, bandWidth, heightMultiplier;
var bigColorMap = [];
var bigColorMap2 = [];

// for audio processing
var audioCtx;
var source;
var analyser;
var spectrum;
var bandCount;
var lastVolumes = [];

/*******************************************************************************
* sets up mic/line-in input, and the application loop
*/
navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

if (navigator.getUserMedia) {
  navigator.getUserMedia({video: false, audio: true},

    // success callback
    function(stream) {
      // initialize nodes
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();

      // set node properties and connect
      analyser.smoothingTimeConstant = 0.2;
      analyser.fftSize = 256;
      bandCount = Math.round(analyser.fftSize / 3);
      spectrum = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);

      // set up visualizer list
      visualizers.push(new VizRadialArcs(0));
      visualizers.push(new VizRadialBars(0));
      visualizers.push(new VizFlyout());
      visualizers.push(new VizSunburst(0));
      visualizers.push(new VizBoxes(0));
      visualizers.push(new VizSpikes());
      visualizers.push(new VizImage());

      // misc setup
      for (var i = 0; i < bandCount; i++) { lastVolumes.push(0); }
      rotateAmount = (Math.PI * 2.0) / bandCount;
      generateColors();
      initialized = true;

      recalculateSizes();
      visualize();
    },

    // error callback
    function(e) {
      console.log(e);
      alertError();
    }
  );
} else {
  alertError();
}

/*******************************************************************************
* called each audio frame, manages rendering of visualization
*/
//var counter = 0;
function visualize() {
  setTimeout(function() {
    drawVisual = requestAnimationFrame(visualize);
    analyser.getByteFrequencyData(spectrum);

    // dampen falloff
    if (visualizers[currentViz].dampen == true) {
      for (var i = 0; i < spectrum.length; i++) {
        if (lastVolumes[i] > spectrum[i]) {
          spectrum[i] = (spectrum[i] + lastVolumes[i]) / 2;
        }
      }
    }

    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    ctx = cv.getContext("2d");
    visualizers[currentViz].draw(spectrum);
  }, fpsInterval);
}

/*******************************************************************************
* varies the current visualization
*/
function vary() {
  if (visualizers[currentViz].hasVariants) {
    var variant = visualizers[currentViz].variant;
    variant++;
    if (variant >= visualizers[currentViz].variants.length) {
      variant = 0;
    }
    visualizers[currentViz].vary(variant);
  }
}

/*******************************************************************************
* set key handler, and window resize handler
*/
var bodyElement = document.getElementsByTagName('body')[0];
bodyElement.onkeyup = function(e) { 
  var ev = e || event;
  if (ev.keyCode >= 49 && ev.keyCode < 49 + visualizers.length) {
    currentViz = ev.keyCode - 49;
    recalculateSizes();
  } else if (ev.keyCode == 187 || ev.keyCode == 61) {
    vary();
  }
  //console.log(ev.keyCode);
}
bodyElement.onclick = function() {
  currentViz = (currentViz + 1) % visualizers.length;
  recalculateSizes();
}
window.onresize = function() { recalculateSizes(); };

/*******************************************************************************
* various utility functions
*/
function alertError() {
  alert("Unable to start visualization. Make sure you're using Chrome or " +
    "Firefox with a microphone set up, and that you allow the page to access" +
    " the microphone.");
}

function generateColors() {
  for (var hue = 0; hue < 360; hue++) {
    for (var brightness = 0; brightness < 100; brightness++) {
      var color = HSVtoRGB(hue / 360, 1, brightness / 100, true, false);
      bigColorMap.push(color);
      var color2 = HSVtoRGB(hue / 360, 1, brightness / 100, false, true);
      bigColorMap2.push(color2);
    }
  }
}

function recalculateSizes() {
  if (initialized) {
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    shortestSide = Math.min(cv.width, cv.height);
    longestSide = Math.max(cv.width, cv.height);
    hypotenuse = Math.sqrt(cv.width * cv.width + cv.height * cv.height);
    centerRadius = 85.0 / 800 * shortestSide;
    heightMultiplier = 1.0 / 800 * shortestSide;
    bandWidth = Math.PI * 2 * centerRadius / bandCount;
    visualizers[currentViz].resize();
  }
}

function constrain(input, min, max) {
  if (input < min) {
    input = min;
  } else if (input > max) {
    input = max;
  }
  return input;
}

function average(array) {
    var sum = 0; 
    for (var i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}

// TODO: fix this function
function reduceBuckets(input, size) {
  var output = [];
  var increment = input.length / size;
  for (var i = 0; i < size; i++) {
    var band = 0;
    var lower = increment * i;
    var lowerI = Math.floor(lower);
    var higher = increment * (i + 1)
    var higherI = Math.ceil(higher)
    for (var j = lowerI; j < higherI; j++) {
      if (i == lowerI) {
        band += (1-(lower - lowerI)) * input[i];
      }
      else if (i == higherI - 1) {
        band += (1-(higherI - higher)) * input[i];
      }
      else {
        band += input[i];
      }
    }
    band /= increment;
    output.push(band);
  }
  return output;
}

// http://stackoverflow.com/a/5624139
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// http://stackoverflow.com/a/17243070
function HSVtoRGB(h, s, v, hex, separate) {
    var r, g, b, i, f, p, q, t;
    if (h && s === undefined && v === undefined) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);
    if (hex) {
      return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    } else if (separate) {
      return [r, g, b];
    } else {
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
}