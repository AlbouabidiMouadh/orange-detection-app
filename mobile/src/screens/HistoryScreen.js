import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      const token = await AsyncStorage.getItem('token');

      if (!parsedUser) {
        Alert.alert('Error', 'No logged in user found');
        setLoading(false);
        return;
      }

      // const response = await axios.get(`http://10.183.53.9:5000/api/history`, {
      const response = await axios.get(`http://192.168.1.22:5000/api/history`, {
        params: { userId: parsedUser._id },
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error.message);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const getStatusColor = (result) => {
    if (result?.toLowerCase().includes('healthy')) {
      return '#4CAF50'; // Green for healthy
    } else if (result?.toLowerCase().includes('disease') || result?.toLowerCase().includes('unhealthy')) {
      return '#F44336'; // Red for diseases
    }
    return '#FF9800'; // Orange for unknown/other
  };

  const getStatusIcon = (result) => {
    if (result?.toLowerCase().includes('healthy')) {
      return 'check-circle';
    } else if (result?.toLowerCase().includes('disease') || result?.toLowerCase().includes('unhealthy')) {
      return 'warning';
    }
    return 'help';
  };

  const renderItem = ({item}) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Icon name="access-time" size={16} color="#666" />
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
          <Text style={styles.time}>
            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.result) }]}>
          <Icon 
            name={getStatusIcon(item.result)} 
            size={14} 
            color="#fff" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>
            {item.result?.toLowerCase().includes('healthy') ? 'Healthy' : 
             item.result?.toLowerCase().includes('disease') ? 'Disease' : 'Unknown'}
          </Text>
        </View>
      </View>

      <View style={styles.mediaContainer}>
        {item.contentType === 'image' ? (
          <Image 
            source={{uri: item.contentUrl}} 
            style={styles.media} 
            resizeMode="cover"
          />
        ) : (
          <Video
            source={{uri: item.contentUrl}}
            style={styles.media}
            controls
            resizeMode="cover"
            paused={true}
          />
        )}
        <View style={styles.mediaOverlay}>
          <Icon 
            name={item.contentType === 'image' ? 'photo' : 'videocam'} 
            size={20} 
            color="rgba(255,255,255,0.8)" 
          />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.result} numberOfLines={2}>
          {item.result}
        </Text>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsText}>View Details</Text>
          <Icon name="chevron-right" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your scan history...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Icon name="history" size={64} color={theme.colors.lightGray} />
          <Text style={styles.emptyTitle}>No Scan History</Text>
          <Text style={styles.emptySubtitle}>
            Your apple health scans will appear here
          </Text>
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.scanButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan History</Text>
        <Text style={styles.headerSubtitle}>
          {history.length} scan{history.length !== 1 ? 's' : ''} total
        </Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.regular,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.lightText,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: theme.fonts.regular,
  },
  scanButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.lightText,
    marginTop: 4,
    fontFamily: theme.fonts.regular,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 6,
    marginRight: 8,
    fontFamily: theme.fonts.medium,
  },
  time: {
    fontSize: 12,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.regular,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
  },
  mediaContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  mediaOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  result: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
    marginRight: 12,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
    marginRight: 4,
  },
});