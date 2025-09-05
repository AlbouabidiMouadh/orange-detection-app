import React, { useState, useCallback, useEffect } from 'react';
   import {
     View,
     Text,
     Image,
     StyleSheet,
     Alert,
     TouchableOpacity,
     ActivityIndicator,
     Dimensions,
     Platform,
     SafeAreaView,
     ScrollView,
   } from 'react-native';
   import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
   import { runModelInference as runAppleModelInference } from '../utils/appleModel';
   import { runModelInference as runLeafModelInference } from '../utils/leafModel';
   import Icon from 'react-native-vector-icons/MaterialIcons';
   import axios from 'axios';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import * as Permissions from 'react-native-permissions';
   import { theme } from '../styles/theme';

   const { width } = Dimensions.get('window');
   const BACKEND_URL = 'https://192.168.1.22:5000/api/history';

   const ActionButton = ({ onPress, iconName, text, description, disabled }) => (
     <TouchableOpacity
       style={[styles.actionButton, disabled && styles.disabledButton]}
       onPress={onPress}
       disabled={disabled}
       activeOpacity={0.8}>
       <View style={styles.actionIconContainer}>
         <Icon name={iconName} size={28} color={theme.colors.white} />
       </View>
       <View style={styles.actionTextContainer}>
         <Text style={styles.actionButtonText}>{text}</Text>
         <Text style={styles.actionButtonDescription}>{description}</Text>
       </View>
       <Icon name="chevron-right" size={20} color={theme.colors.white} />
     </TouchableOpacity>
   );

   export default function HomeScreen({ navigation }) {
     const [media, setMedia] = useState(null);
     const [result, setResult] = useState(null);
     const [loading, setLoading] = useState(false);
     const [user, setUser] = useState(null);
     const [scanCount, setScanCount] = useState(0);
     const [modelType, setModelType] = useState(null); // Track apple or leaf model

     useEffect(() => {
       const loadUser = async () => {
         try {
           const storedUser = await AsyncStorage.getItem('user');
           if (storedUser) {
             const userData = JSON.parse(storedUser);
             setUser(userData);
             setScanCount(24); // Placeholder - replace with actual data
           }
         } catch (err) {
           console.error('Error loading user:', err.message);
         }
       };
       loadUser();
     }, []);

     const saveHistory = useCallback(
       async (contentUrl, contentType, detectionResult, modelType) => {
         if (!user) {
           Alert.alert('Error', 'Please log in to save history');
           return;
         }

         try {
           await axios.post(`${BACKEND_URL}/history`, {
             user: user.email,
             contentType,
             contentUrl,
             result: detectionResult,
             modelType, // Include model type in history
             date: new Date().toISOString(),
           });
           console.log('History saved successfully');
         } catch (err) {
           console.error('Error saving history:', err.message);
         }
       },
       [user],
     );

     const requestCameraPermission = async () => {
       try {
         const permission =
           Platform.OS === 'ios'
             ? Permissions.PERMISSIONS.IOS.CAMERA
             : Permissions.PERMISSIONS.ANDROID.CAMERA;

         const result = await Permissions.request(permission);
         return result === Permissions.RESULTS.GRANTED;
       } catch (err) {
         console.error('Error requesting camera permission:', err.message);
         return false;
       }
     };

     const processMedia = async (uri, type, model) => {
       setMedia(uri);
       setModelType(model);
       setLoading(true);

       try {
         const detectionResult = await Promise.race([
           model === 'apple' ? runAppleModelInference(uri) : runLeafModelInference(uri),
           new Promise((_, reject) =>
             setTimeout(() => reject(new Error('Inference timeout')), 10000),
           ),
         ]);
         setResult(detectionResult);
         await saveHistory(uri, 'image', detectionResult, model);
       } catch (err) {
         Alert.alert('Error', err.message || 'Failed to process image');
       } finally {
         setLoading(false);
       }
     };

     const pickFromGallery = useCallback(
       async (model) => {
         const options = {
           mediaType: 'photo',
           quality: 1,
           maxWidth: 800,
           maxHeight: 800,
         };

         launchImageLibrary(options, async response => {
           if (response.didCancel) return;
           if (response.errorCode) {
             Alert.alert('Error', response.errorMessage || 'Failed to pick image');
             return;
           }
           if (response.assets && response.assets.length > 0) {
             await processMedia(response.assets[0].uri, 'photo', model);
           }
         });
       },
       [saveHistory],
     );

     const takePhoto = useCallback(
       async (model) => {
         const hasPermission = await requestCameraPermission();
         if (!hasPermission) {
           Alert.alert(
             'Permission Required',
             'Camera access is required to take photos',
           );
           return;
         }

         const options = {
           mediaType: 'photo',
           quality: 1,
           maxWidth: 800,
           maxHeight: 800,
         };

         launchCamera(options, async response => {
           if (response.didCancel) return;
           if (response.errorCode) {
             Alert.alert(
               'Error',
               response.errorMessage || 'Failed to capture photo',
             );
             return;
           }
           if (response.assets && response.assets.length > 0) {
             await processMedia(response.assets[0].uri, 'photo', model);
           }
         });
       },
       [saveHistory],
     );

     const getStatusColor = () => {
       if (!result) return '#FF9800';
       if (result.predictedClass.toLowerCase().includes('healthy')) return '#4CAF50';
       return '#F44336';
     };

     return (
       <SafeAreaView style={styles.container}>
         <ScrollView
           contentContainerStyle={styles.scrollContainer}
           showsVerticalScrollIndicator={false}>
           {/* Header */}
           <View style={styles.header}>
             <View>
               <Text style={styles.welcomeText}>
                 Welcome back{user ? `, ${user.firstName}` : ''}!
               </Text>
               <Text style={styles.subtitle}>Scan your apple or leaf health</Text>
             </View>
             <TouchableOpacity
               style={styles.profileButton}
               onPress={() => navigation.navigate('Profile')}>
               <Image
                 source={{
                   uri:
                     user?.photoURL ||
                     'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                 }}
                 style={styles.profileImage}
               />
             </TouchableOpacity>
           </View>

           {/* Action Buttons */}
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Scan Options</Text>
             <ActionButton
               onPress={() => pickFromGallery('apple')}
               iconName="photo-library"
               text="Upload Apple Image"
               description="Select apple image from gallery"
               disabled={loading}
             />
             <ActionButton
               onPress={() => takePhoto('apple')}
               iconName="photo-camera"
               text="Take Apple Photo"
               description="Use camera for apple"
               disabled={loading}
             />
             <ActionButton
               onPress={() => pickFromGallery('leaf')}
               iconName="photo-library"
               text="Upload Leaf Image"
               description="Select leaf image from gallery"
               disabled={loading}
             />
             <ActionButton
               onPress={() => takePhoto('leaf')}
               iconName="photo-camera"
               text="Take Leaf Photo"
               description="Use camera for leaf"
               disabled={loading}
             />
           </View>

           {/* Media Preview */}
           {media && (
             <View style={styles.section}>
               <Text style={styles.sectionTitle}>Preview</Text>
               <View style={styles.mediaContainer}>
                 <Image
                   source={{ uri: media }}
                   style={styles.mediaPreview}
                   resizeMode="cover"
                 />
               </View>
             </View>
           )}

           {/* Result */}
           {loading ? (
             <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color={theme.colors.primary} />
               <Text style={styles.loadingText}>Analyzing your scan...</Text>
             </View>
           ) : result ? (
             <View style={styles.resultContainer}>
               <Text style={styles.sectionTitle}>Analysis Result ({modelType === 'apple' ? 'Apple' : 'Leaf'})</Text>
               <View
                 style={[styles.resultCard, { borderLeftColor: getStatusColor() }]}>
                 <Icon
                   name={
                     result.predictedClass.toLowerCase().includes('healthy')
                       ? 'check-circle'
                       : 'warning'
                   }
                   size={24}
                   color={getStatusColor()}
                 />
                 <Text style={styles.resultText}>
                   {result.predictedClass} ({result.confidence}%)
                 </Text>
               </View>
             </View>
           ) : null}
         </ScrollView>
       </SafeAreaView>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: theme.colors.background,
     },
     scrollContainer: {
       padding: 20,
       paddingBottom: 40,
     },
     header: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       marginBottom: 24,
     },
     welcomeText: {
       fontSize: 24,
       fontWeight: 'bold',
       color: theme.colors.text,
       fontFamily: theme.fonts.bold,
     },
     subtitle: {
       fontSize: 16,
       color: theme.colors.lightText,
       fontFamily: theme.fonts.regular,
     },
     profileButton: {
       width: 50,
       height: 50,
       borderRadius: 25,
       overflow: 'hidden',
     },
     profileImage: {
       width: '100%',
       height: '100%',
     },
     section: {
       marginBottom: 24,
     },
     sectionTitle: {
       fontSize: 18,
       fontWeight: 'bold',
       color: theme.colors.text,
       marginBottom: 16,
       fontFamily: theme.fonts.bold,
     },
     actionButton: {
       flexDirection: 'row',
       alignItems: 'center',
       backgroundColor: theme.colors.primary,
       borderRadius: 12,
       padding: 16,
       marginBottom: 12,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.2,
       shadowRadius: 4,
       elevation: 3,
     },
     disabledButton: {
       opacity: 0.6,
     },
     actionIconContainer: {
       width: 40,
       height: 40,
       borderRadius: 20,
       backgroundColor: 'rgba(255,255,255,0.2)',
       justifyContent: 'center',
       alignItems: 'center',
       marginRight: 16,
     },
     actionTextContainer: {
       flex: 1,
     },
     actionButtonText: {
       color: theme.colors.white,
       fontSize: 16,
       fontWeight: '600',
       fontFamily: theme.fonts.medium,
       marginBottom: 2,
     },
     actionButtonDescription: {
       color: 'rgba(255,255,255,0.8)',
       fontSize: 12,
       fontFamily: theme.fonts.regular,
     },
     mediaContainer: {
       borderRadius: 12,
       overflow: 'hidden',
       marginBottom: 16,
     },
     mediaPreview: {
       width: '100%',
       height: 200,
       borderRadius: 12,
     },
     loadingContainer: {
       alignItems: 'center',
       padding: 20,
       marginBottom: 20,
     },
     loadingText: {
       marginTop: 12,
       fontSize: 16,
       color: theme.colors.lightText,
       fontFamily: theme.fonts.regular,
     },
     resultContainer: {
       marginBottom: 24,
     },
     resultCard: {
       flexDirection: 'row',
       alignItems: 'center',
       backgroundColor: theme.colors.white,
       borderRadius: 12,
       padding: 16,
       borderLeftWidth: 4,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.1,
       shadowRadius: 4,
       elevation: 3,
     },
     resultText: {
       fontSize: 16,
       color: theme.colors.text,
       marginLeft: 12,
       flex: 1,
       fontFamily: theme.fonts.medium,
     },
   });