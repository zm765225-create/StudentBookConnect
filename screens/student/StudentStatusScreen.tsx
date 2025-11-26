import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/store/AppContext';

interface StatusItemProps {
  name: string;
  price: number;
  status: 'selected' | 'paid' | 'delivered';
  index: number;
}

function StatusItem({ name, price, status, index }: StatusItemProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'delivered':
        return { color: Colors.light.accent, icon: 'check-circle' as const, label: 'تم التسليم' };
      case 'paid':
        return { color: Colors.light.success, icon: 'credit-card' as const, label: 'تم الدفع' };
      default:
        return { color: Colors.light.warning, icon: 'clock' as const, label: 'في الانتظار' };
    }
  };

  const config = getStatusConfig();

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <View style={[styles.statusItem, { borderRightColor: config.color }]}>
        <View style={styles.itemInfo}>
          <ThemedText style={styles.itemName}>{name}</ThemedText>
          <ThemedText style={styles.itemPrice}>{price} جنيه</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
          <Feather name={config.icon} size={14} color={config.color} />
          <ThemedText style={[styles.statusLabel, { color: config.color }]}>{config.label}</ThemedText>
        </View>
      </View>
    </Animated.View>
  );
}

export default function StudentStatusScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { products, currentStudentId, getStudentById } = useApp();

  const currentStudent = currentStudentId ? getStudentById(currentStudentId) : null;

  if (!currentStudent) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.emptyState, { paddingTop: insets.top + Spacing['5xl'] }]}>
          <Feather name="user" size={64} color={Colors.light.textSecondary} />
          <ThemedText style={styles.emptyTitle}>سجل بياناتك أولاً</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            انتقل لصفحة "بياناتي" لتسجيل بياناتك
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const selectedOrders = currentStudent.orders.filter(o => o.selected);
  const paidOrders = currentStudent.orders.filter(o => o.paid);
  const deliveredOrders = currentStudent.orders.filter(o => o.delivered);

  const totalSelected = selectedOrders.reduce((sum, o) => {
    const product = products.find(p => p.id === o.productId);
    return sum + (product?.price || 0);
  }, 0);

  const totalPaid = paidOrders.reduce((sum, o) => {
    const product = products.find(p => p.id === o.productId);
    return sum + (product?.price || 0);
  }, 0);

  const progress = selectedOrders.length > 0 
    ? (deliveredOrders.length / selectedOrders.length) * 100 
    : 0;

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
          <ThemedText style={styles.title}>حالة الطلب</ThemedText>
          <ThemedText style={styles.subtitle}>تتبع حالة طلبك ومدفوعاتك</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressTitle}>نسبة الإنجاز</ThemedText>
            <ThemedText style={styles.progressPercent}>{Math.round(progress)}%</ThemedText>
          </View>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="shopping-cart" size={20} color={Colors.light.warning} />
              <ThemedText style={styles.statValue}>{selectedOrders.length}</ThemedText>
              <ThemedText style={styles.statLabel}>مختار</ThemedText>
            </View>
            <View style={styles.statItem}>
              <Feather name="credit-card" size={20} color={Colors.light.success} />
              <ThemedText style={styles.statValue}>{paidOrders.length}</ThemedText>
              <ThemedText style={styles.statLabel}>مدفوع</ThemedText>
            </View>
            <View style={styles.statItem}>
              <Feather name="check-circle" size={20} color={Colors.light.accent} />
              <ThemedText style={styles.statValue}>{deliveredOrders.length}</ThemedText>
              <ThemedText style={styles.statLabel}>مستلم</ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>إجمالي الطلب</ThemedText>
            <ThemedText style={styles.summaryValue}>{totalSelected} جنيه</ThemedText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>المدفوع</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: Colors.light.success }]}>{totalPaid} جنيه</ThemedText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>المتبقي</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: Colors.light.error }]}>{totalSelected - totalPaid} جنيه</ThemedText>
          </View>
        </Animated.View>

        {selectedOrders.length > 0 ? (
          <View style={styles.itemsSection}>
            <ThemedText style={styles.sectionTitle}>تفاصيل الطلب</ThemedText>
            {selectedOrders.map((order, index) => {
              const product = products.find(p => p.id === order.productId);
              if (!product) return null;
              const status = order.delivered ? 'delivered' : order.paid ? 'paid' : 'selected';
              return (
                <StatusItem
                  key={order.productId}
                  name={product.name}
                  price={product.price}
                  status={status}
                  index={index}
                />
              );
            })}
          </View>
        ) : (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.noOrdersCard}>
            <Feather name="shopping-bag" size={48} color={Colors.light.textSecondary} />
            <ThemedText style={styles.noOrdersText}>لم تقم باختيار أي كتب بعد</ThemedText>
          </Animated.View>
        )}
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
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.md,
  },
  itemsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  statusItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRightWidth: 4,
    ...Shadows.small,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'right',
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  noOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing['3xl'],
    alignItems: 'center',
    ...Shadows.small,
  },
  noOrdersText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
