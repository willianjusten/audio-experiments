(function(window, document) {
    // Define audio information and load
    var audio = new Audio();
    audio.src = 'https://willianjusten.com.br/assets/music/track.mp3';
    audio.loop = true;
    audio.autoplay = true;
    audio.crossOrigin = "anonymous";

    // Define main variables for canvas start
    var canvas, canvasCtx;

    function defineSizesCanvas() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvasCtx.canvas.width = w;
        canvasCtx.canvas.height = h;
        cx = w / 2;
        cy = h / 2;
    }

    // Define variables for analyser
    var AudioContext = (window.AudioContext || window.webkitAudioContext),
        audioContext, analyser, source, fbc_array, data, len, total;

    // Define Audio Analyser Helpers
    function createAudioContext() {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024; // change this to more or less triangles
        len = analyser.fftSize / 16;
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    // Define math info for draw
    var i,
        cx = 0,
        cy = 0,
        w = 0,
        h = 0,
        r = 50,
        beginAngle = 0,
        angle,
        twoPI = 2 * Math.PI,
        angleGap = twoPI / 3,
        color = 'rgba(115, 226, 36, 0.5)';

    // Create the animation
    function frameLooper() {
        window.requestAnimationFrame(frameLooper);
        fbc_array = new Uint8Array(analyser.frequencyBinCount);

        canvasCtx.save();
        analyser.getByteFrequencyData(fbc_array);
        data = fbc_array;
        angle = beginAngle;
        canvasCtx.clearRect(0, 0, w, h);
        canvasCtx.strokeStyle = color;
        canvasCtx.globalCompositeOperation = 'lighter';
        canvasCtx.lineWidth = 10;
        total = 0;
        for (i = 8; i < len; i += 2) {
            angle += 0.2;
            canvasCtx.beginPath();
            canvasCtx.moveTo(cx + data[i] * Math.sin(angle), cy + data[i] * Math.cos(angle));
            canvasCtx.lineTo(cx + data[i] * Math.sin(angle + angleGap), cy + data[i] * Math.cos(angle + angleGap));
            canvasCtx.lineTo(cx + data[i] * Math.sin(angle + angleGap * 2), cy + data[i] * Math.cos(angle + angleGap * 2));
            canvasCtx.closePath();
            canvasCtx.stroke();
            total += data[i];
        }
        beginAngle = (beginAngle + 0.00001 * total) % twoPI;
        canvasCtx.restore();
    }

    // call the magic =D
    function init() {
        createAudioContext();
        canvas = document.createElement('canvas');
        canvasCtx = canvas.getContext('2d');
        document.body.appendChild(canvasCtx.canvas);
        defineSizesCanvas();
        frameLooper();
    }

    window.addEventListener('load', init, false);
    window.addEventListener('resize', defineSizesCanvas, false);
})(window, document);