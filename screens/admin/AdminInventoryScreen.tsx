import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
import { useApp, Product } from '@/store/AppContext';
import { RootStackParamList } from '@/navigation/RootNavigator';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onStockChange: (delta: number) => void;
  index: number;
}

function ProductCard({ product, onEdit, onStockChange, index }: ProductCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isLowStock = product.stock < 10;
  const isOutOfStock = product.stock === 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <AnimatedPressable
        onPress={onEdit}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.productCard, animatedStyle]}
      >
        {isLowStock ? (
          <View style={styles.warningBanner}>
            <Feather 
              name={isOutOfStock ? 'alert-circle' : 'alert-triangle'} 
              size={14} 
              color={isOutOfStock ? Colors.light.error : Colors.light.warning} 
            />
            <ThemedText style={[styles.warningText, { color: isOutOfStock ? Colors.light.error : Colors.light.warning }]}>
              {isOutOfStock ? 'نفذ المخزون' : 'المخزون منخفض'}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.productHeader}>
          <View style={styles.productIcon}>
            <Feather name="book" size={28} color={Colors.light.primary} />
          </View>
          <View style={styles.productInfo}>
            <ThemedText style={styles.productName}>{product.name}</ThemedText>
            <ThemedText style={styles.productPrice}>{product.price} جنيه</ThemedText>
          </View>
          <Feather name="edit-2" size={18} color={Colors.light.textSecondary} />
        </View>

        <View style={styles.stockSection}>
          <ThemedText style={styles.stockLabel}>المخزون الحالي</ThemedText>
          <View style={styles.stockControls}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onStockChange(-1);
              }}
              style={({ pressed }) => [styles.stockButton, { opacity: pressed ? 0.7 : 1 }]}
              disabled={product.stock === 0}
            >
              <Feather name="minus" size={20} color={product.stock === 0 ? Colors.light.border : Colors.light.primary} />
            </Pressable>
            <View style={[styles.stockValue, isLowStock && styles.stockValueWarning]}>
              <ThemedText style={[styles.stockText, isLowStock && { color: isOutOfStock ? Colors.light.error : Colors.light.warning }]}>
                {product.stock}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onStockChange(1);
              }}
              style={({ pressed }) => [styles.stockButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Feather name="plus" size={20} color={Colors.light.primary} />
            </Pressable>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function AdminInventoryScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { products, updateProduct, deleteProduct, getStats } = useApp();

  const stats = getStats();
  const fabScale = useSharedValue(1);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleStockChange = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newStock = Math.max(0, product.stock + delta);
      updateProduct(productId, { stock: newStock });
    }
  };

  const handleEditProduct = (productId: string) => {
    navigation.navigate('AddProduct', { productId });
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct', {});
  };

  const lowStockProducts = products.filter(p => p.stock < 10);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: tabBarHeight + 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <ThemedText style={styles.title}>إدارة المخزون</ThemedText>
          <ThemedText style={styles.subtitle}>تعديل كميات المنتجات المتاحة</ThemedText>
        </Animated.View>

        {lowStockProducts.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.alertCard}>
            <Feather name="alert-triangle" size={24} color={Colors.light.warning} />
            <View style={styles.alertContent}>
              <ThemedText style={styles.alertTitle}>تنبيه المخزون</ThemedText>
              <ThemedText style={styles.alertText}>
                {lowStockProducts.length} منتج{lowStockProducts.length > 1 ? 'ات' : ''} بمخزون منخفض
              </ThemedText>
            </View>
          </Animated.View>
        ) : null}

        <View style={styles.statsRow}>
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.statCard}>
            <Feather name="package" size={24} color={Colors.light.primary} />
            <ThemedText style={styles.statValue}>{products.length}</ThemedText>
            <ThemedText style={styles.statLabel}>منتج</ThemedText>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.statCard}>
            <Feather name="shopping-bag" size={24} color={Colors.light.success} />
            <ThemedText style={styles.statValue}>
              {stats.productStats.reduce((sum, p) => sum + p.sold, 0)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>مباع</ThemedText>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.statCard}>
            <Feather name="check-circle" size={24} color={Colors.light.accent} />
            <ThemedText style={styles.statValue}>
              {stats.productStats.reduce((sum, p) => sum + p.delivered, 0)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>مسلم</ThemedText>
          </Animated.View>
        </View>

        <ThemedText style={styles.sectionTitle}>المنتجات</ThemedText>

        <View style={styles.productsGrid}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => handleEditProduct(product.id)}
              onStockChange={(delta) => handleStockChange(product.id, delta)}
              index={index}
            />
          ))}
        </View>
      </ScrollView>

      <AnimatedPressable
        onPress={handleAddProduct}
        onPressIn={() => { fabScale.value = withSpring(0.92); }}
        onPressOut={() => { fabScale.value = withSpring(1); }}
        style={[styles.fab, fabStyle, { bottom: tabBarHeight + Spacing.xl }]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </AnimatedPressable>
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
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.warning + '20',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.warning,
    textAlign: 'right',
  },
  alertText: {
    fontSize: 12,
    color: Colors.light.warning,
    textAlign: 'right',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.small,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.sm,
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
  productsGrid: {
    gap: Spacing.md,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.warning + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  productIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'right',
  },
  productPrice: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'right',
  },
  stockSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  stockLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  stockControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stockButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  stockValue: {
    minWidth: 60,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#FFFFFF',
  },
  stockValueWarning: {
    backgroundColor: Colors.light.warning + '20',
  },
  stockText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
});
