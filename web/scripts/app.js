var app = angular.module('InmusikApp', []);

app.config(function ($interpolateProvider, $sceProvider) {
    $interpolateProvider.startSymbol('{[');
    $interpolateProvider.endSymbol(']}');
    $sceProvider.enabled(false);
});

app.controller('MainController', function ($scope, $http, $filter) {

    $scope.init = function () {
    };

    $scope.init();

});

app.controller('ControlController', function ($rootScope, $scope, $http, $filter, $timeout) {
    $scope.defaultPlayduration = 7;
    $scope.player = new Audio();
    $scope.hidePlayPause = true;
    $scope.remoteFolder = 'assets/music/';
    $scope.queueCount = 0;
    $scope.playDuration = $scope.defaultPlayduration; // seconds
    $scope.startTime = 0;
    $scope.tracks = [];

    // Initializing values
    $scope.onplaying = false;
    $scope.onpause = true;

    // On video playing toggle values
    $scope.player.onplaying = function () {
        $scope.onplaying = true;
        $scope.onpause = false;
    };

    // On video pause toggle values
    $scope.player.onpause = function () {
        if ($scope.player.paused && !$scope.userPaused) {
            $scope.player.play();
            $scope.onplaying = true;
            $scope.onpause = false;
        }
        else {
            $scope.userPaused = false;
            $scope.player.pause();
            $scope.onplaying = false;
            $scope.onpause = true;
        }
    };

    $scope.loadTracks = function () {
        $http.get('/top50').then(function (response) {
            for (var i in response.data.items) {
                var item = response.data.items[i].track;
                if (item.preview_url == null) continue;
                $scope.tracks.push({ name: item.name, artist: item.artists[0].name, url: item.preview_url, album_art_url: item.album.images[0].url, isSaved: false, isPlayed: false }, );
            }
            $scope.tracks = $scope.shuffle($scope.tracks);
            $rootScope.$broadcast('controlInitDone');
            $scope.init();
        }, function (err) {
            console.log('Something went wrong!', err);
        });

    };

    $scope.shuffle = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    $scope.init = function () {
        $scope.currentSong = $scope.tracks[$scope.queueCount];
        $scope.player.src = $scope.currentSong.url;
        $scope.player.load();
        $scope.player.currentTime = $scope.startTime;
        $scope.addTimeDisabled = false;
        $scope.playDuration = $scope.defaultPlayduration;
        $scope.hidePlayPause = false;
        $('.add-time-btn').removeClass('ksp');
    };

    $scope.addPlayduration = function (seconds) {
        $scope.playDuration += seconds;
        $scope.player.play();
        $scope.addTimeDisabled = true;
        $('.add-time-btn').removeClass('ksp');
    };

    $scope.player.ontimeupdate = function () {
        $('.progress-pointer').width($scope.percentageCompletion() + '%');

        if (($scope.player.currentTime + 3) > ($scope.startTime + $scope.playDuration)) {
            $('.add-time-btn').addClass('ksp');
        }

        if ($scope.player.currentTime > ($scope.startTime + $scope.playDuration)) {
            $scope.endSong();
        }
    };

    $scope.endSong = function () {
        $scope.hidePlayPause = true;
        $scope.pause(true);
        $scope.$digest();
        // Then animate control buttons to save or throw
    };

    $scope.percentageCompletion = function () {
        //return ($scope.player.currentTime / $scope.player.duration) * 100; // WHOLE SONG
        return (($scope.player.currentTime - $scope.startTime) / ($scope.playDuration)) * 100; // 7 Seconds
    };

    $scope.play = function () {
        if ($scope.player.paused && !$scope.onplaying) {
            $scope.player.play()
        }
    };

    $scope.pause = function (forcePause = false) {
        if (!$scope.player.paused && !$scope.onpause) {
            $scope.player.pause();
            $scope.userPaused = true;
        } else if (forcePause) {
            $scope.onplaying = true;
            $scope.onpause = false;
            $scope.player.pause();

        }
    };

    $scope.next = function () {
        $timeout(function () {
            $scope.queueCount++;
            $scope.init();
            $scope.onplaying = false;
            $scope.play();
            $('.music-carousel').slick('slickGoTo', $scope.queueCount);
        });
    };

    $scope.playIndex = function (index) {
        $timeout(function () {
            $scope.queueCount = index;
            $scope.init();
            $scope.onplaying = false;
            $scope.play();
        });
    };

    $scope.loadTracks();
});

app.controller('CarouselController', function ($rootScope, $scope, $http, $filter, $timeout) {

    $scope.init = function () {
        var controlScope = angular.element(document.getElementById('controlScope')).scope();
        $scope.tracks = controlScope.tracks;
        $timeout(function () {
            $('.music-carousel').slick({ arrows: false });
        });
    };

    $('.music-carousel').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        var controlScope = angular.element(document.getElementById('controlScope')).scope();
        controlScope.playIndex(nextSlide);
    });

    $scope.$on('controlInitDone', function (event, args) {
        $scope.init();
    });


});

