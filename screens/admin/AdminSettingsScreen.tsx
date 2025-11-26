import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { signOutUser } from '@/services/firebaseConfig';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SettingsItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  index: number;
}

function SettingsItem({ icon, title, subtitle, onPress, danger, index }: SettingsItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <AnimatedPressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.settingsItem, animatedStyle]}
      >
        <View style={[styles.iconContainer, danger && { backgroundColor: Colors.light.error + '20' }]}>
          <Feather name={icon} size={20} color={danger ? Colors.light.error : Colors.light.primary} />
        </View>
        <View style={styles.itemContent}>
          <ThemedText style={[styles.itemTitle, danger && { color: Colors.light.error }]}>{title}</ThemedText>
          {subtitle ? (
            <ThemedText style={styles.itemSubtitle}>{subtitle}</ThemedText>
          ) : null}
        </View>
        <Feather name="chevron-left" size={20} color={Colors.light.textSecondary} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout, researches, students, products } = useApp();

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutUser();
            } catch (error) {
              console.error('Firebase logout error:', error);
            }
            logout();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'ModeSelection' }],
              })
            );
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: tabBarHeight + Spacing['3xl'] }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <ThemedText style={styles.title}>الإعدادات</ThemedText>
          <ThemedText style={styles.subtitle}>إدارة التطبيق والبيانات</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsCard}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{students.length}</ThemedText>
            <ThemedText style={styles.statLabel}>طالب</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{products.length}</ThemedText>
            <ThemedText style={styles.statLabel}>منتج</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{researches.length}</ThemedText>
            <ThemedText style={styles.statLabel}>بحث</ThemedText>
          </View>
        </Animated.View>

        <ThemedText style={styles.sectionTitle}>إدارة الطلاب</ThemedText>
        <View style={styles.section}>
          <SettingsItem
            icon="user-plus"
            title="إضافة طالب"
            subtitle="إضافة طالب جديد يدوياً"
            onPress={() => navigation.navigate('AddStudent')}
            index={0}
          />
          <SettingsItem
            icon="upload"
            title="إضافة طلاب بالجملة"
            subtitle="استيراد قائمة طلاب من نص منسوخ"
            onPress={() => navigation.navigate('BulkAddStudents')}
            index={1}
          />
        </View>

        <ThemedText style={styles.sectionTitle}>إدارة المنتجات</ThemedText>
        <View style={styles.section}>
          <SettingsItem
            icon="package"
            title="إضافة منتج جديد"
            subtitle="إضافة كتاب أو منتج جديد للقائمة"
            onPress={() => navigation.navigate('AddProduct', {})}
            index={2}
          />
        </View>

        <ThemedText style={styles.sectionTitle}>إدارة الأبحاث</ThemedText>
        <View style={styles.section}>
          <SettingsItem
            icon="file-plus"
            title="إضافة بحث جديد"
            subtitle="إضافة بحث مطلوب من الطلاب"
            onPress={() => navigation.navigate('AddResearch', {})}
            index={3}
          />
        </View>

        <ThemedText style={styles.sectionTitle}>الرسائل</ThemedText>
        <View style={styles.section}>
          <SettingsItem
            icon="message-circle"
            title="رسائل الطلاب"
            subtitle="عرض الرسائل والملاحظات الواردة"
            onPress={() => navigation.navigate('Messages')}
            index={4}
          />
        </View>

        <ThemedText style={styles.sectionTitle}>التحكم والإدارة</ThemedText>
        <View style={styles.section}>
          <SettingsItem
            icon="activity"
            title="السجلات والأنشطة"
            subtitle="عرض جميع الأنشطة والعمليات"
            onPress={() => navigation.navigate('Logs')}
            index={5}
          />
          <SettingsItem
            icon="sliders"
            title="إعدادات متقدمة"
            subtitle="تخصيص النصوص والألوان"
            onPress={() => navigation.navigate('AdvancedSettings')}
            index={6}
          />
        </View>

        <View style={styles.dangerSection}>
          <SettingsItem
            icon="log-out"
            title="تسجيل الخروج"
            onPress={handleLogout}
            danger
            index={7}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundRoot,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'right',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    textAlign: 'right',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'right',
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  dangerSection: {
    marginTop: Spacing['3xl'],
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
});
