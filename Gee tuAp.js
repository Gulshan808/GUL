// App.js - Geetu Game Store (Single File Version)

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "geetuapp.firebaseapp.com",
  projectId: "geetuapp",
  storageBucket: "geetuapp.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:android:abcdef1234567890"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Game Card Component
const GameCard = ({ game, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: game.icon }} style={styles.icon} />
      <View style={styles.details}>
        <Text style={styles.title}>{game.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{game.description}</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.rating}>⭐ {game.rating}</Text>
          <Text style={styles.size}>📦 {game.size} MB</Text>
          <Text style={styles.downloads}>📥 {game.downloads}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Game List Screen
const GameListScreen = ({ navigation }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const snapshot = await db.collection('games').get();
        const gamesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGames(gamesList);
      } catch (error) {
        console.error("गेम लोड करने में त्रुटि:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>गेम लोड हो रहे हैं...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>गीतू गेम स्टोर</Text>
      <FlatList
        data={games}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GameCard 
            game={item} 
            onPress={() => navigation.navigate('GameDetail', { game: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

// Game Detail Screen
const GameDetailScreen = ({ route, navigation }) => {
  const { game } = route.params;
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const downloadGame = () => {
    if (downloading) return;
    
    setDownloading(true);
    setProgress(0);
    
    const { dirs } = RNFetchBlob.fs;
    const filePath = `${dirs.DownloadDir}/${game.name.replace(/\s+/g, '_')}.apk`;
    
    RNFetchBlob.config({
      fileCache: true,
      path: filePath,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        title: `${game.name} डाउनलोड हो रहा है`,
        description: 'कृपया प्रतीक्षा करें...',
        mime: 'application/vnd.android.package-archive',
      }
    })
    .fetch('GET', game.apkUrl, {})
    .progress((received, total) => {
      setProgress(Math.floor((received / total) * 100));
    })
    .then(res => {
      setDownloading(false);
      RNFetchBlob.android.actionViewIntent(res.path(), 'application/vnd.android.package-archive');
    })
    .catch(error => {
      setDownloading(false);
      console.error('डाउनलोड त्रुटि:', error);
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← वापस</Text>
      </TouchableOpacity>
      
      <Image source={{ uri: game.banner }} style={styles.banner} />
      
      <View style={styles.content}>
        <View style={styles.headerDetail}>
          <Image source={{ uri: game.icon }} style={styles.iconDetail} />
          <View style={styles.titleContainer}>
            <Text style={styles.titleDetail}>{game.name}</Text>
            <Text style={styles.developer}>{game.developer}</Text>
          </View>
        </View>

        <Text style={styles.descriptionDetail}>{game.description}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailEmoji}>⭐</Text>
            <Text style={styles.detailText}>रेटिंग: {game.rating}/5</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailEmoji}>📥</Text>
            <Text style={styles.detailText}>डाउनलोड: {game.downloads}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailEmoji}>📦</Text>
            <Text style={styles.detailText}>साइज़: {game.size} MB</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailEmoji}>💰</Text>
            <Text style={styles.detailText}>प्राइस: {game.price === 0 ? 'फ्री' : `₹${game.price}`}</Text>
          </View>
        </View>

        {downloading ? (
          <View style={styles.downloadContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.downloadText}>डाउनलोड हो रहा है... {progress}%</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.installButton} onPress={downloadGame}>
            <Text style={styles.installText}>इंस्टॉल करें</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.screenshotsContainer}>
          <Text style={styles.sectionTitle}>स्क्रीनशॉट्स</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {game.screenshots && game.screenshots.map((screenshot, index) => (
              <Image 
                key={index} 
                source={{ uri: screenshot }} 
                style={styles.screenshot} 
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
};

// Main App Component
const App = () => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#388E3C" barStyle="light-content" />
      <Stack.Navigator>
        <Stack.Screen 
          name="GameStore" 
          component={GameListScreen}
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="GameDetail" 
          component={GameDetailScreen}
          options={{ 
            title: 'गेम डिटेल',
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  // ... (सभी स्टाइल्स यहाँ आएंगी)
});

export default App;
