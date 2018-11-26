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
    $scope.startTime = 40;
    $scope.tracks = [
        { url: 'intoyou.mp3', isSaved: false, isPlayed: false },
        { url: 'myboo.mp3', isSaved: false, isPlayed: false },
        { url: 'thisishowwedoit.mp3', isSaved: false, isPlayed: false },
        { url: 'intoyou.mp3', isSaved: false, isPlayed: false },
        { url: 'myboo.mp3', isSaved: false, isPlayed: false },
        { url: 'thisishowwedoit.mp3', isSaved: false, isPlayed: false },
        { url: 'intoyou.mp3', isSaved: false, isPlayed: false },
        { url: 'myboo.mp3', isSaved: false, isPlayed: false },
        { url: 'thisishowwedoit.mp3', isSaved: false, isPlayed: false },
        { url: 'intoyou.mp3', isSaved: false, isPlayed: false },
        { url: 'myboo.mp3', isSaved: false, isPlayed: false },
        { url: 'thisishowwedoit.mp3', isSaved: false, isPlayed: false }
    ];

    $scope.init = function () {
        $scope.player.src = $scope.remoteFolder + $scope.tracks[$scope.queueCount].url;
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
        $scope.pause();
        $scope.$digest();
        // Then animate control buttons to save or throw
    };

    $scope.percentageCompletion = function () {
        //return ($scope.player.currentTime / $scope.player.duration) * 100; // WHOLE SONG
        return (($scope.player.currentTime - $scope.startTime) / ($scope.playDuration)) * 100; // 7 Seconds
    };

    $scope.play = function () {
        $scope.player.play();
    };

    $scope.pause = function () {
        $scope.player.pause();
    };

    $scope.next = function () {
        $scope.queueCount++;
        $scope.init();
        $scope.play();
        $('.music-carousel').slick('slickGoTo', $scope.queueCount);
    };

    $scope.playIndex = function (index) {
        $scope.queueCount = index;
        $scope.init();
        $scope.play();
        //$scope.$digest();
    };

    $rootScope.$broadcast('controlInitDone');

    $scope.init();
});

app.controller('CarouselController', function ($rootScope, $scope, $http, $filter, $timeout) {

    $scope.init = function () {
        var controlScope = angular.element(document.getElementById('controlScope')).scope();
        $scope.tracks = controlScope.tracks;
        $timeout(function () {
            $('.music-carousel').slick({arrows: false});
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

