# Spotifer

Backend part of Spotifer. Prototype developed during Spotify hackathon in Gothenburg (Nov 2017).

Based on [web-api-auth-examples](https://github.com/spotify/web-api-auth-examples) from Spotify.

## Project
The goal is to compute the median, the mininum and the maximum of different audio features for the user's top tracks thans to the API. The audio features are for example danceability, energu, instrumentalness, acousticness, valence, speechiness.

Here is an example of result computed for the 50 top tracks of an user :

```
{
    "danceability_median": "0.632",
    "danceability_max": "0.942",
    "danceability_min": "0.33",
    "energy_median": "0.6845",
    "energy_max": "0.9",
    "energy_min": "0.371",
    "instrumentalness_median": "0.000025450000000000002",
    "instrumentalness_max": "0.736",
    "instrumentalness_min": "0",
    "acousticness_median": "0.08285000000000001",
    "acousticness_max": "0.748",
    "acousticness_min": "0.000356",
    "valence_median": "0.4055",
    "valence_max": "0.965",
    "valence_min": "0.06",
    "speechiness_median": "0.07289999999999999",
    "speechiness_max": "0.436",
    "speechiness_min": "0.0305",
    "nbTracks": "50",
    "email": "name@domain.com",
    "display_name": "Name",
    "user_image_url": "url"
}
```

The second goal is then to "match" this user to an another user with close values.

The code is literally quick and dirty, we needed a quick prototype.

Design Proof of Concept : [spotifer](https://framer.cloud/PnyGa)

## Installation

Just run ```npm install```.

## Running the server
Add your Spotify API credentials (```client_id``` and ```client_secret```) to app.js.
Then run ```node app.js```.

Access the server at ```http://localhost:8888/```.


