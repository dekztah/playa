'use strict';

angular.module('playa').service('helperService', function ($window) {
    var moment = $window.moment;

    this.duration = function(duration) {
        var hours = moment.duration(duration).get('hours');
        var minutes = moment.duration(duration).get('minutes');
        var seconds = moment.duration(duration).get('seconds');
        if ((seconds / 10) < 1) {
            seconds = '0' + seconds;
        }
        if (hours !== 0) {
            if ((minutes /10) < 1) {
                minutes = '0' + minutes;
            }
            return hours + ':' + minutes + ':' + seconds;
        }
        else {
            return minutes + ':' + seconds;
        }
    };

    this.drawAnalyzerBgr = function(canvas, numBars, spacerWidth, spectrumHeight, barWidth) {
        var i,z;
        for (i = 0; i < numBars; ++i) {
            for (z = 0; z < 20; ++z) {
                canvas.fillStyle = '#333';
                canvas.fillRect((i) * spacerWidth, spectrumHeight - z*5, barWidth, 3);
            }
        }
    };
});
