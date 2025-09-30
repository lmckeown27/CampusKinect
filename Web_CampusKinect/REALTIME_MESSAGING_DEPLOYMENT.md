# Real-Time Messaging Deployment Guide

## Overview
This guide explains how to deploy the real-time messaging feature to production. The web messaging system now uses Socket.io for instant message delivery, matching the iOS real-time experience.

## Architecture
- **Backend**: Socket.io server (already configured in `backend/src/server.js`)
- **Frontend**: Socket.io client with React hooks
- **Transport**: WebSocket with polling fallback
- **Authentication**: Uses existing HTTP-only cookie authentication

## Pre-Deployment Checklist

### 1. Backend Configuration
The backend already has Socket.io configured and running on port 8080. Verify:

```bash
cd ~/CampusKinect/backend
pm2 status
# Ensure campuskinect-backend is running
```

### 2. Frontend Dependencies
The frontend now includes `socket.io-client`:

```bash
cd ~/CampusKinect/Web_CampusKinect
npm list socket.io-client
# Should show: socket.io-client@4.x.x
```

## Deployment Steps

### On Production Server (Ubuntu EC2):

```bash
# 1. Navigate to project root
cd ~/CampusKinect

# 2. Pull latest changes
git pull origin main

# 3. Navigate to frontend
cd Web_CampusKinect

# 4. Install dependencies (includes socket.io-client)
npm install

# 5. Rebuild and restart Docker containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d

# 6. Verify containers are running
docker ps

# 7. Check logs
docker logs campuskinect-web-prod -f
docker logs campuskinect-nginx-prod -f
```

### Backend Verification

```bash
# Check backend logs for Socket.io connections
cd ~/CampusKinect/backend
pm2 logs campuskinect-backend --lines 50

# You should see:
# - "Socket.io server initialized"
# - "User connected: <socket-id>" when users connect
# - "User joined personal room: <user-id>" when authenticated
```

## How It Works

### 1. Connection Flow
1. User logs into web app
2. `useRealTimeMessages` hook initializes
3. Socket.io connects to backend (`https://campuskinect.net`)
4. User joins their personal room (`user-${userId}`)
5. Real-time updates begin

### 2. Message Flow
1. User A sends message to User B
2. Backend receives POST to `/api/v1/messages/conversations/:id/messages`
3. Backend saves message to database
4. Backend emits `new-message` event to `user-${userBId}` room
5. User B's browser receives event instantly
6. Message appears in User B's chat without refresh

### 3. Conversation Updates
- New messages trigger conversation list refresh
- Last message timestamp updates in real-time
- Unread counts update automatically

## Features

### Web Messaging (NEW)
- ✅ Real-time message delivery
- ✅ Visual connection indicator (green pulse)
- ✅ Automatic conversation refresh
- ✅ No page reload required
- ✅ WebSocket with polling fallback
- ✅ Auto-reconnect on disconnect

### iOS Messaging (EXISTING)
- ✅ Polling-based updates
- ✅ Lazy conversation creation
- ✅ Swipe-to-delete
- ✅ Image sharing
- ✅ Camera integration

## Testing Real-Time Messaging

### Test 1: Message Delivery
1. Open browser 1: Login as User A
2. Open browser 2 (incognito): Login as User B
3. User A sends message to User B
4. **Expected**: User B sees message instantly without refresh

### Test 2: Connection Indicator
1. Login to web app
2. Open messages page
3. Select a conversation
4. **Expected**: Green pulsing dot appears next to post title

### Test 3: Conversation List Updates
1. User A has conversation list open
2. User B sends new message to User A
3. **Expected**: User A's conversation list updates automatically

## Troubleshooting

### Issue: Messages not appearing in real-time

**Check 1: Socket.io Connection**
```bash
# Browser console should show:
# "🔌 Initializing socket connection to: https://campuskinect.net"
# "✅ Socket connected: <socket-id>"
# "📬 Joined personal room: user-<user-id>"
```

**Check 2: Backend Socket.io**
```bash
pm2 logs campuskinect-backend | grep "Socket"
# Should show user connections
```

**Check 3: Network Tab**
- Open browser DevTools → Network tab
- Filter by "WS" (WebSocket)
- Should see successful WebSocket connection to `wss://campuskinect.net`

### Issue: Connection indicator not showing

**Solution**: Refresh page and check console for socket connection logs

### Issue: CORS errors

**Solution**: Backend already configured with allowed origins:
- `https://campuskinect.net`
- `https://www.campuskinect.net`
- `https://api.campuskinect.net`

## Performance Considerations

### Memory Usage
- Each active Socket.io connection uses ~1-2 MB RAM
- 100 concurrent users = ~100-200 MB additional RAM
- Current t3.medium (4 GB RAM) can handle 500+ concurrent connections

### Database Impact
- Real-time messaging REDUCES database load
- No more constant polling for new messages
- Messages only fetched when conversation opened

### Network Bandwidth
- WebSocket connection: ~2 KB/s idle
- Message transmission: ~500 bytes per message
- Very efficient compared to HTTP polling

## Rollback Plan

If issues occur, rollback to previous version:

```bash
cd ~/CampusKinect
git log --oneline -5  # Find commit hash before real-time messaging
git reset --hard <commit-hash>
cd Web_CampusKinect
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

## Monitoring

### Key Metrics to Watch
1. **Socket.io connections**: `pm2 logs` for connection/disconnection events
2. **Message delivery time**: Browser console logs show timestamps
3. **Memory usage**: `docker stats` for container memory
4. **CPU usage**: Should remain low (<10% for messaging)

### Success Criteria
- ✅ Messages appear in <1 second
- ✅ Green indicator shows when connected
- ✅ No console errors
- ✅ Conversation list updates automatically
- ✅ Works across multiple browser tabs

## Next Steps (Optional Enhancements)

1. **Typing indicators**: Show "User is typing..."
2. **Read receipts**: Show when messages are read
3. **Online status**: Show user online/offline
4. **Push notifications**: Desktop notifications for new messages
5. **Message reactions**: Add emoji reactions to messages

## Support

If you encounter issues:
1. Check browser console for error logs
2. Check `pm2 logs campuskinect-backend`
3. Check Docker logs: `docker logs campuskinect-web-prod`
4. Verify nginx is routing WebSocket correctly
5. Test with multiple browsers/incognito windows

---

**Deployed**: $(date)
**Version**: Real-Time Messaging v1.0
**Status**: ✅ Ready for Production 