import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView
} from "react-native";
import axios from "axios";
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from "../styles/theme";

const { width, height } = Dimensions.get('window');

// const API_URL = "http://10.0.2.2:5000/api/user";
const API_URL = "http://192.168.1.22:5000/api/user";

export default function ResetPasswordScreen({ route, navigation }) {
  const { email: passedEmail } = route.params || {};
  const [email, setEmail] = useState(passedEmail || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    code: false,
    newPassword: false,
    confirmPassword: false
  });

  const handleResetPassword = async () => {
    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    
    if (!code || code.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        email,
        code,
        newPassword,
      });
      
      Alert.alert("Success", response.data.message, [
        { text: "OK", onPress: () => navigation.replace("Login") }
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to reset password. Please try again."
      );
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
            Reset Password
          </Animatable.Text>
          <Animatable.Text 
            animation="fadeInDown" 
            delay={500}
            style={styles.subtitle}
          >
            Enter the code sent to your email and set a new password
          </Animatable.Text>
        </View>

        <Animatable.View 
          animation="fadeInUp"
          duration={1000}
          style={styles.formContainer}
        >
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
              placeholder="Email address"
              placeholderTextColor={theme.colors.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              // onFocus={() => handleFocus('email')}
              // onBlur={() => handleBlur('email')}
              editable={!!passedEmail} // Disable if email was passed
            />
          </View>

          <View style={[
            styles.inputContainer, 
            isFocused.code && styles.inputContainerFocused
          ]}>
            <Icon
              name="vpn-key"
              size={22}
              color={isFocused.code ? theme.colors.primary : theme.colors.gray}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="6-digit code"
              placeholderTextColor={theme.colors.gray}
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
              maxLength={6}
              // onFocus={() => handleFocus('code')}
              // onBlur={() => handleBlur('code')}
            />
          </View>

          <View style={[
            styles.inputContainer, 
            isFocused.newPassword && styles.inputContainerFocused
          ]}>
            <Icon
              name="lock"
              size={22}
              color={isFocused.newPassword ? theme.colors.primary : theme.colors.gray}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={theme.colors.gray}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              // onFocus={() => handleFocus('newPassword')}
              // onBlur={() => handleBlur('newPassword')}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Icon
                name={showNewPassword ? 'visibility' : 'visibility-off'}
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
              placeholder="Confirm new password"
              placeholderTextColor={theme.colors.gray}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              // onFocus={() => handleFocus('confirmPassword')}
              // onBlur={() => handleBlur('confirmPassword')}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon
                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                size={22}
                color={theme.colors.gray}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Didn't receive the code?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.resendLink}>Resend code</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.backToLogin}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-back"
              size={18}
              color={theme.colors.primary}
              style={styles.backIcon}
            />
            <Text style={styles.backText}>Back to login</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.lightText,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
    paddingHorizontal: 20,
    lineHeight: 22,
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
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.regular,
  },
  resendLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: theme.fonts.medium,
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  backIcon: {
    marginRight: 8,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontFamily: theme.fonts.medium,
  },
});