import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Gradients } from '@/constants/theme';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { useApp } from '@/store/AppContext';
import { signOutUser, saveLogToFirebase } from '@/services/firebaseConfig';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AdminLoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useApp();
  
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const shakeX = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleLogin = async () => {
    if (!password) {
      setError('الرجاء إدخال كلمة المرور');
      shakeX.value = withSequence(
        withSpring(-10),
        withSpring(10),
        withSpring(-10),
        withSpring(10),
        withSpring(0)
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 500));

    if (login(password)) {
      // Log to Firebase
      saveLogToFirebase({
        id: Date.now().toString(),
        type: 'admin_login',
        description: 'تسجيل دخول المسؤول بكلمة المرور',
        timestamp: new Date().toISOString(),
        details: { loginMethod: 'password' }
      }).catch(() => {});
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('AdminDashboard');
    } else {
      setError('كلمة المرور غير صحيحة');
      shakeX.value = withSequence(
        withSpring(-10),
        withSpring(10),
        withSpring(-10),
        withSpring(10),
        withSpring(0)
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setIsLoading(false);
  };

  return (
    <LinearGradient
      colors={Gradients.hero as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top + 80, paddingBottom: insets.bottom }]}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="shield" size={40} color={Colors.light.primary} />
          </View>
          <ThemedText style={styles.title}>لوحة تحكم</ThemedText>
          <ThemedText style={styles.subtitle}>أدخل كلمة المرور الآمنة</ThemedText>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200).springify()} 
          style={[styles.formContainer, shakeStyle]}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="كلمة المرور"
              placeholderTextColor={Colors.light.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry
              keyboardType="number-pad"
              textAlign="center"
              autoFocus
            />
          </View>

          {error ? (
            <Animated.View entering={FadeInDown.springify()} style={styles.errorContainer}>
              <Feather name="alert-circle" size={16} color={Colors.light.error} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </Animated.View>
          ) : null}

          <AnimatedPressable
            onPress={handleLogin}
            onPressIn={() => { buttonScale.value = withSpring(0.96); }}
            onPressOut={() => { buttonScale.value = withSpring(1); }}
            disabled={isLoading}
            style={[styles.button, buttonStyle]}
          >
            <LinearGradient
              colors={Gradients.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText}>دخول</ThemedText>
              )}
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.medium,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 18,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.error,
  },
  button: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  buttonGradient: {
    height: Spacing.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
