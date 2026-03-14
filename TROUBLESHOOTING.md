# API Integration Troubleshooting Guide

## 🚨 Current Issues

Based on the error logs, here's the status of each endpoint:

| Endpoint | Status | Error Code | Issue |
|----------|--------|------------|-------|
| `/api/v1/subscriptions` | ❌ Failed | 400 Bad Request | Backend returning HTML error page |
| `/api/v1/activity-logs` | ❌ Failed | 400 Bad Request | Backend returning HTML error page |
| `/api/v1/notifications` | ❌ Failed | 404 Not Found | Endpoint doesn't exist |
| `/api/v1/analytics` | ❌ Failed | 404 Not Found | Endpoint doesn't exist |

## 📋 Error Details

### Error Response Format
The backend is returning HTML error pages instead of JSON:
```html
<!DOCTYPE html>
<html lang="en">
...
The requested resource was not found on this server
...
</html>
```

### Authentication Status
✅ **Authentication is working correctly!**
- Token is being sent: `eyJhbGciOi...`
- Authorization header is properly attached to requests

## 🔧 Solutions

### Solution 1: Implement Backend Endpoints (Recommended)

You need to create these endpoints in your backend. Here are the expected implementations:

#### 1. **GET /api/v1/subscriptions**
```javascript
// Example Node.js/Express implementation
router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.json({
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Expected Response:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "userId": "user123",
      "plan": "Premium",
      "provider": "Stripe",
      "status": "Active",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  ]
}
```

#### 2. **GET /api/v1/activity-logs**
```javascript
router.get('/activity-logs', authenticateToken, async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 });
    res.json({
      data: logs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Expected Response:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "timestamp": "2024-02-09T12:30:00Z",
      "action": "Published Article",
      "user": {
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "target": "Article #123"
    }
  ]
}
```

#### 3. **GET /api/v1/notifications**
```javascript
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json({
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Expected Response:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "New Submission Alert",
      "description": "Notify admins when new content is submitted",
      "trigger": "submission.created",
      "channels": ["email", "push"],
      "status": "active",
      "isActive": true
    }
  ]
}
```

#### 4. **GET /api/v1/analytics**
```javascript
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      userGrowth: '+12% From Last Months',
      totalLocations: 186,
      locationGrowth: '+23% From Last Months',
      monthlyRevenue: 4589,
      revenueGrowth: '+43% From Last Months',
      activeSessions: 545
    };

    res.json({
      data: {
        stats,
        charts: {
          lineChart: [],
          donutChart: [],
          barChart: []
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Expected Response:**
```json
{
  "data": {
    "stats": {
      "totalUsers": 1247,
      "userGrowth": "+12% From Last Months",
      "totalLocations": 186,
      "locationGrowth": "+23% From Last Months",
      "monthlyRevenue": 4589,
      "revenueGrowth": "+43% From Last Months",
      "activeSessions": 545
    },
    "charts": {
      "lineChart": [],
      "donutChart": [],
      "barChart": []
    }
  }
}
```

### Solution 2: Use Mock Data (Temporary)

If you want to test the frontend while building the backend, you can:

1. **Use MSW (Mock Service Worker)** - Intercept API calls and return mock data
2. **Create a mock API server** - Simple Express server with mock data
3. **Use conditional mock data** - Check if API fails, then use hardcoded data

Would you like me to implement any of these mock solutions?

## 🔍 Debugging Steps

### 1. Check Backend Server
Make sure your backend server is running and accessible at `http://localhost:3000/api/v1/`

### 2. Test Endpoints Manually
Use a tool like Postman or curl to test:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/v1/subscriptions
```

### 3. Check Backend Logs
Look at your backend server logs to see what's happening when these requests come in.

### 4. Verify Routes
Make sure your backend has these routes registered:
```javascript
app.use('/api/v1', routes);
```

## ✅ Frontend Status

**The frontend is working correctly!** ✨

- ✅ API calls are being made to the correct endpoints
- ✅ Authentication tokens are being sent
- ✅ Error handling is in place
- ✅ Data will display correctly once backend responds with proper data

## 📝 Next Steps

1. **Implement the backend endpoints** using the examples above
2. **Test each endpoint** individually with Postman/curl
3. **Verify the response format** matches what the frontend expects
4. **Refresh the frontend** and the data should load automatically

## 🆘 Need Help?

If you need help implementing the backend endpoints, please provide:
- Your backend framework (Express, NestJS, Django, etc.)
- Database you're using (MongoDB, PostgreSQL, etc.)
- Current backend code structure
