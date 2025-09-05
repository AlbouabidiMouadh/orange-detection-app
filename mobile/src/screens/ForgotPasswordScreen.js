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

// Adjust API URL
const API_URL = "http://192.168.1.22:5000/api/user"; 

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      Alert.alert("Success", response.data.message);

      // Navigate to ResetPassword screen with email pre-filled
      navigation.navigate("ResetPassword", { email });
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
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
            Forgot Password
          </Animatable.Text>
          <Animatable.Text 
            animation="fadeInDown" 
            delay={500}
            style={styles.subtitle}
          >
            Enter your email to receive a reset code
          </Animatable.Text>
        </View>

        <Animatable.View 
          animation="fadeInUp"
          duration={1000}
          style={styles.formContainer}
        >
          <View style={[
            styles.inputContainer, 
            isFocused && styles.inputContainerFocused
          ]}>
            <Icon
              name="email"
              size={22}
              color={isFocused ? theme.colors.primary : theme.colors.gray}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={theme.colors.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </View>

          <Text style={styles.instructionText}>
            We'll send a 6-digit code to your email to reset your password.
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleForgotPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Code</Text>
            )}
          </TouchableOpacity>

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
            <Text style={styles.backText}>Back to Login</Text>
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
  instructionText: {
    fontSize: 14,
    color: theme.colors.lightText,
    textAlign: 'center',
    marginBottom: 25,
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
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