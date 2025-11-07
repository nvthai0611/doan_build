# Sidebar Component Logic Documentation

## Tổng quan

File `Sidebar-center-qn.tsx` là một component sidebar navigation với khả năng:
- Hiển thị menu items theo sections (vùng)
- Hỗ trợ nested dropdown (dropdown nhiều cấp)
- Auto-expand khi pathname match
- Collapse/Expand sidebar
- Role-based menu (center_owner, teacher, student, parent)

## 1. Cấu trúc Dữ liệu

### 1.1. Interfaces

```typescript
interface MenuItem {
  title: string          // Tên hiển thị của menu item
  icon?: any            // Icon component (optional, dùng cho nested items)
  href?: string         // Route path (optional)
  children?: MenuItem[] // Sub-menu items (optional, cho phép nested)
  hasArrowRight?: boolean // Hiển thị arrow right thay vì dropdown
  badge?: string        // Badge text (ví dụ: "beta")
}

interface MenuSection {
  title: string         // Tên section (ví dụ: "GIẢNG DẠY")
  items: MenuItem[]     // Danh sách items trong section
}
```

### 1.2. Menu Structure

Menu được tổ chức thành 2 phần:

**A. Top Level Items** (Các items ở đầu, không có section)
```typescript
topLevel: MenuItem[]
```
- Trang chủ
- Báo cáo
- Lịch dạy toàn trung tâm
- Buổi học hôm nay

**B. Sections** (Các vùng được phân chia)
```typescript
sections: MenuSection[]
```
- GIẢNG DẠY
- QUẢN LÝ
- HỆ THỐNG

### 1.3. Ví dụ Cấu trúc Menu

```typescript
const centerOwnerMenuItems = {
  topLevel: [
    {
      title: 'Trang chủ',
      icon: Home,
      href: '/center-qn',
    },
    {
      title: 'Báo cáo',
      icon: ChartArea,
      href: '/center-qn/reports',
      hasArrowRight: true,
      children: [
        { title: 'Báo cáo tổng quan', href: '/center-qn/reports/dashboard' },
        { title: 'Báo cáo học phí', href: '/center-qn/reports/tuition' },
      ],
    },
  ],
  sections: [
    {
      title: 'GIẢNG DẠY',
      items: [
        {
          title: 'Quản lý giáo viên',
          icon: Users,
          href: '/center-qn/teachers',
          children: [
            { title: 'Danh sách giáo viên', href: '/center-qn/teachers' },
            {
              title: 'Quản lý yêu cầu',  // Nested dropdown level 2
              icon: FileText,
              href: '/center-qn/requests',
              children: [                 // Nested dropdown level 3
                { title: 'Đơn xin nghỉ phép', href: '/center-qn/requests/leave-requests' },
                { title: 'Yêu cầu đổi lịch', href: '/center-qn/requests/change-schedule-requests' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
```

## 2. State Management

### 2.1. State Variables

```typescript
const [expandedItems, setExpandedItems] = useState<string[]>([])
// Lưu danh sách các items đang được expand
// Format: ["Item Title", "Nested Item-1", "Nested Item-2"]

const [isCollapsed, setIsCollapsed] = useState(false)
// Trạng thái collapse/expand của sidebar
```

### 2.2. Key Generation cho Nested Items

Để phân biệt các items ở các level khác nhau, key được tạo theo format:
- Level 0 (top level): `item.title`
- Level 1 (children của top level): `item.title-1`
- Level 2 (children của level 1): `item.title-2`
- ...

```typescript
const childKey = `${child.title}-${level}`
```

## 3. Core Logic Functions

### 3.1. shouldExpandItem()

Kiểm tra xem item có nên được expand không dựa trên pathname hiện tại.

```typescript
const shouldExpandItem = (item: MenuItem) => {
  if (!item.children) return false
  
  // Check nếu pathname match với href của item
  const isMatch = item.href && pathname.startsWith(item.href) && item.href !== '/'
  
  // Check nếu có child nào match với pathname
  const hasChildMatch = item.children.some((c: MenuItem) =>
    c.href && (pathname === c.href || pathname.startsWith(c.href))
  )
  
  return isMatch || hasChildMatch
}
```

### 3.2. checkAndExpandNested()

Hàm recursive để tự động expand các nested items khi pathname match.

```typescript
const checkAndExpandNested = (item: MenuItem, level: number = 0) => {
  // Tạo key dựa trên level
  const itemKey = level === 0 ? item.title : `${item.title}-${level}`
  
  // Nếu item nên được expand và chưa có trong expandedItems
  if (shouldExpandItem(item) && !expandedItems.includes(itemKey)) {
    setExpandedItems(prev => [...prev, itemKey])
  }
  
  // Recursively check children
  item.children?.forEach((child) => {
    if (child.children) {
      checkAndExpandNested(child, level + 1)
    }
  })
}
```

**Flow:**
1. Check item hiện tại
2. Nếu có children, check từng child
3. Nếu child có children, đệ quy với level + 1

### 3.3. toggleExpanded()

Toggle expand/collapse state của một item.

```typescript
const toggleExpanded = (title: string) => {
  setExpandedItems((prev) => 
    prev.includes(title) 
      ? prev.filter((item) => item !== title)  // Remove nếu đã có
      : [...prev, title]                       // Add nếu chưa có
  )
}
```

### 3.4. renderChildren()

Hàm recursive để render nested children với khả năng hỗ trợ nhiều cấp.

```typescript
const renderChildren = (children: MenuItem[], level: number = 1) => {
  // Tính margin-left dựa trên level
  const marginLeftClass = level === 1 ? 'ml-7' : level === 2 ? 'ml-14' : 'ml-21'
  
  return children.map((child: MenuItem) => {
    const hasChildren = child.children && child.children.length > 0
    const childKey = `${child.title}-${level}`
    const isExpanded = expandedItems.includes(childKey)
    
    // Check active state
    const isExactActive = pathname === child.href
    const hasChildMatch = child.children?.some((c: MenuItem) =>
      c.href && (pathname === c.href || pathname.startsWith(c.href))
    )
    const isChildActive = isExactActive || hasChildMatch
    
    return (
      <div key={childKey}>
        <Button onClick={() => {
          if (hasChildren) {
            toggleExpanded(childKey)  // Toggle expand
          } else if (child.href) {
            navigate(child.href)      // Navigate nếu không có children
          }
        }}>
          {/* Render icon nếu có */}
          {child.icon && <child.icon className="w-4 h-4" />}
          
          {/* Render title */}
          <span>{child.title}</span>
          
          {/* Render ChevronDown nếu có children */}
          {hasChildren && (
            <ChevronDown className={isExpanded ? "rotate-180" : ""} />
          )}
        </Button>
        
        {/* Recursively render children nếu expanded */}
        {hasChildren && isExpanded && (
          <div className="space-y-1 mt-1">
            {renderChildren(child.children || [], level + 1)}
          </div>
        )}
      </div>
    )
  })
}
```

**Đặc điểm:**
- Hỗ trợ nested unlimited levels
- Tự động tính margin-left dựa trên level
- Tự động expand nếu pathname match
- Hiển thị icon cho nested items (nếu có)

## 4. Render Logic

### 4.1. Top Level Items Render

```typescript
{centerOwnerMenu.topLevel.map((item) => {
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedItems.includes(item.title)
  const isActive = pathname === item.href || /* pathname match logic */
  
  return (
    <div>
      <Button onClick={() => {
        if (hasChildren) {
          toggleExpanded(item.title)
        } else {
          navigate(item.href)
        }
      }}>
        <item.icon />
        <span>{item.title}</span>
        {item.badge && <Badge>{item.badge}</Badge>}
        {hasChildren && <ChevronDown />}
        {item.hasArrowRight && <ChevronRight />}
      </Button>
      
      {/* Render children nếu expanded */}
      {hasChildren && isExpanded && (
        <div className="ml-7">
          {renderChildren(item.children, 1)}
        </div>
      )}
    </div>
  )
})}
```

### 4.2. Section Items Render

```typescript
{centerOwnerMenu.sections.map((section) => (
  <div>
    {/* Section Header */}
    <div className="section-header">
      {section.title}
    </div>
    
    {/* Section Items */}
    {section.items.map((item) => {
      // Tương tự như top level items
      return (
        <div>
          <Button>{/* ... */}</Button>
          {hasChildren && isExpanded && (
            <div>{renderChildren(item.children, 1)}</div>
          )}
        </div>
      )
    })}
  </div>
))}
```

### 4.3. Flow Diagram

```
Render Process:
├── Top Level Items
│   ├── Render Button
│   ├── Check hasChildren
│   └── If expanded → renderChildren(children, level=1)
│
├── Sections
│   ├── Render Section Header
│   └── For each item in section:
│       ├── Render Button
│       ├── Check hasChildren
│       └── If expanded → renderChildren(children, level=1)
│
└── renderChildren() [Recursive]
    ├── For each child:
    │   ├── Render Button with icon (if exists)
    │   ├── Check hasChildren
    │   └── If expanded → renderChildren(children, level+1)
    └── Repeat until no more children
```

## 5. Auto-Expand Logic

### 5.1. useEffect Hook

```typescript
useEffect(() => {
  if (!isCollapsed) {
    if (centerOwnerMenu) {
      // Check và expand top level items
      centerOwnerMenu.topLevel.forEach((item) => {
        checkAndExpandNested(item, 0)
      })
      
      // Check và expand section items
      centerOwnerMenu.sections.forEach((section) => {
        section.items.forEach((item) => {
          checkAndExpandNested(item, 0)
        })
      })
    }
  }
}, [pathname, isCollapsed])
```

**Trigger:**
- Khi `pathname` thay đổi (navigate sang route khác)
- Khi `isCollapsed` thay đổi (toggle sidebar)

**Process:**
1. Lặp qua tất cả top level items
2. Với mỗi item, gọi `checkAndExpandNested(item, 0)`
3. Hàm này sẽ recursively check và expand tất cả nested items match pathname

### 5.2. Example Flow

Giả sử pathname = `/center-qn/requests/leave-requests`:

```
1. Check "Quản lý giáo viên" (level 0)
   ├── href: /center-qn/teachers
   ├── pathname không match
   └── Check children...
   
2. Check "Quản lý yêu cầu" (level 1)
   ├── href: /center-qn/requests
   ├── pathname match (startsWith) → EXPAND
   └── Check children...
   
3. Check "Đơn xin nghỉ phép" (level 2)
   ├── href: /center-qn/requests/leave-requests
   └── pathname exact match → EXPAND parent
```

**Result:** Cả "Quản lý giáo viên" và "Quản lý yêu cầu" đều được expand.

## 6. Cách Thêm/Sửa Menu Items

### 6.1. Thêm Top Level Item

```typescript
topLevel: [
  // ... existing items
  {
    title: 'Tên mới',
    icon: IconComponent,
    href: '/route-path',
    // Optional
    badge: 'beta',
    hasArrowRight: true,
    children: [
      { title: 'Sub item', href: '/sub-route' }
    ]
  }
]
```

### 6.2. Thêm Section Item

```typescript
sections: [
  {
    title: 'GIẢNG DẠY',
    items: [
      // ... existing items
      {
        title: 'Item mới',
        icon: IconComponent,
        href: '/route',
        children: [
          { title: 'Child 1', href: '/child1' },
          {
            title: 'Nested Child',  // Nested dropdown level 2
            icon: IconComponent,
            children: [
              { title: 'Nested Child 1', href: '/nested1' }
            ]
          }
        ]
      }
    ]
  }
]
```

### 6.3. Thêm Nested Dropdown

```typescript
{
  title: 'Parent Item',
  icon: ParentIcon,
  href: '/parent',
  children: [
    {
      title: 'Child với Dropdown',  // Level 1
      icon: ChildIcon,               // Icon cho nested item
      href: '/child',
      children: [                     // Level 2
        { title: 'Grandchild 1', href: '/grandchild1' },
        { title: 'Grandchild 2', href: '/grandchild2' }
      ]
    }
  ]
}
```

## 7. Styling & UI Features

### 7.1. Active State

Item được đánh dấu active khi:
- `pathname === item.href` (exact match)
- `pathname.startsWith(item.href)` (partial match)
- Có child nào đó match pathname

```typescript
const isActive = isExactMatch || hasChildMatch || isPartialMatch
```

### 7.2. Icon Display

- **Top level items**: Luôn hiển thị icon
- **Nested items**: Chỉ hiển thị icon nếu có trong data (`child.icon`)
- **Collapsed sidebar**: Chỉ hiển thị icon

### 7.3. Badge Support

```typescript
{item.badge && (
  <span className="px-2 py-0.5 text-xs rounded-full bg-muted">
    {item.badge}
  </span>
)}
```

### 7.4. Arrow Right vs Dropdown

- `hasArrowRight: true` → Hiển thị `ChevronRight` (navigation, không expand)
- Có `children` → Hiển thị `ChevronDown` (expandable)

## 8. Best Practices

### 8.1. Naming Conventions

- **Section titles**: UPPERCASE (ví dụ: "GIẢNG DẠY")
- **Item titles**: Title Case (ví dụ: "Quản lý giáo viên")
- **Route paths**: kebab-case (ví dụ: "/center-qn/teachers")

### 8.2. Icon Selection

- Sử dụng icons từ `lucide-react`
- Đảm bảo icon phù hợp với chức năng
- Nested items có thể có icon để dễ nhận biết

### 8.3. Route Organization

- Group related routes trong cùng một parent item
- Sử dụng nested structure hợp lý (không quá 3-4 levels)
- Route paths phải match với route definitions trong app

### 8.4. Performance

- `useEffect` chỉ chạy khi `pathname` hoặc `isCollapsed` thay đổi
- `expandedItems` state được optimize để tránh re-render không cần thiết
- Recursive rendering chỉ render expanded items

## 9. Troubleshooting

### 9.1. Dropdown không hiển thị

**Check:**
1. Item có `children` array không rỗng?
2. `hasChildren` được tính đúng?
3. `isExpanded` state có đúng không?

**Solution:**
```typescript
// Debug log
console.log('hasChildren:', hasChildren)
console.log('isExpanded:', isExpanded)
console.log('expandedItems:', expandedItems)
```

### 9.2. Auto-expand không hoạt động

**Check:**
1. `pathname` có match với `item.href` hoặc `child.href`?
2. `shouldExpandItem()` có return đúng?
3. Key generation có đúng format?

**Solution:**
```typescript
// Debug trong shouldExpandItem
console.log('item:', item.title, 'isMatch:', isMatch, 'hasChildMatch:', hasChildMatch)
```

### 9.3. Nested dropdown không expand

**Check:**
1. Key format có đúng? (`item.title-level`)
2. `toggleExpanded()` được gọi với đúng key?
3. `expandedItems` state có được update?

**Solution:**
```typescript
// Debug key generation
console.log('childKey:', childKey)
console.log('expandedItems:', expandedItems)
```

## 10. Example: Complete Menu Structure

```typescript
const centerOwnerMenuItems = {
  topLevel: [
    {
      title: 'Trang chủ',
      icon: Home,
      href: '/center-qn',
    },
    {
      title: 'Báo cáo',
      icon: ChartArea,
      href: '/center-qn/reports',
      hasArrowRight: true,
      children: [
        { title: 'Báo cáo tổng quan', href: '/center-qn/reports/dashboard' },
      ],
    },
  ],
  sections: [
    {
      title: 'GIẢNG DẠY',
      items: [
        {
          title: 'Quản lý giáo viên',
          icon: Users,
          href: '/center-qn/teachers',
          children: [
            { title: 'Danh sách giáo viên', href: '/center-qn/teachers' },
            {
              title: 'Quản lý yêu cầu',
              icon: FileText,
              href: '/center-qn/requests',
              children: [
                { title: 'Đơn xin nghỉ phép', href: '/center-qn/requests/leave-requests' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
```

## 11. Summary

Sidebar component này sử dụng:
- **Recursive rendering** cho nested dropdown
- **State management** với `expandedItems` array
- **Auto-expand logic** dựa trên pathname matching
- **Flexible data structure** hỗ trợ unlimited nesting
- **Icon support** cho cả top level và nested items
- **Section-based organization** để group related items

Với cấu trúc này, bạn có thể dễ dàng thêm/sửa menu items mà không cần thay đổi logic render.
