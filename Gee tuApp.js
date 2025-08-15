import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Firebase Setup
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "geetuapp.firebaseapp.com",
  projectId: "geetuapp",
  storageBucket: "geetuapp.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:android:abcdef1234567890"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Game Card Component
const GameCard = ({ game, onPress }) => (
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

// Game List Screen
const GameListScreen = ({ navigation }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const snapshot = await db.collection('games').get();
        setGames(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("गेम लोड करने में त्रुटि:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  return loading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.loadingText}>गेम लोड हो रहे हैं...</Text>
    </View>
  ) : (
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
    
    RNFetchBlob.config({
      fileCache: true,
      path: `${RNFetchBlob.fs.dirs.DownloadDir}/game_${Date.now()}.apk`,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        title: `${game.name} डाउनलोड हो रहा है`,
        description: 'कृपया प्रतीक्षा करें...',
      }
    }).fetch('GET', game.apkUrl)
      .progress((received, total) => setProgress(Math.floor((received / total) * 100)))
      .then(res => RNFetchBlob.android.actionViewIntent(res.path(), 'application/vnd.android.package-archive'))
      .catch(error => console.error('डाउनलोड त्रुटि:', error))
      .finally(() => setDownloading(false));
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
          <Text>⭐ रेटिंग: {game.rating}/5</Text>
          <Text>📥 डाउनलोड: {game.downloads}</Text>
          <Text>📦 साइज़: {game.size} MB</Text>
          <Text>💰 प्राइस: {game.price === 0 ? 'फ्री' : `₹${game.price}`}</Text>
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
      </View>
    </ScrollView>
  );
};

// Main App
const Stack = createStackNavigator();
const GeetuApp = () => (
  <NavigationContainer>
    <StatusBar backgroundColor="#4CAF50" />
    <Stack.Navigator>
      <Stack.Screen 
        name="GameStore" 
        component={GameListScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="GameDetail" 
        component={GameDetailScreen}
        options={{ 
          title: 'गेम डिटेल',
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#fff'
        }} 
      />
    </Stack.Navigator>
  </NavigationContainer>
);

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f8ff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#fff', backgroundColor: '#4CAF50', padding: 15 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, margin: 10, padding: 15, elevation: 3 },
  icon: { width: 70, height: 70, borderRadius: 15, marginRight: 15 },
  details: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  description: { fontSize: 14, color: '#666', marginBottom: 10 },
  infoContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  rating: { backgroundColor: '#ffeaa7', padding: 5, borderRadius: 10 },
  size: { backgroundColor: '#a29bfe', padding: 5, borderRadius: 10, color: '#fff' },
  downloads: { backgroundColor: '#74b9ff', padding: 5, borderRadius: 10, color: '#fff' },
  backButton: { position: 'absolute', top: 20, left: 15, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  backText: { color: '#fff', fontWeight: 'bold' },
  banner: { width: '100%', height: 250 },
  content: { padding: 20 },
  headerDetail: { flexDirection: 'row', marginBottom: 20 },
  iconDetail: { width: 80, height: 80, borderRadius: 15 },
  titleContainer: { marginLeft: 15, justifyContent: 'center' },
  titleDetail: { fontSize: 24, fontWeight: 'bold' },
  developer: { fontSize: 16, color: '#666' },
  descriptionDetail: { fontSize: 16, marginBottom: 20 },
  detailsContainer: { marginBottom: 30 },
  installButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center' },
  installText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  downloadContainer: { alignItems: 'center', padding: 20, backgroundColor: '#e0f7fa', borderRadius: 10 },
  downloadText: { marginTop: 10, fontSize: 16, fontWeight: 'bold' }
});

export default GeetuApp;
