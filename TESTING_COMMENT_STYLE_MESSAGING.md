# Testing Guide: Comment-Style Messaging

## 🧪 Quick Test Guide

### Prerequisites
1. Ensure backend is running: `cd backend && npm start`
2. Ensure frontend is running: `cd Web_CampusKinect && npm run dev`
3. Have at least 2 test accounts ready

---

## Test Scenario 1: Basic Messaging Flow

### Step 1: Start a Conversation
1. **Login** as User A
2. Navigate to **Messages** tab
3. Click the **"+"** button (top right of search bar)
4. Search for User B
5. Click **"Start Chat"**
6. Navigate to `/chat/{userId}`

### Step 2: Send Initial Message
1. Type a message in the input field
2. Click **Send** or press **Enter**
3. ✅ **Verify**: Message appears in comment style:
   ```
   @you · just now
   │ [Your message]
   ```

### Step 3: Receive Reply (User B)
1. **Login** as User B (in different browser/incognito)
2. Navigate to **Messages** tab
3. ✅ **Verify**: See conversation in "Active Discussions"
4. Click conversation
5. ✅ **Verify**: See User A's message in chronological order
6. Send a reply
7. ✅ **Verify**: Message displays as:
   ```
   @userB · just now
   │ [Reply message]
   ```

### Step 4: Real-Time Updates (User A)
1. **Switch back** to User A's browser
2. ✅ **Verify**: User B's message appears automatically (no refresh)
3. ✅ **Verify**: Auto-scrolls to show new message
4. ✅ **Verify**: Green indicator shows "real-time active"

---

## Test Scenario 2: Comment-Style Display

### Check Visual Elements
1. Open an existing conversation
2. ✅ **Verify** each message shows:
   - **@username** (bold, colored)
   - **Time ago** (e.g., "2h ago", "just now")
   - **Message content** (indented with left border)
   - Oldest messages at top, newest at bottom

### Check Conversation List
1. View "Active Discussions" list
2. ✅ **Verify** each conversation shows:
   - **Post icon** (🏠 housing, 📦 goods, etc.)
   - **Post title** (primary, bold)
   - **"with @username"** (secondary)
   - **Last message preview** (in quotes)
   - **Time ago** (small text)

---

## Test Scenario 3: No Tab Confusion

### Before Fix (What We Removed)
- ❌ Messages jumped between "Sent" and "Incoming" tabs
- ❌ Confusing to find conversations

### After Fix (What to Verify)
1. Send a message
2. ✅ **Verify**: Conversation stays in same list
3. ✅ **Verify**: No "Sent" / "Incoming" tabs
4. ✅ **Verify**: All conversations in "Active Discussions"

---

## Test Scenario 4: Auto-Scroll

### Test Auto-Scroll on Send
1. Open conversation with multiple messages
2. Scroll to middle of conversation
3. Send a new message
4. ✅ **Verify**: Automatically scrolls to bottom
5. ✅ **Verify**: Smooth animation

### Test Auto-Scroll on Receive
1. Open conversation
2. Have other user send message
3. ✅ **Verify**: New message appears at bottom
4. ✅ **Verify**: Auto-scrolls to show it

---

## Test Scenario 5: Search & Filter

### Test Search
1. Go to Messages tab
2. Type in search bar: "Room"
3. ✅ **Verify**: Filters conversations by post title
4. Type: "@alice"
5. ✅ **Verify**: Filters by username

---

## Test Scenario 6: Post-Centric Context

### Verify Post Context Always Visible
1. Open any conversation
2. ✅ **Verify** header shows:
   - **Post icon** (🏠, 📦, 🔧, 📅)
   - **Post title** (e.g., "Room Available")
   - **"Discussion with @username"**
   - **Real-time indicator** (green dot if active)

---

## Test Scenario 7: Time Formatting

### Check Time Display
1. Send message **now**
   - ✅ Should show: "just now"
2. Wait 2 minutes
   - ✅ Should show: "2m ago"
3. Check old message (2 hours old)
   - ✅ Should show: "2h ago"
4. Check very old message (3 days old)
   - ✅ Should show: "3d ago"

---

## Test Scenario 8: Multiple Conversations

### Test Conversation Switching
1. Have 3+ active conversations
2. ✅ **Verify**: All appear in "Active Discussions"
3. Click conversation 1
4. ✅ **Verify**: Messages load correctly
5. Click conversation 2
6. ✅ **Verify**: Messages load correctly (different thread)
7. Send message in conversation 2
8. ✅ **Verify**: Appears in conversation 2 only

---

## Common Issues & Solutions

### Issue 1: Messages Not Loading
**Symptom**: Blank message area  
**Check**:
- Open browser console (F12)
- Look for errors in Network tab
- Verify backend is running
- Check: `GET /api/v1/messages/conversations/:id/messages`

### Issue 2: Real-Time Not Working
**Symptom**: Messages don't appear without refresh  
**Check**:
- Look for Socket.io connection logs:
  ```
  ✅ Socket connected: [socket-id]
  📬 Joined personal room: user-[userId]
  ```
- Verify green indicator shows in conversation header
- Check backend Socket.io is running

### Issue 3: Auto-Scroll Not Working
**Symptom**: New messages appear but don't scroll  
**Check**:
- Verify `messagesEndRef` is in JSX
- Check console for auto-scroll logs
- Try manual scroll to bottom

### Issue 4: Wrong Message Order
**Symptom**: Messages in wrong order (newest first)  
**Check**:
- Verify `api.ts` sorts messages:
  ```typescript
  messages.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  ```

---

## Browser Console Checklist

### Expected Console Logs (Happy Path)

**On Messages Tab Load:**
```
🚀 MessagesTab mounted - fetching initial data
📊 ALL ACTIVE DISCUSSIONS: [count]
```

**On Conversation Select:**
```
🖱️ POST-CENTRIC CONVERSATION CLICKED - OPENING INLINE CHAT
📬 Loading messages for conversation ID: [id]
🔍 Raw messages response: {...}
✅ Set conversationMessages state to: [...]
```

**On Send Message:**
```
📨 Sending message...
✅ Message sent successfully
```

**On Real-Time Receive:**
```
📨 Real-time message received: {...}
✅ Appending real-time message to conversation: {...}
```

---

## Performance Checks

### Load Time
1. Open Messages tab
2. ✅ **Verify**: Conversations load < 1 second
3. Click conversation
4. ✅ **Verify**: Messages load < 500ms

### Real-Time Latency
1. User A sends message
2. ✅ **Verify**: User B receives < 100ms

### Memory Usage
1. Open browser DevTools → Performance
2. Load Messages tab
3. Send 10 messages
4. ✅ **Verify**: No memory leaks
5. ✅ **Verify**: Smooth 60fps scrolling

---

## Edge Cases

### Test 1: Empty Conversation
1. Start new conversation
2. ✅ **Verify**: Shows "Start the conversation" prompt

### Test 2: Very Long Messages
1. Send message with 500+ characters
2. ✅ **Verify**: Displays correctly (wraps text)

### Test 3: Special Characters
1. Send: `Hello @user! Check this: https://example.com 🎉`
2. ✅ **Verify**: Displays correctly

### Test 4: Offline → Online
1. Disconnect internet
2. Try sending message
3. ✅ **Verify**: Error handling
4. Reconnect internet
5. ✅ **Verify**: Socket reconnects automatically

---

## Regression Tests

### Verify Old Features Still Work
1. ✅ **Search** conversations
2. ✅ **Delete** conversation
3. ✅ **Block** user (placeholder)
4. ✅ **Report** user (placeholder)
5. ✅ **Profile picture** displays
6. ✅ **Unread count** badge

---

## Success Criteria

✅ **All tests pass**  
✅ **No console errors**  
✅ **Build compiles successfully**  
✅ **Real-time messaging works**  
✅ **Auto-scroll functions**  
✅ **Comment-style display correct**  
✅ **No tab confusion**  
✅ **Performance acceptable**  

---

## Quick Commands

### Start Testing Environment
```bash
# Terminal 1: Backend
cd /Users/liammckeown/Desktop/CampusKinect/backend
npm start

# Terminal 2: Frontend
cd /Users/liammckeown/Desktop/CampusKinect/Web_CampusKinect
npm run dev

# Open browser: http://localhost:3000
```

### Check Logs
```bash
# Backend logs
tail -f backend/logs/combined-0.log

# Frontend console: F12 → Console
```

---

## Report Template

**Test Date**: [Date]  
**Tester**: [Name]  
**Environment**: Development / Production  

### Results

| Test | Status | Notes |
|------|--------|-------|
| Basic Messaging | ✅ / ❌ | |
| Comment Style Display | ✅ / ❌ | |
| No Tab Confusion | ✅ / ❌ | |
| Auto-Scroll | ✅ / ❌ | |
| Search & Filter | ✅ / ❌ | |
| Post Context | ✅ / ❌ | |
| Time Formatting | ✅ / ❌ | |
| Multiple Conversations | ✅ / ❌ | |
| Real-Time Updates | ✅ / ❌ | |
| Performance | ✅ / ❌ | |

### Issues Found
1. [Description]
   - **Severity**: Critical / Major / Minor
   - **Steps to Reproduce**: ...
   - **Expected**: ...
   - **Actual**: ...

---

## 🎉 Ready to Test!

The comment-style messaging system is now live and ready for testing. Follow the scenarios above to verify all functionality works as expected.

Good luck! 🚀 