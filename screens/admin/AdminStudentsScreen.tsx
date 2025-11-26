import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, Pressable, FlatList } from 'react-native';
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
import { useApp, Student } from '@/store/AppContext';
import { RootStackParamList } from '@/navigation/RootNavigator';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FilterType = 'all' | 'not_selected' | 'not_paid' | 'partial' | 'waiting' | 'completed';

const filterOptions: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'not_selected', label: 'لم يختر' },
  { key: 'not_paid', label: 'لم يدفع' },
  { key: 'partial', label: 'دفع جزئي' },
  { key: 'waiting', label: 'في الانتظار' },
  { key: 'completed', label: 'مكتمل' },
];

interface StudentCardProps {
  student: Student;
  onPress: () => void;
  products: { id: string; name: string; price: number }[];
}

function StudentCard({ student, onPress, products }: StudentCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const selectedCount = student.orders.filter(o => o.selected).length;
  const paidCount = student.orders.filter(o => o.paid).length;
  const deliveredCount = student.orders.filter(o => o.delivered).length;

  const totalAmount = student.orders.reduce((sum, order) => {
    if (order.selected) {
      const product = products.find(p => p.id === order.productId);
      return sum + (product?.price || 0);
    }
    return sum;
  }, 0);

  const paidAmount = student.orders.reduce((sum, order) => {
    if (order.paid) {
      const product = products.find(p => p.id === order.productId);
      return sum + (product?.price || 0);
    }
    return sum;
  }, 0);

  const getStatus = () => {
    if (selectedCount === 0) return { label: 'لم يختر', color: Colors.light.textSecondary };
    if (deliveredCount === selectedCount) return { label: 'مكتمل', color: Colors.light.success };
    if (paidCount === selectedCount) return { label: 'في انتظار التسليم', color: Colors.light.accent };
    if (paidCount > 0) return { label: 'دفع جزئي', color: Colors.light.warning };
    return { label: 'لم يدفع', color: Colors.light.error };
  };

  const status = getStatus();

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.studentCard, animatedStyle]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <ThemedText style={styles.avatarText}>{student.name.charAt(0)}</ThemedText>
        </View>
        <View style={styles.studentInfo}>
          <ThemedText style={styles.studentName}>{student.name}</ThemedText>
          <View style={styles.studentMeta}>
            {student.section ? (
              <View style={styles.metaItem}>
                <Feather name="hash" size={12} color={Colors.light.textSecondary} />
                <ThemedText style={styles.metaText}>{student.section}</ThemedText>
              </View>
            ) : null}
            {student.phone ? (
              <View style={styles.metaItem}>
                <Feather name="phone" size={12} color={Colors.light.textSecondary} />
                <ThemedText style={styles.metaText}>{student.phone}</ThemedText>
              </View>
            ) : null}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <ThemedText style={[styles.statusText, { color: status.color }]}>{status.label}</ThemedText>
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{selectedCount}</ThemedText>
          <ThemedText style={styles.statLabel}>مختار</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: Colors.light.success }]}>{paidAmount}</ThemedText>
          <ThemedText style={styles.statLabel}>مدفوع</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{totalAmount}</ThemedText>
          <ThemedText style={styles.statLabel}>الإجمالي</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: Colors.light.accent }]}>{deliveredCount}</ThemedText>
          <ThemedText style={styles.statLabel}>مستلم</ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Feather name="chevron-left" size={20} color={Colors.light.textSecondary} />
      </View>
    </AnimatedPressable>
  );
}

type AlphabetFilter = 'all' | 'A-Z' | '0-9' | 'other';
type SectionFilter = 'all' | string;

export default function AdminStudentsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { students, products } = useApp();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [alphabetFilter, setAlphabetFilter] = useState<AlphabetFilter>('all');
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');
  const fabScale = useSharedValue(1);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const sectionOptions = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => String(i + 1));
  }, []);

  const filteredStudents = useMemo(() => {
    let result = students;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.section.includes(search) ||
        s.phone.includes(search)
      );
    }

    if (alphabetFilter !== 'all') {
      result = result.filter(s => {
        const firstChar = s.name.charAt(0);
        if (alphabetFilter === 'A-Z') {
          return /^[أ-ي]/.test(firstChar);
        } else if (alphabetFilter === '0-9') {
          return /^[0-9]/.test(firstChar);
        }
        return false;
      });
    }

    if (sectionFilter !== 'all') {
      result = result.filter(s => s.section === sectionFilter);
    }

    if (activeFilter !== 'all') {
      result = result.filter(student => {
        const selectedCount = student.orders.filter(o => o.selected).length;
        const paidCount = student.orders.filter(o => o.paid).length;
        const deliveredCount = student.orders.filter(o => o.delivered).length;

        switch (activeFilter) {
          case 'not_selected': return selectedCount === 0;
          case 'not_paid': return selectedCount > 0 && paidCount === 0;
          case 'partial': return paidCount > 0 && paidCount < selectedCount;
          case 'waiting': return paidCount === selectedCount && deliveredCount < selectedCount && selectedCount > 0;
          case 'completed': return deliveredCount === selectedCount && selectedCount > 0;
          default: return true;
        }
      });
    }

    return result;
  }, [students, search, activeFilter, alphabetFilter, sectionFilter]);

  const handleAddStudent = () => {
    navigation.navigate('AddStudent');
  };

  const handleBulkAdd = () => {
    navigation.navigate('BulkAddStudents');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>الطلاب</ThemedText>
          <Pressable
            onPress={handleBulkAdd}
            style={({ pressed }) => [styles.bulkButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="upload" size={18} color={Colors.light.primary} />
            <ThemedText style={styles.bulkButtonText}>إضافة بالجملة</ThemedText>
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="بحث بالاسم أو السكشن أو الرقم..."
            placeholderTextColor={Colors.light.textSecondary}
            value={search}
            onChangeText={setSearch}
            textAlign="right"
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Feather name="x" size={20} color={Colors.light.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        <ThemedText style={styles.filterLabel}>حالة الطلب:</ThemedText>
        <FlatList
          horizontal
          data={filterOptions}
          keyExtractor={item => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(item.key);
              }}
              style={[
                styles.filterChip,
                activeFilter === item.key && styles.filterChipActive,
              ]}
            >
              <ThemedText
                style={[
                  styles.filterChipText,
                  activeFilter === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          )}
        />

        <ThemedText style={styles.filterLabel}>الأسماء:</ThemedText>
        <View style={styles.alphabetFilterRow}>
          <Pressable
            onPress={() => setAlphabetFilter('all')}
            style={[styles.alphaButton, alphabetFilter === 'all' && styles.alphaButtonActive]}
          >
            <ThemedText style={[styles.alphaButtonText, alphabetFilter === 'all' && styles.alphaButtonTextActive]}>الكل</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setAlphabetFilter('A-Z')}
            style={[styles.alphaButton, alphabetFilter === 'A-Z' && styles.alphaButtonActive]}
          >
            <ThemedText style={[styles.alphaButtonText, alphabetFilter === 'A-Z' && styles.alphaButtonTextActive]}>أ-ي</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setAlphabetFilter('0-9')}
            style={[styles.alphaButton, alphabetFilter === '0-9' && styles.alphaButtonActive]}
          >
            <ThemedText style={[styles.alphaButtonText, alphabetFilter === '0-9' && styles.alphaButtonTextActive]}>0-9</ThemedText>
          </Pressable>
        </View>

        <ThemedText style={styles.filterLabel}>السكشن:</ThemedText>
        <FlatList
          horizontal
          data={[{ id: 'all', label: 'الكل' }, ...sectionOptions.map(s => ({ id: s, label: s }))]}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSectionFilter(item.id === 'all' ? 'all' : item.id);
              }}
              style={[
                styles.filterChip,
                sectionFilter === (item.id === 'all' ? 'all' : item.id) && styles.filterChipActive,
              ]}
            >
              <ThemedText
                style={[
                  styles.filterChipText,
                  sectionFilter === (item.id === 'all' ? 'all' : item.id) && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + 80 }
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
            <StudentCard
              student={item}
              products={products}
              onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={48} color={Colors.light.textSecondary} />
            <ThemedText style={styles.emptyTitle}>لا يوجد طلاب</ThemedText>
            <ThemedText style={styles.emptySubtitle}>أضف طلاب جدد للبدء</ThemedText>
          </View>
        }
      />

      <AnimatedPressable
        onPress={handleAddStudent}
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    ...Shadows.small,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  bulkButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  filterList: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  alphabetFilterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  alphaButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
  },
  alphaButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  alphaButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  alphaButtonTextActive: {
    color: '#FFFFFF',
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'right',
  },
  studentMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardStats: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
  },
  cardFooter: {
    alignItems: 'flex-start',
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
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
