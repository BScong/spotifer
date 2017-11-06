/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = 'CLIENT_ID'; // Your client id
var client_secret = 'CLIENT_SECRET'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var calculateMedianSorted = function(sortedArray){
  len = sortedArray.length;
  if (len % 2 == 0){
    return (sortedArray[len/2]+sortedArray[len/2-1])/2;
  }
  else {
    return sortedArray[Math.floor(len/2)];
  }

}

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        var topTracks = {
          url:'https://api.spotify.com/v1/me/top/tracks?limit=50',
          headers: { 'Authorization': 'Bearer ' + access_token},
          json:true,
          //limit:'50'
          //time_range & offset ?
        }
        request.get(topTracks, function(error, response, body){
          var tracks = [];
          items = body.items;
          nbItems = items.length;
          itemsLeft = nbItems;
          var dance = [];
          var energy = [];
          var instru = [];
          var acous = [];
          var valence = [];
          var speech = [];
          var featuresData = {};

          for(var i = 0; i<nbItems;i++){
            var features = {
              url:'https://api.spotify.com/v1/audio-features/'+items[i].id,
              headers: { 'Authorization': 'Bearer ' + access_token},
              json:true,  
            }
            request.get(features,function(error, response,body){
              dance.push(body.danceability);
              energy.push(body.energy);
              instru.push(body.instrumentalness);
              acous.push(body.acousticness);
              valence.push(body.valence);
              speech.push(body.speechiness);
              itemsLeft--;
              if (itemsLeft==0){
                dance.sort();
                energy.sort();
                instru.sort();
                acous.sort();
                valence.sort();
                speech.sort();
                featuresData = {
                  danceability_median:calculateMedianSorted(dance),
                  danceability_max:dance[dance.length-1],
                  danceability_min:dance[0],

                  energy_median:calculateMedianSorted(energy),
                  energy_max:energy[energy.length-1],
                  energy_min:energy[0],

                  instrumentalness_median:calculateMedianSorted(instru),
                  instrumentalness_max:instru[instru.length-1],
                  instrumentalness_min:instru[0],

                  acousticness_median:calculateMedianSorted(acous),
                  acousticness_max:acous[acous.length-1],
                  acousticness_min:acous[0],

                  valence_median:calculateMedianSorted(valence),
                  valence_max:valence[valence.length-1],
                  valence_min:valence[0],

                  speechiness_median:calculateMedianSorted(speech),
                  speechiness_max:speech[speech.length-1],
                  speechiness_min:speech[0],

                  nbTracks:nbItems,
                }

                request.get(options, function(error, response, body) {
                   featuresData.email = body.email;
                   featuresData.display_name = body.display_name;
                   if(body.images.length >= 1){
                      featuresData.user_image_url = body.images[0].url;
                   }
                   else {
                    featuresData.user_image_url = body.images;
                   }
                   console.log(featuresData);

                   res.redirect('/print.html?' +
                    querystring.stringify(featuresData));
                });

              }
            })
          }
          

         



          //console.log(items);
        })

        // we can also pass the token to the browser to make requests from there
        /*res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));*/
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);
