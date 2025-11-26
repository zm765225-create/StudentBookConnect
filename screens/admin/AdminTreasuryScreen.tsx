import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, BorderRadius, Shadows, Gradients } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  value: string | number;
  label: string;
  color: string;
  index: number;
}

function StatCard({ icon, value, label, color, index }: StatCardProps) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(100 + index * 50).springify()} 
      style={styles.statCard}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </Animated.View>
  );
}

interface ProductStatProps {
  name: string;
  sold: number;
  delivered: number;
  revenue: number;
  index: number;
}

function ProductStat({ name, sold, delivered, revenue, index }: ProductStatProps) {
  const progress = sold > 0 ? (delivered / sold) * 100 : 0;

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 50).springify()} style={styles.productStat}>
      <View style={styles.productStatHeader}>
        <ThemedText style={styles.productName}>{name}</ThemedText>
        <ThemedText style={styles.productRevenue}>{revenue} جنيه</ThemedText>
      </View>
      <View style={styles.productStatRow}>
        <View style={styles.productStatItem}>
          <ThemedText style={styles.productStatValue}>{sold}</ThemedText>
          <ThemedText style={styles.productStatLabel}>مباع</ThemedText>
        </View>
        <View style={styles.productStatItem}>
          <ThemedText style={[styles.productStatValue, { color: Colors.light.accent }]}>{delivered}</ThemedText>
          <ThemedText style={styles.productStatLabel}>مسلم</ThemedText>
        </View>
        <View style={styles.productStatItem}>
          <ThemedText style={[styles.productStatValue, { color: Colors.light.success }]}>{Math.round(progress)}%</ThemedText>
          <ThemedText style={styles.productStatLabel}>نسبة التسليم</ThemedText>
        </View>
      </View>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </Animated.View>
  );
}

export default function AdminTreasuryScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { getStats } = useApp();

  const stats = getStats();
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, []);

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
          <ThemedText style={styles.title}>الخزينة</ThemedText>
          <ThemedText style={styles.subtitle}>إحصائيات المبيعات والتحصيل</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={Gradients.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.revenueCard}
          >
            <View style={styles.revenueHeader}>
              <View style={styles.revenueIconContainer}>
                <Feather name="dollar-sign" size={28} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.revenueLabel}>إجمالي الإيرادات</ThemedText>
            </View>
            <ThemedText style={styles.revenueAmount}>{stats.totalRevenue} جنيه</ThemedText>
            <View style={styles.revenueFooter}>
              <View style={styles.revenueFooterItem}>
                <ThemedText style={styles.revenueFooterValue}>{Math.round(stats.collectionRate)}%</ThemedText>
                <ThemedText style={styles.revenueFooterLabel}>نسبة التحصيل</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="users"
            value={stats.totalStudents}
            label="إجمالي الطلاب"
            color={Colors.light.primary}
            index={0}
          />
          <StatCard
            icon="credit-card"
            value={stats.paidStudents}
            label="دفعوا"
            color={Colors.light.success}
            index={1}
          />
          <StatCard
            icon="check-circle"
            value={stats.deliveredStudents}
            label="استلموا"
            color={Colors.light.accent}
            index={2}
          />
          <StatCard
            icon="trending-up"
            value={`${Math.round(stats.collectionRate)}%`}
            label="نسبة التحصيل"
            color={Colors.light.warning}
            index={3}
          />
        </View>

        <ThemedText style={styles.sectionTitle}>تفاصيل المنتجات</ThemedText>

        <View style={styles.productsList}>
          {stats.productStats.map((product, index) => (
            <ProductStat
              key={product.productId}
              name={product.name}
              sold={product.sold}
              delivered={product.delivered}
              revenue={product.revenue}
              index={index}
            />
          ))}
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
  revenueCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.medium,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  revenueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  revenueLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  revenueAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  revenueFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: Spacing.lg,
  },
  revenueFooterItem: {
    alignItems: 'center',
  },
  revenueFooterValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  revenueFooterLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.small,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  productsList: {
    gap: Spacing.md,
  },
  productStat: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  productStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  productRevenue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.success,
  },
  productStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  productStatItem: {
    alignItems: 'center',
  },
  productStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  productStatLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.accent,
    borderRadius: 3,
  },
});
