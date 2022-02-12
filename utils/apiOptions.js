import axios from "axios";

export const myTopTracks = (setterFn, token) => {
  axios("https://api.spotify.com/v1/me/top/tracks?time_range=short_term", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => {
      setterFn(response.data.items);
    })
    .catch((error) => {
      console.log("error", error.message);
    });
};

export const albumTracks = (albumId, setterFn, token) => {
  axios(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => {
      // Transform the response
      const transformedResponse = response.data.tracks.items.map((item) => {
        item.album = { images: response.data.images, name: response.data.name };
        return item;
      });
      setterFn(transformedResponse);
    })
    .catch((error) => {
      console.log("error", error);
    });
};
