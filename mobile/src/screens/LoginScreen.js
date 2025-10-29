import * as React from 'react';
import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Adjust this based on your backend URL
// const API_URL = "http://10.183.53.9:5000/api/user";
const API_URL = "http://192.168.1.23:5000/api/user";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false
  });

  const validateInputs = () => {
    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      Alert.alert('Success', `Welcome ${user.firstName}`);
      navigation.replace('MainApp');
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (field) => {
    setIsFocused({...isFocused, [field]: true});
  };

  const handleBlur = (field) => {
    setIsFocused({...isFocused, [field]: false});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Animatable.Image
            animation="fadeInDown"
            duration={1500}
            // source={require('../assets/apple-logo.png')} // Replace with your app logo
            style={styles.logo}
            resizeMode="contain"
          />
          <Animatable.Text 
            animation="fadeInDown" 
            delay={300}
            style={styles.appName}
          >
            Apple Health Scan
          </Animatable.Text>
          <Animatable.Text 
            animation="fadeInDown" 
            delay={500}
            style={styles.subtitle}
          >
            Sign in to continue
          </Animatable.Text>
        </View>

        <Animatable.View 
          animation="fadeInUp"
          duration={1000}
          style={styles.formContainer}
        >
          <Text style={styles.title}>Welcome Back</Text>
          
          <View style={[
            styles.inputContainer, 
            isFocused.email && styles.inputContainerFocused
          ]}>
            <Icon 
              name="email" 
              size={24} 
              color={isFocused.email ? theme.colors.primary : theme.colors.gray} 
              style={styles.icon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              // onFocus={() => handleFocus('email')}
              // onBlur={() => handleBlur('email')}
            />
          </View>

          <View style={[
            styles.inputContainer, 
            isFocused.password && styles.inputContainerFocused
          ]}>
            <Icon 
              name="lock" 
              size={24} 
              color={isFocused.password ? theme.colors.primary : theme.colors.gray} 
              style={styles.icon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.colors.gray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              // onFocus={() => handleFocus('password')}
              // onBlur={() => handleBlur('password')}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color={theme.colors.gray}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.signupContainer}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupText}>
              Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.regular,
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 25,
    fontFamily: theme.fonts.bold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  link: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: theme.fonts.medium,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    height: 55,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.lightGray,
  },
  dividerText: {
    marginHorizontal: 10,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.medium,
  },
  signupContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  signupText: {
    color: theme.colors.text,
    fontSize: 15,
    fontFamily: theme.fonts.regular,
  },
  signupLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
});