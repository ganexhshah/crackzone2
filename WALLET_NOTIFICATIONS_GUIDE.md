# Wallet Notifications System

This document explains the comprehensive wallet notifications system implemented in CrackZone, covering all payment-related activities and user communications.

## Overview

The wallet notifications system provides real-time updates to users about all their financial activities, including:
- Manual payment submissions
- Payment approvals and rejections
- Automatic deposits
- Withdrawal requests
- Transaction status updates

## Notification Types

### 1. Payment Submission Notifications 📤

**Trigger:** When user submits a manual payment request
**Type:** `wallet`
**Title:** "Payment Submitted Successfully"
**Message:** Details about the submitted payment with verification timeline

**Example:**
```
Your payment of ₹500 via eSewa has been submitted successfully. 
It will be verified by admin within 24 hours.
```

**Data Included:**
- Payment request ID
- Amount
- Transaction ID
- Payment method
- Status (pending)

### 2. Payment Approval Notifications ✅

**Trigger:** When admin approves a manual payment
**Type:** `wallet`
**Title:** "Payment Approved! 🎉"
**Message:** Confirmation that payment was approved and added to wallet

**Example:**
```
Great news! Your payment of ₹500 via eSewa has been approved and 
added to your wallet. You can now use this balance for tournaments 
and other activities.
```

**Data Included:**
- Payment request ID
- Amount
- Payment method
- Status (approved)
- Admin notes (if any)

### 3. Payment Rejection Notifications ❌

**Trigger:** When admin rejects a manual payment
**Type:** `wallet`
**Title:** "Payment Rejected ❌"
**Message:** Explanation of rejection with reason

**Example:**
```
Unfortunately, your payment of ₹500 via eSewa has been rejected. 
Reason: Screenshot is unclear. Please resubmit with a clearer image. 
Please contact support if you have any questions.
```

**Data Included:**
- Payment request ID
- Amount
- Payment method
- Status (rejected)
- Admin notes/reason
- Rejection reason

### 4. Automatic Deposit Notifications 💰

**Trigger:** When money is added via payment gateway
**Type:** `wallet`
**Title:** "Money Added Successfully! 💰"
**Message:** Confirmation of successful deposit

**Example:**
```
₹1000 has been successfully added to your wallet via ESEWA. 
Your new balance is now available for tournaments and other activities.
```

**Data Included:**
- Transaction ID
- Amount
- Payment method
- Type (deposit)
- Status (completed)

### 5. Withdrawal Request Notifications 📤

**Trigger:** When user submits a withdrawal request
**Type:** `wallet`
**Title:** "Withdrawal Request Submitted 📤"
**Message:** Confirmation of withdrawal submission with processing timeline

**Example:**
```
Your withdrawal request of ₹200 has been submitted successfully. 
The amount has been deducted from your balance and will be processed 
within 2-3 business days.
```

**Data Included:**
- Request ID
- Transaction ID
- Amount
- Type (withdrawal)
- Status (pending)

## Implementation Details

### Backend Implementation

#### 1. Notification Creation
All wallet operations create notifications using the notifications table:

```sql
INSERT INTO notifications (user_id, type, title, message, data) 
VALUES ($1, $2, $3, $4, $5)
```

#### 2. Routes Updated
The following routes now include notification creation:

- `POST /api/wallet/manual-payment` - Payment submission
- `PUT /api/admin/manual-payments/:id` - Payment approval/rejection
- `POST /api/wallet/add-money` - Automatic deposits
- `POST /api/wallet/withdraw` - Withdrawal requests

#### 3. Transaction Integration
Notifications are created within database transactions to ensure consistency:

```javascript
await pool.query('BEGIN');
try {
  // Perform wallet operation
  // Create notification
  await pool.query('COMMIT');
} catch (error) {
  await pool.query('ROLLBACK');
  throw error;
}
```

### Frontend Integration

#### 1. Notifications Display
The notifications are displayed in the `/notifications` page with:
- Wallet-specific filtering
- Rich formatting with emojis
- Color-coded by notification type
- Action buttons where applicable

#### 2. Real-time Updates
Users receive immediate feedback:
- Success messages in payment modals
- Notification badges in navigation
- Detailed notification history

#### 3. Notification Features
- Mark as read/unread
- Delete individual notifications
- Clear all notifications
- Filter by type (wallet, tournament, team, etc.)

## User Experience Flow

### Manual Payment Flow
1. **User submits payment** → Immediate success message + notification
2. **Admin reviews** → User gets approval/rejection notification
3. **If approved** → Money added to wallet + balance update notification
4. **If rejected** → Detailed reason provided + guidance for resubmission

### Automatic Payment Flow
1. **User initiates payment** → Payment gateway processing
2. **Payment succeeds** → Immediate notification + balance update
3. **Payment fails** → Error notification with retry options

### Withdrawal Flow
1. **User requests withdrawal** → Immediate confirmation + balance deduction
2. **Admin processes** → Status update notifications
3. **Withdrawal completed** → Final confirmation notification

## Notification Data Structure

Each notification includes structured data for rich display:

```json
{
  "paymentRequestId": 123,
  "amount": 500.00,
  "paymentMethod": "eSewa",
  "transactionId": "TXN123456",
  "status": "approved",
  "adminNotes": "Payment verified successfully",
  "type": "manual_payment"
}
```

## Admin Features

### Payment Management
Admins can:
- View all pending payments
- Approve/reject with detailed notes
- Automatic notification sending
- Bulk operations support

### Notification Monitoring
- Track notification delivery
- Monitor user engagement
- Analyze payment patterns

## Testing

### Automated Tests
Run the wallet notifications test suite:

```bash
cd backend
node test-wallet-notifications.js
```

### Manual Testing
1. Submit a manual payment
2. Check notifications page
3. Admin approve/reject payment
4. Verify notification updates
5. Test other wallet operations

## Configuration

### Environment Variables
```env
# Notification settings
NOTIFICATION_ENABLED=true
NOTIFICATION_RETENTION_DAYS=30
```

### Database Tables
- `notifications` - Main notifications table
- `manual_payment_requests` - Payment requests
- `transactions` - Transaction history
- `wallets` - User wallet balances

## Security Considerations

1. **User Isolation** - Users only see their own notifications
2. **Data Sanitization** - All notification content is sanitized
3. **Rate Limiting** - Prevent notification spam
4. **Audit Trail** - All notifications are logged

## Performance Optimization

1. **Indexing** - Proper database indexes on user_id and type
2. **Pagination** - Notifications are paginated for performance
3. **Caching** - Notification counts are cached
4. **Cleanup** - Old notifications are automatically cleaned up

## Future Enhancements

1. **Push Notifications** - Mobile push notifications
2. **Email Notifications** - Email alerts for important events
3. **SMS Notifications** - SMS for critical updates
4. **Webhook Integration** - Third-party integrations
5. **Advanced Filtering** - More granular notification filters

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check database connection
   - Verify user authentication
   - Check notification creation logs

2. **Duplicate notifications**
   - Check for duplicate API calls
   - Verify transaction handling

3. **Missing notification data**
   - Validate JSON data structure
   - Check data serialization

### Debug Commands

```bash
# Check recent notifications
SELECT * FROM notifications WHERE created_at > NOW() - INTERVAL '1 hour';

# Check notification stats
SELECT type, COUNT(*) FROM notifications GROUP BY type;

# Check user notifications
SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC;
```

## Support

For issues or questions about the wallet notifications system:
1. Check the troubleshooting section
2. Review the test results
3. Check server logs for errors
4. Contact the development team

---

**Note:** This system ensures users are always informed about their financial activities, providing transparency and building trust in the platform.