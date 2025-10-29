import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  Linking,
} from "react-native";
import axios from "axios";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from "../styles/theme";

const { width } = Dimensions.get('window');

export default function NewsScreen({ navigation }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      // const response = await axios.get("http://10.183.53.9:5000/api/news");
      const response = await axios.get("http://10.23.130.218:5000/api/news");
      setNews(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load news articles");
      console.error("News fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const handleNewsPress = (item) => {
    if (item.url) {
      Linking.openURL(item.url).catch(err => {
        Alert.alert("Error", "Could not open the news article");
      });
    }
  };

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => handleNewsPress(item)}
      activeOpacity={0.9}
    >
      {item.imageUrl ? (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.newsImage} 
          resizeMode="cover"
        />
      ) : (
        <View style={styles.newsImagePlaceholder}>
          <Icon name="article" size={40} color={theme.colors.lightGray} />
        </View>
      )}
      
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={styles.newsContentText} numberOfLines={3}>
          {item.content}
        </Text>
        
        <View style={styles.newsFooter}>
          <View style={styles.dateContainer}>
            <Icon name="calendar-today" size={14} color={theme.colors.lightText} />
            <Text style={styles.newsDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          
          {item.url && (
            <View style={styles.readMore}>
              <Text style={styles.readMoreText}>Read more</Text>
              <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading latest news...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Apple Health News</Text>
        <Text style={styles.headerSubtitle}>
          Latest updates on apple cultivation and health
        </Text>
      </View>

      <FlatList
        data={news}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item._id || Math.random().toString()}
        contentContainerStyle={styles.newsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="news" size={64} color={theme.colors.lightGray} />
            <Text style={styles.emptyText}>No news articles available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for the latest updates
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Icon name="home" size={20} color={theme.colors.white} />
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.regular,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.regular,
  },
  newsList: {
    padding: 16,
    paddingTop: 0,
  },
  newsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 180,
  },
  newsImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.lightGray + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
    lineHeight: 24,
  },
  newsContentText: {
    fontSize: 14,
    color: theme.colors.lightText,
    marginBottom: 12,
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 12,
    color: theme.colors.lightText,
    marginLeft: 6,
    fontFamily: theme.fonts.regular,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: 4,
    fontFamily: theme.fonts.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.lightText,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: theme.fonts.medium,
  },
});