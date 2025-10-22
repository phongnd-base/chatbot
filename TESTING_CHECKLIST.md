# 🧪 Testing Checklist - Active Session & API Optimization

## ✅ Pre-Testing Setup

1. **Start Backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Chrome DevTools**:
   - Mở http://localhost:3000
   - Nhấn F12 → Network tab
   - ✅ Check "Disable cache"
   - 🗑️ Clear existing logs

---

## 🎯 Test 1: API Call Optimization

### Expected Behavior:
**Trước đây**: 9+ API calls duplicate (sessions, folders được gọi nhiều lần)
**Bây giờ**: CHỈ 4 API calls

### Steps:
1. Refresh trang `/chat` hoặc `/chat/new`
2. Mở Network tab, filter: XHR/Fetch
3. Đếm số lượng request:

**Expected API Calls**:
```
✅ GET /api/bff/sessions        (1 lần - từ layout)
✅ GET /api/bff/folders         (1 lần - từ layout)
✅ GET /api/bff/sessions/:id    (1 lần - từ page, nếu có sessionId)
✅ GET /api/bff/messages/:id    (1 lần - từ page, nếu có sessionId)
```

**❌ KHÔNG nên thấy**:
- ❌ Duplicate `/sessions` calls (2, 3, 4 lần)
- ❌ Duplicate `/folders` calls (2, 3, 4 lần)

### Pass Criteria:
- [ ] Chỉ thấy 1 lần GET /sessions
- [ ] Chỉ thấy 1 lần GET /folders
- [ ] Tổng cộng ≤ 4 requests
- [ ] Không có duplicate requests

---

## 🎯 Test 2: Active Session Highlighting

### Expected Behavior:
Session hiện tại trong sidebar phải được **highlight** (màu khác, background khác)

### Steps:

#### 2.1. Kiểm tra URL sync
1. Navigate to `/chat/abc-123-def`
2. **Expected**: Session `abc-123-def` trong sidebar có class `active` hoặc `bg-accent`
3. Click session khác (ví dụ `xyz-789`)
4. **Expected**: 
   - URL change to `/chat/xyz-789`
   - Highlight move to session `xyz-789`
   - Session cũ (`abc-123-def`) không còn highlight

#### 2.2. Kiểm tra refresh persistence
1. Navigate to `/chat/session-id-123`
2. Refresh page (F5)
3. **Expected**: 
   - Session `session-id-123` vẫn được highlight
   - URL không đổi
   - Không mất active state

#### 2.3. Kiểm tra "New Chat"
1. Click button "New Chat"
2. **Expected**:
   - URL: `/chat/new`
   - Không có session nào được highlight (vì chưa có sessionId)

### Implementation Check:
```tsx
// File: components/sidebar/SessionListItem.tsx
// Phải có logic kiểu này:

const { activeSessionId } = useChatStore();
const isActive = session.id === activeSessionId;

<div className={cn(
  "session-item",
  isActive && "bg-accent text-accent-foreground" // ← Highlight
)}>
```

### Pass Criteria:
- [ ] Session trong sidebar highlight khi URL match
- [ ] Highlight move khi click session khác
- [ ] Highlight persist sau F5 refresh
- [ ] Active state đúng với URL path

---

## 🎯 Test 3: CRUD Operations (Không bị break)

### 3.1. Create Session
1. Click "New Chat"
2. Send một message
3. **Expected**:
   - Session mới xuất hiện trong sidebar NGAY LẬP TỨC
   - Không cần F5
   - Session mới được highlight

### 3.2. Delete Session
1. Right-click session → Delete (hoặc icon trash)
2. **Expected**:
   - Session biến mất khỏi sidebar NGAY LẬP TỨC
   - Không cần F5
   - Nếu đang active session đó → redirect về `/chat/new`

### 3.3. Create Folder
1. Click "+ New Folder"
2. Nhập tên, nhấn Enter
3. **Expected**:
   - Folder mới xuất hiện NGAY LẬP TỨC
   - Không cần F5

### 3.4. Move Session to Folder
1. Drag session vào folder (hoặc dropdown menu)
2. **Expected**:
   - Session move vào folder NGAY LẬP TỨC
   - Sidebar re-render đúng

### 3.5. Toggle Folder Favorite
1. Click ⭐ icon trên folder
2. **Expected**:
   - Folder move lên top (nếu favorite)
   - Icon đổi màu/filled

### Pass Criteria:
- [ ] Create session → immediate update
- [ ] Delete session → immediate update
- [ ] Create folder → immediate update
- [ ] Move session → immediate update
- [ ] Toggle favorite → immediate update
- [ ] **Không cần F5 cho bất kỳ action nào**

---

## 🎯 Test 4: Chat Streaming

### Expected Behavior:
AI response stream từng chữ, từng câu (không chờ toàn bộ response)

### Steps:
1. Navigate to `/chat/:sessionId`
2. Nhập prompt: "Write a long story about a cat"
3. **Expected**:
   - Message xuất hiện từng chữ một (streaming)
   - Không block UI
   - Có thể scroll trong lúc streaming

### Pass Criteria:
- [ ] Streaming hoạt động
- [ ] UI không freeze
- [ ] Message lưu vào DB sau khi stream complete

---

## 🎯 Test 5: Error Handling

### 5.1. Backend Offline
1. Tắt backend server
2. Refresh frontend
3. **Expected**:
   - Hiển thị error message
   - Không crash app
   - Có retry button hoặc auto-retry

### 5.2. 401 Unauthorized
1. Xóa cookie/token
2. Refresh page
3. **Expected**:
   - Redirect về `/login`
   - Không crash

### 5.3. Network Error
1. Throttle network (Chrome DevTools → Network → Slow 3G)
2. Create new session
3. **Expected**:
   - Loading state hiển thị
   - Timeout sau 30s → error message

### Pass Criteria:
- [ ] Backend offline → graceful error
- [ ] 401 → redirect login
- [ ] Network error → timeout + retry

---

## 🎯 Test 6: Performance Metrics

### Tools:
- Chrome DevTools → Network tab
- Chrome DevTools → Performance tab

### Metrics to Check:

#### API Calls:
```
Before optimization: 9+ requests
After optimization:  4 requests
Reduction:          56%
```

#### Time to Interactive (TTI):
1. Refresh page
2. Đo thời gian từ lúc F5 đến lúc sidebar hiển thị đầy đủ
3. **Expected**: < 2 seconds (với mạng nhanh)

#### Bundle Size:
```bash
cd frontend
npm run build
```
**Check**: 
- Total bundle size < 500KB (gzipped)
- Zustand only 3KB → lightweight ✅

### Pass Criteria:
- [ ] API calls reduced 50%+
- [ ] TTI < 2s
- [ ] No console errors
- [ ] No memory leaks (test bằng cách create/delete 100 sessions)

---

## 🚨 Known Issues & Limitations

### Current Limitations:
1. **No optimistic updates**: CRUD operations đợi API response (có thể cải thiện sau)
2. **No pagination**: Load all sessions/folders at once (OK cho < 100 items)
3. **No real-time sync**: Nếu user mở 2 tab, changes không sync (cần WebSocket sau)

### Future Improvements:
- [ ] Add optimistic updates (update UI trước, API sau)
- [ ] Add pagination (load 20 sessions per page)
- [ ] Add WebSocket sync (multi-tab support)
- [ ] Add offline mode (IndexedDB cache)

---

## 📊 Success Criteria Summary

### Must Pass (Critical):
- ✅ API calls reduced from 9+ to 4
- ✅ Active session highlighting works
- ✅ CRUD operations immediate update (no F5)
- ✅ No TypeScript errors
- ✅ No console errors

### Should Pass (Important):
- ✅ Streaming works
- ✅ Error handling graceful
- ✅ Performance good (< 2s TTI)

### Nice to Have (Future):
- ⏳ Optimistic updates
- ⏳ Pagination
- ⏳ Multi-tab sync

---

## 🐛 If Tests Fail

### Debug Steps:

#### 1. Check Console Errors:
```
F12 → Console tab
Look for:
- ❌ Type errors
- ❌ 404 API errors
- ❌ Zustand errors
```

#### 2. Check Network Tab:
```
F12 → Network tab
Filter: XHR/Fetch
Look for:
- ❌ 500 errors
- ❌ Duplicate requests
- ❌ Slow requests (> 5s)
```

#### 3. Check Zustand Store:
```tsx
// Tạm thời add vào component:
const sessions = useSessionStore((s) => s.sessions);
console.log('Sessions in store:', sessions);
```

#### 4. Check Active Session:
```tsx
const { activeSessionId } = useChatStore();
console.log('Active session:', activeSessionId);
console.log('URL sessionId:', params.sessionId);
```

### Common Issues:

| Issue | Cause | Fix |
|-------|-------|-----|
| Duplicate API calls | Component calling hook multiple times | Check if layout already calls useSessions/useFolders |
| Active not working | activeSessionId not set | Check useSession hook calls setActiveSessionId |
| CRUD not updating UI | Store not updated | Check store actions in service layer |
| Streaming frozen | NDJSON parse error | Check backend response format |

---

## ✅ Final Checklist

- [ ] **Test 1**: API optimization (4 calls max) ✅
- [ ] **Test 2**: Active session highlighting ✅
- [ ] **Test 3**: CRUD operations work ✅
- [ ] **Test 4**: Chat streaming works ✅
- [ ] **Test 5**: Error handling graceful ✅
- [ ] **Test 6**: Performance metrics good ✅

### Sign-off:
```
Tested by: _________________
Date: _____________________
Status: PASS / FAIL
Notes: ____________________
```

---

**Next Steps After Testing**:
1. If PASS → Deploy to staging
2. If FAIL → Report issues with screenshots + console logs
3. Monitor production metrics after deployment
