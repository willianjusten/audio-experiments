// Define audio information and load
var audio = new Audio();
audio.src = 'pegboard.mp3';
audio.loop = true;
audio.autoplay = true;
audio.crossOrigin = "anonymous";

// Define variables for analyser
var audioContext, analyser, source, fbc_array;

// Define Audio Analyser Helpers
function createAudioContext() {
    // creating the context and pluging the stream to api node
    audioContext = new (window.AudioContext || window.webkitAudioContext);
    source = audioContext.createMediaElementSource(audio);

    // creating the analyser and defining the frequency array
    analyser = audioContext.createAnalyser();
    fbc_array = new Uint8Array(analyser.frequencyBinCount);

    // Connect the output of the source to the input of the analyser
    source.connect(analyser);

    // Connect the output of the analyser to the destination
    analyser.connect(audioContext.destination);
}

// Define main variables for canvas start
var canvas, canvasCtx;

// Define Canvas helpers
function createCanvas() {
    canvas = document.getElementById('analyser');
    canvasCtx = canvas.getContext('2d');
}

function defineSizesCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// define variables to draw
var bars, bar_x, bar_width, bar_height;

// Create the animation
function frameLooper() {
    // recursive to create our animation
    window.requestAnimationFrame(frameLooper);
    // Get the new frequency data
    analyser.getByteFrequencyData(fbc_array);
    // udpate the visualization
    render();
}

// Draw 
function render() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height); 
    canvasCtx.fillStyle = 'green';
    bars = 100;
    for (var i = 0; i < bars; i++) {
        bar_width = canvas.width / bars;
        bar_x = i * (bar_width + 5);
        bar_height = -(fbc_array[i]);
        canvasCtx.fillRect(bar_x, canvas.height, bar_width, bar_height);
    }
}

// call the magic =D
function init() {
    createAudioContext();
    createCanvas();
    defineSizesCanvas();
    frameLooper();
}

window.addEventListener('load', init, false);
window.addEventListener('resize', defineSizesCanvas, false);