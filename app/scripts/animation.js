'use strict';

angular.module('playa').factory('animation', function ($window, audioContext) {
    var self = this,
        spacerWidth = 23,
        barWidth = 21,
        spectrumHeight = 100,
        numBars = 20,
        screenWidth = $window.innerWidth,
        screenHeight = $window.innerHeight/2,
        analyserData,
        oscData,
        magnitude,
        i, y;

    self.requestId = null;
    // analyserData = new Uint8Array(audioContext.analyser.frequencyBinCount);
    analyserData = new Float32Array(audioContext.analyser.frequencyBinCount);
    oscData = new Uint8Array(audioContext.osc.frequencyBinCount);

    audioContext.analyserTopContext.fillStyle = '#66D9EF';
    audioContext.oscContext.lineWidth = 2;
    audioContext.oscContext.strokeStyle = '#A6E22E';

    self.animate = function() {
        self.requestId = $window.requestAnimationFrame(self.animate);
        self.loop();

    };

    self.killAnimation = function() {
        if (self.requestId) {
            $window.cancelAnimationFrame(self.requestId);
            self.requestId = undefined;
            // audioContext.analyserTopContext.clearRect(0, 0, 460, 100);
            // audioContext.oscContext.clearRect(0, 0, 460, 100);
        }
    };

    self.loop = function() {

        // analyser
        audioContext.analyserTopContext.clearRect(0, 0, 460, spectrumHeight);
        // audioContext.analyser.getByteFrequencyData(analyserData);
        audioContext.analyser.getFloatFrequencyData(analyserData);
        // console.log(analyserData.length);
        for (i = 0; i < numBars; ++i) {
            magnitude = ( (100 + analyserData[3 + i*6]) * 1.15).toFixed();

            for (y = 0; y < (magnitude / 5); ++y) {
                audioContext.analyserTopContext.fillRect((i) * spacerWidth, spectrumHeight - y*5, barWidth, 3);
            }
        }

        // oscilloscope
        audioContext.osc.getByteTimeDomainData(oscData);
        audioContext.oscContext.clearRect(0, 0, 460, 300);

        audioContext.oscContext.beginPath();
        for (i = 0; i < screenWidth/2; i++) {
            audioContext.oscContext.lineTo(i*2, oscData[i]/2.56);
        }
        audioContext.oscContext.stroke();
    };

    return self;
});
