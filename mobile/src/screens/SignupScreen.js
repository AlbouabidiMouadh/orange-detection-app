import * as React from 'react';
import {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image
} from 'react-native';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {theme} from '../styles/theme';

const { width, height } = Dimensions.get('window');

// Your backend URL (adjust to your server IP/port)
// const API_URL = 'http://10.183.53.9:5000/api/user/signup';
const API_URL = 'http://192.168.1.22:5000/api/user/signup';

export default function SignupScreen({navigation}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false
  });

  const validateInputs = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (phoneNumber && !phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!agreeTerms) {
      Alert.alert('Error', 'You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const res = await axios.post(API_URL, {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      });

      Alert.alert('Success', 'Account created successfully! Please log in.');
      navigation.navigate('Login');
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      Alert.alert('Signup Failed', msg);
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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Animatable.Image
            animation="fadeInDown"
            duration={1000}
            // source={require('../assets/apple-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Animatable.Text 
            animation="fadeInDown" 
            delay={300}
            style={styles.title}
          >
            Create Your Account
          </Animatable.Text>
          <Animatable.Text 
            animation="fadeInDown" 
            delay={500}
            style={styles.subtitle}
          >
            Join Apple Health Scan today
          </Animatable.Text>
        </View>

        <Animatable.View 
          animation="fadeInUp"
          duration={1000}
          style={styles.formContainer}
        >
          <View style={styles.nameContainer}>
            <View style={[styles.halfInputContainer, {marginRight: 10}]}>
              <Icon
                name="person"
                size={22}
                color={isFocused.firstName ? theme.colors.primary : theme.colors.gray}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor={theme.colors.gray}
                value={firstName}
                onChangeText={setFirstName}
                // onFocus={() => handleFocus('firstName')}
                // onBlur={() => handleBlur('firstName')}
              />
            </View>

            <View style={styles.halfInputContainer}>
              <Icon
                name="person-outline"
                size={22}
                color={isFocused.lastName ? theme.colors.primary : theme.colors.gray}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor={theme.colors.gray}
                value={lastName}
                onChangeText={setLastName}
                // onFocus={() => handleFocus('lastName')}
                // onBlur={() => handleBlur('lastName')}
              />
            </View>
          </View>

          <View style={[
            styles.inputContainer, 
            isFocused.email && styles.inputContainerFocused
          ]}>
            <Icon
              name="email"
              size={22}
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
            isFocused.phoneNumber && styles.inputContainerFocused
          ]}>
            <Icon
              name="phone"
              size={22}
              color={isFocused.phoneNumber ? theme.colors.primary : theme.colors.gray}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number (Optional)"
              placeholderTextColor={theme.colors.gray}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              // onFocus={() => handleFocus('phoneNumber')}
              // onBlur={() => handleBlur('phoneNumber')}
            />
          </View>

          <View style={[
            styles.inputContainer, 
            isFocused.password && styles.inputContainerFocused
          ]}>
            <Icon
              name="lock"
              size={22}
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
              onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={22}
                color={theme.colors.gray}
              />
            </TouchableOpacity>
          </View>

          <View style={[
            styles.inputContainer, 
            isFocused.confirmPassword && styles.inputContainerFocused
          ]}>
            <Icon
              name="lock-outline"
              size={22}
              color={isFocused.confirmPassword ? theme.colors.primary : theme.colors.gray}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={theme.colors.gray}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              // onFocus={() => handleFocus('confirmPassword')}
              // onBlur={() => handleBlur('confirmPassword')}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon
                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                size={22}
                color={theme.colors.gray}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAgreeTerms(!agreeTerms)}>
              <Icon
                name={agreeTerms ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={agreeTerms ? theme.colors.primary : theme.colors.gray}
              />
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              I agree to the <Text style={styles.link}>Terms and Conditions</Text>
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.lightText,
    textAlign: 'center',
    marginTop: 5,
    fontFamily: theme.fonts.regular,
  },
  formContainer: {
    backgroundColor: theme.colors.white,
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
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    height: 55,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    marginBottom: 15,
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
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    height: '100%',
  },
  eyeIcon: {
    padding: 10,
    marginRight: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 5,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  link: {
    color: theme.colors.primary,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
});