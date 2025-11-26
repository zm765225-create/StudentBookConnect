import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
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

import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Gradients } from '@/constants/theme';
import { RootStackParamList } from '@/navigation/RootNavigator';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ModeCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  delay: number;
}

function ModeCard({ title, subtitle, icon, onPress, delay }: ModeCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.96); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.card, animatedStyle]}
      >
        <View style={styles.iconContainer}>
          <Feather name={icon} size={32} color={Colors.light.primary} />
        </View>
        <View style={styles.cardContent}>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
          <ThemedText style={styles.cardSubtitle}>{subtitle}</ThemedText>
        </View>
        <Feather name="chevron-left" size={24} color={Colors.light.textSecondary} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ModeSelectionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <LinearGradient
      colors={Gradients.hero as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={styles.logosContainer}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <ThemedText style={styles.title}>نظام إدارة الكتب</ThemedText>
          <ThemedText style={styles.subtitle}>
            كلية التربية النوعية - قسم الاقتصاد المنزلي
          </ThemedText>
          <ThemedText style={styles.universityName}>جامعة عين شمس</ThemedText>
        </Animated.View>

        <View style={styles.cardsContainer}>
          <ModeCard
            title="بوابة الطالب"
            subtitle="اختيار الكتب ومتابعة الطلبات"
            icon="user"
            onPress={() => navigation.navigate('StudentLogin')}
            delay={200}
          />
          <ModeCard
            title="لوحة تحكم المسؤول"
            subtitle="إدارة الطلاب والمخزون والخزينة"
            icon="shield"
            onPress={() => navigation.navigate('AdminLogin')}
            delay={300}
          />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]} />
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
    paddingTop: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  universityName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  cardsContainer: {
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.medium,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.lg,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'right',
  },
  footer: {
    paddingTop: Spacing.lg,
  },
});
