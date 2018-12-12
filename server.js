var express = require('express');
var request = require('request');
var fs = require('fs');
var http = require('http');
const app = express();
const spotify = require('spotify-web-api-node');
var spotifyClientId = '2fa6370449d5470f8b09881d9b455dc7';
var spotifyClientSecret = 'c4d8d7a7564b4192ab72392787540526';
var qplaylistId = null;
var scopes = 'user-read-private user-read-email user-read-birthdate user-top-read playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';
var authstring = 'Basic ' + Buffer.from((spotifyClientId + ':' + spotifyClientSecret)).toString('base64');
const current_uri = 'http://quickplay.herokuapp.com';
const PORT = process.env.PORT || 3000;
// const current_uri = 'http://localhost:9000';
// const PORT = 9000;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// credentials are optional
var spotifyApi = new spotify({
    clientId: spotifyClientId,
    clientSecret: spotifyClientSecret,
    redirectUri: current_uri
});
app.use(express.static(__dirname + '/web'));

app.get('/', (req, res) => {
    if (!spotifyApi.getAccessToken()) {
        res.redirect('/login');
    }

    res.sendFile(__dirname + '/web/views/index.html');
});

app.get('/login', function (req, res) {

    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + spotifyClientId +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(current_uri + '/getauthtoken'));
});

app.get('/getauthtoken', function (req, res) {
    request.post({
        "headers": { "content-type": "application/x-www-form-urlencoded", 'Authorization': authstring },
        "url": "https://accounts.spotify.com/api/token",
        "body": 'grant_type=authorization_code' +
            '&code=' + req.query.code +
            '&redirect_uri=' + encodeURIComponent(current_uri + '/getauthtoken')
    }, (error, response, body) => {
        var bod = JSON.parse(body);
        var token = bod.access_token;
        spotifyApi.setAccessToken(token);
        spotifyApi.setRefreshToken(bod.refresh_token);
        // Get the authenticated user
        res.redirect('/');
    });

});


app.get('/usertoptracks', (req, res) => {
    spotifyApi.getTopTracks('tracks')
        .then(function (data) {
            res.json(data.body);
        }, function (err) {
            console.log('Something went wrong!', err);
        });
});

app.get('/top50', (req, res) => {
    spotifyApi.getPlaylistTracks('4JkkvMpVl4lSioqQjeAL0q')//  << TOP 50
        .then(function (data) {
            res.json(data.body);
        }, function (err) {
            console.log('Something went wrong!', err);
        });
});

app.get('/throwback', (req, res) => {
    spotifyApi.getPlaylistTracks('5OkClPzP8IPA1dO0Pc78OF')
        .then(function (data) {
            res.json(data.body);
        }, function (err) {
            console.log('Something went wrong!', err);
        });
});

app.get('/createplaylist', (req, res) => {
    spotifyApi.getMe()
        .then(function (data) {
            var userId = data.body.id;
            spotifyApi.getUserPlaylists(data.body.id)
                .then(function (data) {
                    var playlists = data.body.items;
                    var qplaylists = playlists.filter(p => p.name == "Qplay Discovery");
                    if (qplaylists.length <= 0) {
                        // Create Playlist
                        spotifyApi.createPlaylist(userId, 'Qplay Discovery', { 'public': true })
                            .then(function (data) {
                                qplaylistId = data.body.id;
                                console.log("Created Playlist!");
                            }, function (err) {
                                console.log('Something went wrong!', err);
                            });
                    } else {
                        qplaylistId = qplaylists[0].id;
                    }
                    //res.json(data.body);
                }, function (err) {
                    console.log('Something went wrong!', err);
                });

        }, function (err) {
            console.log('Something went wrong!', err);
        });
});




app.listen(PORT, () => {
    console.log('Quickplay Started...');
});