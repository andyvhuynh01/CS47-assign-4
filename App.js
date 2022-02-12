import { StyleSheet, Text, Image, SafeAreaView, View, FlatList, Pressable, ImageStore, ProgressBarAndroidComponent } from "react-native";
import { useState, useEffect } from "react";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import { myTopTracks, albumTracks } from "./utils/apiOptions";
import { REDIRECT_URI, SCOPES, CLIENT_ID, ALBUM_ID } from "./utils/constants";
import Colors from "./Themes/colors"
import Images from "./Themes/images"
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import millisToMinutesAndSeconds from './utils/millisToMinuteSeconds';
import { WebView } from "react-native-webview";


// Endpoints for authorizing with Spotify
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token"
};


export default function App() {

  // (1) PROVIDED BACK-END
  ///////////////////////////
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: CLIENT_ID,
      scopes: SCOPES,
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: REDIRECT_URI
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      setToken(access_token);
    }
  }, [response]);

  useEffect(() => {
    if (token) {
      // TODO: Select which option you want: Top Tracks or Album Tracks
      // Comment out the one you are not using
      myTopTracks(setTracks, token);
      // albumTracks(ALBUM_ID, setTracks, token);
    }
  }, [token]);

  
  // (2) SONGITEM COMPONET
  ///////////////////////////
  function SongItem({ image, title, artists, album, duration, preview_link, details_link }) {
    const navigation = useNavigation();

    return (
      <View style={styles.item}>
        <View style={styles.indexPart}>
            <Pressable onPress={() => {navigation.navigate("Song Preview", {link: preview_link})}}>   
                <Ionicons name="play-circle" size={25} color="#1eb954"/>
            </Pressable>
        </View>
        <View style={styles.nonIndexPart}>
          <Pressable onPress={() => {navigation.navigate("Song Details", {link: details_link})}}>
            <View style={styles.linkToDetails}>
              <Image
                style={styles.imagePart}
                source={{uri: image}}
              />
              <View style={styles.titleArtistPart}>
                  <Text style={styles.titlePart}  numberOfLines={1}>{title}</Text>
                  <Text style={styles.artistsPart} numberOfLines={1}>{artists}</Text>
              </View>
              <Text style={styles.albumPart} numberOfLines={1}>{album}</Text>
              <Text style={styles.durationPart}>{millisToMinutesAndSeconds(duration)}</Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderItem(item, index) {
    let allArtists1 = []
    for (let i = 0; i < item.artists.length; i++) {
      allArtists1.push(item.artists[i].name)
    }
    let allArtists2 = allArtists1.join(', ')
    console.log(item)
    return (
      <SongItem
        image={item.album.images[0].url}
        title={item.name}
        artists={allArtists2}
        album={item.album.name}
        duration={item.duration_ms}
        details_link={item.external_urls.spotify}
        preview_link={item.preview_url}
      />
    );
  }


  // (3) ON-SCREEN 
  ////////////////////
  let contentDisplayed = null;
  if (token) {
    contentDisplayed =      
      <View style={styles.songsList}>
        <View style={styles.header}>
          <Image style={styles.abIcon} source={Images.spotify}/>
          <Text style={styles.headerText}>My Top Tracks</Text>
        </View>
        <FlatList
          data={tracks} // the array of data that the FlatList displays
          renderItem={({item, index}) => renderItem(item, index)} // function that renders each item
          keyExtractor={(item) => item.id} // unique key for each item
        />
    </View>
  } else {
    contentDisplayed = 
      <Pressable onPress={() => promptAsync()}>
        <View style={styles.authButton}>
          <Image style={styles.abIcon} source={Images.spotify}/>
          <Text style={styles.abText}>
            CONNECT WITH SPOTIFY
          </Text>
        </View>
      </Pressable>
  }

  function HomeScreen() {
    return(
      <SafeAreaView style={styles.container}>
        {contentDisplayed}
      </SafeAreaView>
    );
  }

  function DetailsScreen({route}) {
    const {link} = route.params
    return (
        <WebView
          source={{uri : link}}
        />
    );
  }

  function PreviewScreen({route}) {
    const {link} = route.params
    return (
        <WebView
          source={{uri : link}}
        />
    );
  } 

  const Stack = createStackNavigator();
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Song Details" component={DetailsScreen} options={{headerTintColor: 'white', headerStyle: {backgroundColor: 'black'}}}/>
          <Stack.Screen name="Song Preview" component={PreviewScreen} options={{headerTintColor: 'white', headerStyle: {backgroundColor: 'black'}}}/>
        </Stack.Navigator>
      </NavigationContainer>
  );
}


// (4) STYLES 
/////////////////
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  authButton: {
    height: 40,
    width: 215, 
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: Colors.spotify,
    borderRadius: 99999,
    flexDirection: 'row',
  },
  abIcon: {
    height: 17,
    width: 17
  },
  abText: {
    color: 'white'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  headerText: {
    color: 'white',
    paddingLeft: 10,
    fontSize: 17
  },
  songsList: {
    width: '100%'
  },

  // Song component
item: {
  margin: 10,
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  paddingRight: '5%'
},
indexPart: {
    color: Colors.gray,
    flex: 1,
},
nonIndexPart: {
  flex: 10,
},
linkToDetails: {
  color: Colors.gray,
  flexDirection: 'row',
  alignItems: 'center',
  paddingRight: '5%'
},
imagePart: {
    flex: 2,
    height: undefined,
    aspectRatio: 1/1,
},
titleArtistPart: {
    flex: 3.5,
    color: Colors.gray,
    paddingLeft: 10
},
titlePart: {
    color: Colors.gray,
},
artistsPart: {
    color: Colors.gray,
},
albumPart: {
    flex: 3,
    color: Colors.gray,
},
durationPart: {
    flex: 1,
    color: Colors.gray,
}
});
