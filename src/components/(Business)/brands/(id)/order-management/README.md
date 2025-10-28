# Order Management - Seller Dashboard

Complete order management system for sellers to manage their brand's orders.

---

## 📁 Structure

```
order-management/
├── OrderManagementSection.tsx          # Sidebar menu component
├── subsections/
│   ├── AllOrdersSubSection.tsx        # Main order list & management
│   └── OrderDetailModal.tsx           # Order detail modal
└── README.md                           # This file
```

---

## 🎯 Features

### **AllOrdersSubSection**

- ✅ **View Orders** - Display all orders for seller's brand
- ✅ **Filter by Status** - Filter orders by status (9 statuses supported)
- ✅ **Update Status** - Update order status through fulfillment workflow
- ✅ **Pagination** - 20 orders per page
- ✅ **Order Details** - View customer info, shipping address, items, amounts
- ✅ **Detail Modal** - Click "상세" to open full order information modal
- ✅ **Bulk Actions** - Select all, bulk status update, Excel export (TODO)
- ✅ **Responsive Table** - Professional table layout with horizontal scroll

### **OrderDetailModal**

- ✅ **Full Order Information** - Complete order details in modal
- ✅ **Order Header** - Order number, status, date, brand
- ✅ **Customer Info** - Name, phone, email
- ✅ **Shipping Address** - Full address, city, postal code
- ✅ **Order Items** - Product list with images, prices, quantities
- ✅ **Payment Summary** - Item total, shipping, grand total
- ✅ **Status Actions** - Update order status directly from modal
- ✅ **Responsive Design** - Scrollable modal for long orders

---

## 🔐 Authorization Requirements

**Per Backend Documentation:**

1. ✅ **SellApplication** must exist with `status = 'approved'`
2. ✅ **Brand** must exist with `status = 'approved'`
3. ✅ **Ownership Chain**: User → SellApplication → Brand → Orders

**If requirements not met:**
- Error: "Brand not found or not approved for this user"
- Redirect to `/business/brands` to manage brand

---

## 📊 Order Status Reference

### **Complete Status List:**

| Status | Korean | Color | Description | Who Sets |
|--------|--------|-------|-------------|----------|
| `pending` | 대기중 | Yellow | Awaiting payment | System |
| `paid` | 입금완료 | Green | Payment confirmed | Payment API |
| `fulfilling` | 배송준비 | Blue | Preparing order | Seller ⭐ |
| `fulfilled` | 배송중 | Purple | Order shipped | Seller ⭐ |
| `completed` | 배송완료 | Gray | Delivery confirmed | Seller ⭐ |
| `canceled` | 취소됨 | Red | Order canceled | Seller/Buyer |
| `payment_failed` | 결제실패 | Orange | Payment failed | Payment API |
| `refunded` | 환불완료 | Pink | Payment refunded | System |

### **Valid Status Transitions:**

**Normal Flow:**
```
pending → paid → fulfilling → fulfilled → completed
```

**Seller Actions:**
- ✅ `paid` → `fulfilling` (Start preparing order)
- ✅ `fulfilling` → `fulfilled` (Mark as shipped)
- ✅ `fulfilled` → `completed` (Delivery confirmed)

**Exception Flows:**
- `pending` → `payment_failed` (Payment gateway error)
- `paid/fulfilled` → `refunded` (After successful payment)
- Any → `canceled` (Before fulfillment)

**Invalid Transitions:**
- ❌ Cannot go backward (e.g., `completed` → `pending`)
- ❌ Cannot delete orders (only update status)

---

## 🔌 API Integration

### **Endpoints Used:**

1. **GET /api/order/seller** - Get seller's orders
   - Query params: `status`, `page`, `pageSize`
   - Response: List of orders with pagination

2. **PUT /api/order/{orderNo}/status** - Update order status
   - Body: `{ status, note }`
   - Response: Success/error message

### **Hooks Used:**

```typescript
import { useSellerOrders, useUpdateOrderStatus } from "@/hooks/useOrders";

// Fetch orders
const { data, isLoading, error } = useSellerOrders(status, page, pageSize);

// Update status
const updateStatus = useUpdateOrderStatus();
await updateStatus.mutateAsync({ orderId, status, note });
```

---

## 🎨 UI Components

### **Table Columns:**

1. **번호** - Order number (1-based index)
2. **주문일시** - Order date & time
3. **주문번호** - Order No (BOGOFIT-xxx)
4. **주문상품** - Product titles (max 2 shown)
5. **수량** - Total quantity
6. **상품금액** - Product amount
7. **배송비** - Shipping fee (₩0)
8. **주문상태** - Status badge
9. **주문자** - Customer name & phone
10. **총주문액** - Total amount
11. **결제방법** - Payment method (카드)
12. **액션** - Action buttons

### **Action Buttons:**

| Status | Button | Color | Action |
|--------|--------|-------|--------|
| `paid` | 배송준비 | Blue | → `fulfilling` |
| `fulfilling` | 배송완료 | Purple | → `fulfilled` |
| `fulfilled` | 완료 | Green | → `completed` |
| All | 상세 | Outline | View details (TODO) |

---

## 💻 Usage Example

```typescript
import AllOrdersSubSection from "@/components/(Business)/brands/(id)/order-management/subsections/AllOrdersSubSection";

export default function OrdersPage({ params }) {
  const { id } = params; // brandId
  
  return (
    <div className="p-6">
      <AllOrdersSubSection brandId={id} />
    </div>
  );
}
```

**With default status filter:**
```typescript
<AllOrdersSubSection brandId={id} defaultStatus="paid" />
```

---

## 🚫 Business Rules

### **What Sellers CAN do:**
- ✅ View all orders containing their brand's products
- ✅ View customer shipping information
- ✅ Update order status through workflow
- ✅ Filter orders by status
- ✅ Export orders to Excel (TODO)

### **What Sellers CANNOT do:**
- ❌ Delete orders (only update status)
- ❌ Modify order amounts
- ❌ See orders from other brands
- ❌ Access without approved SellApplication & Brand
- ❌ Skip status transitions (must follow workflow)

---

## 🔧 Error Handling

### **Common Errors:**

1. **"Brand not found or not approved for this user"**
   - **Cause**: SellApplication or Brand not approved
   - **Solution**: Check approval status, redirect to brand management

2. **"Order not found or doesn't belong to your brand"**
   - **Cause**: Invalid orderNo or wrong brand
   - **Solution**: Verify orderNo and brand ownership

3. **"Invalid status"**
   - **Cause**: Status value not in allowed list
   - **Solution**: Use valid status values from documentation

---

## 📱 Responsive Design

- ✅ **Desktop**: Full table with all columns
- ✅ **Tablet**: Horizontal scroll for table
- ✅ **Mobile**: Horizontal scroll with fixed columns

**Table Features:**
- Sticky header
- Row hover effects
- Horizontal scroll
- Compact layout
- Professional design

---

## 🎯 TODO / Future Enhancements

- [x] ~~Implement order detail modal~~ ✅ **DONE**
- [ ] Implement bulk status update
- [ ] Implement Excel export
- [ ] Add order search by orderNo/customer name
- [ ] Add date range filter
- [ ] Add order statistics/dashboard
- [ ] Add print order function
- [ ] Add order notes/comments
- [ ] Add order tracking number
- [ ] Add email notifications

---

## 📚 Related Documentation

- **Backend**: Order Module - Complete Guide
- **API Routes**: `/api/order/seller/route.ts`, `/api/order/[id]/status/route.ts`
- **Hooks**: `src/hooks/useOrders.ts`
- **Types**: `src/types/order.ts`

---

**Status:** ✅ Production Ready

**Last Updated:** 2024-01-22

**Version:** 1.0.0

