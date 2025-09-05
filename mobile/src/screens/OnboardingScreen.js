import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions, 
  StatusBar,
  SafeAreaView,
  Animated,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Theme colors for apple-themed app
const theme = {
  colors: {
    primary: '#4CAF50', // Apple green
    secondary: '#FF3B30', // Apple red
    background: '#F8F9FA', // Light background
    accent: '#2196F3', // Blue accent
    white: '#FFFFFF',
    text: '#333333',
    lightText: '#666666',
  }
};

export default function OnboardingScreen({ navigation, route }) {
  const { setIsFirstLaunch } = route.params;
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const slidesRef = React.useRef(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleDone = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    setIsFirstLaunch(false);
    navigation.navigate('Login');
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleDone();
    }
  };

  const handleSkip = () => {
    handleDone();
  };

  const onboardingData = [
    {
      id: 1,
      title: 'Welcome to Apple Health Scan',
      description: 'Detect diseases in your apple fruits and leaves with advanced AI technology.',
      backgroundColor: theme.colors.primary,
      // image: require('../assets/onboarding1.png') // Replace with your actual image
    },
    {
      id: 2,
      title: 'Upload & Analyze',
      description: 'Simply take a photo of your apple or leaf and get instant analysis results.',
      backgroundColor: theme.colors.secondary,
      // image: require('../assets/onboarding2.png') // Replace with your actual image
    },
    {
      id: 3,
      title: 'Stay Informed',
      description: 'Get the latest news and tips about apple cultivation and disease prevention.',
      backgroundColor: theme.colors.accent,
      // image: require('../assets/onboarding3.png') // Replace with your actual image
    },
  ];

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.imageContainer}>
          <Image 
            source={item.image} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp'
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp'
          });
          
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { width: dotWidth, opacity }
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={onboardingData[currentIndex].backgroundColor} barStyle="light-content" />
      
      <Animated.FlatList
        ref={slidesRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const contentOffsetX = event.nativeEvent.contentOffset.x;
          const index = Math.floor(contentOffsetX / width);
          setCurrentIndex(index);
        }}
      />
      
      <View style={styles.footer}>
        {renderDots()}
        
        <View style={styles.buttonsContainer}>
          {currentIndex < onboardingData.length - 1 ? (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Icon 
              name={currentIndex === onboardingData.length - 1 ? "check" : "arrow-forward"} 
              size={24} 
              color={theme.colors.white} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.7,
    height: height * 0.4,
  },
  textContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Roboto-Bold',
  },
  description: {
    fontSize: 16,
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Roboto-Regular',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.white,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 60,
  },
});