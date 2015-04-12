'use strict';

angular.module('playa').controller('audioCtrl', function ($scope, audioContext, animation, helperService, $q) {
    var player = audioContext.player;

    // does not belong here
    $scope.window = {
        close: function () {
            window.close();
        }
    };

    $scope.playerData = {
        playingIndex: null,
        selectedIndex: null
    };
    $scope.playlist = [];

    player.addEventListener('timeupdate', function() {
        $scope.$apply(function() {
            $scope.playerData.currentTime = player.currentTime;
            $scope.playerData.currentTimeFormatted = helperService.duration($scope.playerData.currentTime * 1000);
            $scope.playerData.duration = player.duration;
            $scope.playerData.durationFormatted = helperService.duration($scope.playerData.duration * 1000);
            if (player.currentTime === player.duration) {
                if ($scope.playlist.length - 1 > $scope.playerData.playingIndex) {
                    $scope.controlAudio.play($scope.playerData.playingIndex + 1);
                } else {
                    $scope.playerData.playingIndex = null;
                    $scope.playerData.currentTime = 0;
                    $scope.playerData.currentTrack = false;
                    animation.killAnimation();
                }
            }
        });
    }, false);

    helperService.drawAnalyzerBgr(audioContext.analyserBottomContext, 20, 23, 100, 21);
    $scope.openFile = function() {
        chrome.fileSystem.chooseEntry({
            type: 'openFile',
            accepts:[{
                extensions: ['mp3', 'wav']
            }],
        }, function(data){
            if (chrome.runtime.lastError) {
                console.warn(chrome.runtime.lastError.message);
            } else {
                $scope.playlist = [];
                $scope.$apply(function(){
                    $scope.playlist.push(data);
                    $scope.playerData.lastPlayedIndex = null;
                    $scope.controlAudio.play(0);
                });
            }
        });
    };

    var playlist = [];
    $scope.openDir = function() {
        chrome.fileSystem.chooseEntry({
            type: 'openDirectory',
            accepts:[{
                extensions: ['mp3']
            }],
        }, function(data){
            if (chrome.runtime.lastError) {
                console.warn(chrome.runtime.lastError.message);
            } else {
                playlist = [];
                var reader = data.createReader();
                var readEntries = function() {
                    reader.readEntries (function(entries) {
                        if (!entries.length) {
                            // console.log('read end');
                        } else {
                            for (var i = 0; i < entries.length; i++) {
                                var extension = entries[i].name.substr(entries[i].name.lastIndexOf('.')+1);
                                if (entries[i].isFile && (extension === 'mp3' || extension === 'wav')) {
                                    playlist.push(entries[i]);
                                }
                            }
                            $scope.playlist = [];
                            $scope.$apply(function(){
                                $scope.playlist = playlist;
                            });
                            readEntries();
                        }
                    }, function(){

                    });
                };

                readEntries();
            }
        });
    };

    var getFileData = function(file) {
        var deferred = $q.defer();
        file.file(function(fileData){
            var data = {
                url: window.URL.createObjectURL(fileData),
                name: fileData.name
            };
            deferred.resolve(data);

        });
        return deferred.promise;
    };

    $scope.controlAudio = {
        play: function(index) {
            if (!index) {
                index = 0;
            }
            $scope.playerData.currentTrack = $scope.playlist[index];

            if (!angular.equals(index, $scope.playerData.lastPlayedIndex)) {
                $scope.playerData.lastPlayedIndex = index;
                $scope.playerData.currentTime = 0;
                getFileData($scope.playlist[index]).then(function(file){
                    $scope.playerData.fileName = file.name;
                    $scope.playerData.selectedIndex = index;
                    player.setAttribute('src', file.url);
                    player.play();
                });
            } else {
                player.play();
            }

            $scope.playerData.playingIndex = index;

            if (!animation.requestId) {
                animation.animate();
            }
        },
        pause: function() {
            $scope.playerData.lastPlayedIndex = $scope.playerData.playingIndex;
            $scope.playerData.playingIndex = null;
            player.pause();
            animation.killAnimation();
        },
        seekTo: function(event) {
            var xpos = (event.offsetX === undefined ? event.layerX : event.offsetX) / event.target.offsetWidth;
            player.currentTime = (xpos * player.duration);
        },
        seekPreview: function(event) {
            var xpos = (event.offsetX === undefined ? event.layerX : event.offsetX);
            var cursor = {
                xpos: xpos,
                time: helperService.duration(xpos * player.duration * 1000 / event.target.clientWidth)
            };
            return cursor;
        }
    };

    $scope.helpers = {
        setVolume: function(value) {
            audioContext.gain.value = ((value * value) / 10000);
        },
        getTimes: function(n) {
            return new Array(n);
        },
        isCurrent: function(index) {
            return angular.equals(index, $scope.playerData.playingIndex);
        }
    };
});
