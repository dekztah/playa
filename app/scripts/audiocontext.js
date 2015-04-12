'use strict';

angular.module('playa').factory('audioContext', function () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var ac = new window.AudioContext(),
        player = document.getElementById('player'),
        analyserBottomCanvas = document.getElementById('analyser-bottom'),
        analyserTopCanvas = document.getElementById('analyser-top'),
        oscCanvas = document.getElementById('osc');

    var analyser = ac.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 256;

    var osc = ac.createAnalyser();
    osc.smoothingTimeConstant = 0.3;
    osc.fftSize = 2048;

    var gainControl = ac.createGain();

    var source = ac.createMediaElementSource(player);
    source.connect(gainControl);
    gainControl.connect(osc);
    gainControl.connect(analyser);
    gainControl.connect(ac.destination);

    var audioEnv = {
        player: player,
        analyserBottomContext: analyserBottomCanvas.getContext('2d'),
        analyserTopContext: analyserTopCanvas.getContext('2d'),
        oscContext: oscCanvas.getContext('2d'),
        analyser: analyser,
        osc: osc,
        gain: gainControl.gain
    };

    return audioEnv;
});
