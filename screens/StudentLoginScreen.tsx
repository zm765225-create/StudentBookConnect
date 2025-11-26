import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Gradients } from '@/constants/theme';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { useApp } from '@/store/AppContext';
import { signInWithGoogle, saveLogToFirebase } from '@/services/firebaseConfig';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function StudentLoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setCurrentStudent } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const buttonScale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithGoogle();
      
      // Log to Firebase
      await saveLogToFirebase({
        id: Date.now().toString(),
        type: 'admin_login',
        description: `تسجيل دخول طالب عبر Google: ${result.email}`,
        timestamp: new Date().toISOString(),
        details: { email: result.email, displayName: result.displayName, uid: result.uid }
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('StudentPortal');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('خطأ', 'فشل تسجيل الدخول عبر Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={Gradients.hero as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom }]}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="book-open" size={50} color={Colors.light.primary} />
          </View>
          <ThemedText style={styles.title}>بوابة الطالب</ThemedText>
          <ThemedText style={styles.subtitle}>اختر الكتب وتابع طلباتك</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formContainer}>
          <AnimatedPressable
            onPress={handleGoogleLogin}
            disabled={isLoading}
            onPressIn={() => { buttonScale.value = withSpring(0.95); }}
            onPressOut={() => { buttonScale.value = withSpring(1); }}
            style={[styles.googleButton, buttonStyle]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="mail" size={20} color="#FFFFFF" />
                <ThemedText style={styles.googleButtonText}>تسجيل دخول بـ Google</ThemedText>
              </>
            )}
          </AnimatedPressable>

          <View style={styles.divider}>
            <View style={styles.line} />
            <ThemedText style={styles.dividerText}>أو</ThemedText>
            <View style={styles.line} />
          </View>

          <AnimatedPressable
            onPress={() => navigation.replace('StudentPortal')}
            style={[styles.guestButton, buttonStyle]}
          >
            <Feather name="arrow-right" size={20} color={Colors.light.primary} />
            <ThemedText style={styles.guestButtonText}>الدخول بدون حساب</ThemedText>
          </AnimatedPressable>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          onPress={() => navigation.replace('ModeSelection')}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF90',
  },
  formContainer: {
    gap: Spacing.lg,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    ...Shadows.medium,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  guestButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFFFFF40',
  },
  dividerText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'flex-end',
  },
});
