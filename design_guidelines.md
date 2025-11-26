# Design Guidelines: نظام إدارة الكتب والأبحاث

## Architecture & Navigation

### Authentication
- Admin password: **107110** (numeric entry)
- Password persists in localStorage until logout
- Student Portal: no authentication required
- Password screen: logos, single input, "دخول" button with loading/error states, shake animation on error

### Navigation Structure

**Root: Mode Selection**
- Two cards: "بوابة الطالب" (direct) | "لوحة تحكم المسؤول" (password)
- Gradient background, stacked logos (University + College)

**Student Portal (Stack → Tabs)**
1. Student Info Form (name, section, phone)
2. Tabs: "اختيار الكتب" | "حالة الطلب" | "الأبحاث"
3. FAB: Send notes to admin

**Admin Dashboard (4 Tabs + FAB)**
1. "الطلاب" - List with search/filters
2. "المخزون" - Product management
3. "الخزينة" - Financial overview
4. "الإعدادات" - Admin settings
- FAB: "إضافة طالب"

## Screen Layout & Safe Areas

### Universal Safe Area Rules
- **Top padding**: `insets.top + [specified]px`
- **Bottom padding**: `insets.bottom + [specified]px` OR `tabBarHeight + [specified]px` (tabs)
- **Header height**: Custom transparent headers

### Student Portal Screens

**Info Form**
- Top: `headerHeight + 24`, Bottom: `insets.bottom + 24`
- Scrollable, floating labels, edit icon (always visible)
- "حفظ البيانات" button with success animation

**Book Selection Tab**
- Top: `24`, Bottom: `tabBarHeight + 80` (sticky total)
- Dynamic product cards: name, price, checkbox
- Sticky total calculator + "إرسال الطلب" button

**Order Status Tab**
- Top: `24`, Bottom: `tabBarHeight + 24`
- Three sections: Selected (yellow) | Paid (green) | Received (blue)
- Timeline progress bar

**Research Tab**
- Top: `24`, Bottom: `tabBarHeight + 24`
- Cards: name, deadline, upload status, file picker
- "رفع البحث" buttons

### Admin Dashboard Screens

**Students List**
- Top: `headerHeight + 16`, Bottom: `tabBarHeight + 24`
- Search bar + filter chips: "الكل", "لم يختر", "لم يدفع", "دفع جزئي", "مكتمل"
- Expandable student cards, pull-to-refresh

**Student Detail Modal**
- Top: `insets.top + 16`, Bottom: `insets.bottom + 24`
- Editable info, books grid (Selected/Paid/Delivered checkboxes)
- Actions: "دفع الكل", "تسليم المدفوع"

**Inventory**
- Top: `24`, Bottom: `tabBarHeight + 80` (FAB)
- Product cards: image, name, price, stock (+/- buttons)
- Low stock warnings, "إضافة منتج جديد" FAB

**Treasury**
- Top: `24`, Bottom: `tabBarHeight + 24`
- Large earnings card (animated counter)
- Pie chart, stats cards: total students, paid count, delivered, collection rate

**Settings**
- Top: `24`, Bottom: `tabBarHeight + 24`
- Logo uploads, image gallery, product editor, research mgmt
- Bulk import students, logout button (bottom, danger)

## Design System

### Colors
| Type | Hex | Usage |
|------|-----|-------|
| Primary | `#1A5F7A` | Main brand, buttons |
| Secondary | `#159895` | Accents |
| Accent | `#57C5B6` | CTAs, highlights |
| Success | `#27AE60` | Paid, delivered |
| Warning | `#F39C12` | Pending, partial |
| Error | `#E74C3C` | Missing, overdue |
| Background | `#F8F9FA` | Screen bg |
| Surface | `#FFFFFF` | Cards |
| Text Primary | `#2C3E50` | Main text |
| Text Secondary | `#7F8C8D` | Labels |
| Border | `#E1E8ED` | Dividers |

**Gradients**
- Hero: `linear-gradient(45deg, #1A5F7A, #159895)`
- Cards: `linear-gradient(#FFFFFF, #F8F9FA)`

### Typography (RTL Arabic)
- **Font**: 'Tajawal' or 'Cairo' (Google Fonts)
- **Sizes**: H1 28px bold | H2 24px bold | H3 20px semibold | Body Large 16px | Body 14px | Caption 12px
- **Alignment**: Right (RTL default)

### Spacing
`xs: 4 | sm: 8 | md: 16 | lg: 24 | xl: 32 | xxl: 48`

### Components

**Cards**
```
background: #FFFFFF
borderRadius: 16px
padding: 16px
shadow: {offset: {width: 0, height: 2}, opacity: 0.08, radius: 8}
press: scale(0.98) spring animation
```

**Buttons**
```
Primary:
  background: gradient(Primary → Secondary)
  text: white, 16px semibold
  height: 52px, borderRadius: 26px
  shadow: {offset: {width: 0, height: 2}, opacity: 0.10, radius: 2}
  press: opacity 0.9 + haptic

Secondary:
  background: transparent
  border: 2px Primary
  text: Primary
```

**Input Fields**
```
height: 52px, borderRadius: 12px
border: 1.5px #E1E8ED
focus: border → Primary
floating label animation, RTL
```

**Status Badges**
```
borderRadius: 20px, padding: 6px 12px
font: 12px semibold
colors: Success/Warning/Error
```

**FAB**
```
size: 56px diameter
background: gradient(Primary → Secondary)
icon: white 24px (Feather)
position: bottom-right (16px, 16px)
shadow: {offset: {width: 0, height: 2}, opacity: 0.10, radius: 2}
press: scale(0.92) spring
```

### Visual Elements

**Logos**
- Max height: 48px, maintain aspect ratio
- Position: top-left (RTL: top-right)
- Admin uploadable

**Icons**
- Library: Feather (@expo/vector-icons)
- Sizes: 20px (small) | 24px (medium) | 32px (large)
- Colors: Primary or Text Secondary
- RTL mirrored for directional icons

**Empty States**
- Large Feather icon
- Body Large message
- Suggested action button

## Animations

**Transitions**
- Stack: Slide from right (RTL: left)
- Tabs: Fade + subtle scale
- Modals: Slide from bottom + backdrop fade

**Micro-interactions**
```
Button press: scale(0.96) spring(damping: 15)
Card select: checkmark fade + scale
Deletion: swipe + fade-out
Counters: animated counting (treasury)
Success: confetti/checkmark pop
```

**Loading**
- Skeleton screens for lists
- Shimmer on cards
- Spinner in buttons
- Pull-to-refresh: custom logo indicator

**Haptic**
- Press: light impact
- Success: success notification
- Error: error notification
- Swipe: selection feedback

## Accessibility

**RTL**
- Full RTL layout
- Mirrored navigation
- Icon directionality adjusted

**Touch/Contrast**
- Min touch target: 44x44px
- WCAG AA contrast
- Clear status color distinction

**Feedback**
- Visual feedback for all actions
- Arabic error messages (clear, actionable)
- Success confirmations

## Critical Assets

**Required (Generated)**
1. Logos (512x512px): Ain Shams University | Faculty of Specific Education
2. Product placeholders: Tools, Membership, Knitting, Foundations, Sheets books (academic, minimalist, brand colors)
3. Empty states: No students, no products, no research

**User-Uploadable**
- Product images
- Logo replacements
- Banner images
- Research PDFs

---

**Key Implementation Notes:**
- All text RTL Arabic
- Product list loads from cloud
- Password hardcoded: 107110
- Status colors: Yellow (selected), Green (paid), Blue (received)
- Admin can bulk import students
- Student info editable via edit icon
- Treasury uses animated counters