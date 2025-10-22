# ⭐ Favorite Feature Update

**Date:** October 22, 2025  
**Status:** ✅ Completed

---

## 🎯 Objective

Thay đổi cấu trúc favorite:
- **Backend**: Cả Folder và Session đều có `isFavorite`
- **Frontend**: Chỉ hiển thị favorite cho Folder (ẩn Session favorite)

---

## ✅ Backend Changes

### 1. Prisma Schema
```prisma
model Folder {
  id         String    @id @default(uuid())
  name       String
  userId     String
  user       User      @relation(fields: [userId], references: [id])
  sessions   Session[]
  isFavorite Boolean   @default(false)  // ✅ Added
  createdAt  DateTime  @default(now())
}

model Session {
  // ... other fields
  isFavorite Boolean   @default(false)  // ✅ Kept (unchanged)
  // ...
}
```

### 2. Migration
```bash
# Migration file created: 20251022085319_add_folder_favorite
# Adds: isFavorite column to Folder table (default: false)
```

**To apply migration when database is running:**
```bash
cd backend
npx prisma migrate dev
```

### 3. Folder DTO
```typescript
// UpdateFolderDto
export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;  // ✅ Added
}
```

### 4. Folder Controller
```typescript
// New endpoint added
@Patch(':id/favorite')
toggleFavorite(@Req() req: any, @Param('id') id: string, @Body('isFavorite') isFavorite: boolean) {
  return this.folders.update(req.user.userId, id, { isFavorite });
}
```

**New API Endpoint:**
- `PATCH /folders/:id/favorite` - Toggle folder favorite status

---

## ✅ Frontend Changes

### 1. Folder Service Types
```typescript
export interface Folder {
  id: string;
  name: string;
  userId: string;
  isFavorite?: boolean;  // ✅ Added
  createdAt: string;
}

export interface UpdateFolderRequest {
  name?: string;
  isFavorite?: boolean;  // ✅ Added
}
```

### 2. Folder Service Methods
```typescript
// New method added
async toggleFavorite(id: string, isFavorite: boolean): Promise<Folder> {
  return apiClient.patch<Folder>(`folders/${id}/favorite`, { isFavorite });
}
```

### 3. Session Service
```typescript
// Method commented out (hidden from frontend)
/**
 * Toggle favorite status of a session
 * @deprecated Temporarily hidden - use folder favorite instead
 */
// async toggleFavorite(id: string, isFavorite: boolean): Promise<Session> {
//   return apiClient.patch<Session>(`sessions/${id}/favorite`, { isFavorite });
// }
```

**Note:** Backend endpoint `/sessions/:id/favorite` vẫn tồn tại nhưng không được sử dụng ở frontend.

---

## 📊 API Summary

### Folder Endpoints (6 total)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/folders` | List folders | ✅ |
| `POST` | `/folders` | Create folder | ✅ |
| `PATCH` | `/folders/:id` | Update folder | ✅ |
| `DELETE` | `/folders/:id` | Delete folder | ✅ |
| `PATCH` | `/folders/:id/favorite` | Toggle favorite | ✅ **NEW** |
| `GET` | `/folders/:id/sessions` | Get sessions | ✅ |

### Session Endpoints (9 total)

| Method | Endpoint | Description | Frontend Status |
|--------|----------|-------------|-----------------|
| `GET` | `/sessions` | List sessions | ✅ Active |
| `GET` | `/sessions/:id` | Get session | ✅ Active |
| `POST` | `/sessions` | Create session | ✅ Active |
| `PATCH` | `/sessions/:id` | Update session | ✅ Active |
| `DELETE` | `/sessions/:id` | Delete session | ✅ Active |
| `PATCH` | `/sessions/:id/favorite` | Toggle favorite | ⚠️ **Hidden** |
| `PATCH` | `/sessions/:id/folder` | Set folder | ✅ Active |
| `GET` | `/sessions/:id/export.json` | Export JSON | ✅ Active |
| `GET` | `/sessions/:id/export.md` | Export MD | ✅ Active |

---

## 🔄 Migration Path

### When Database is Running

```bash
# 1. Navigate to backend
cd backend

# 2. Apply migration
npx prisma migrate dev

# 3. Verify
npx prisma studio  # Check Folder table has isFavorite column
```

### Rollback (if needed)

```bash
# Revert migration
cd backend
npx prisma migrate resolve --rolled-back 20251022085319_add_folder_favorite

# Remove migration file
rm -rf prisma/migrations/20251022085319_add_folder_favorite

# Regenerate client
npx prisma generate
```

---

## 🎨 UI Impact

### Folder List
```tsx
// Show star icon for favorite folders
{folders.map(folder => (
  <div key={folder.id}>
    {folder.isFavorite && <StarIcon />}
    <span>{folder.name}</span>
    <button onClick={() => toggleFavorite(folder.id, !folder.isFavorite)}>
      Toggle Favorite
    </button>
  </div>
))}
```

### Session List
```tsx
// NO star icon for sessions (hidden)
{sessions.map(session => (
  <div key={session.id}>
    <span>{session.title}</span>
    {/* No favorite button */}
  </div>
))}
```

---

## 📝 Implementation Notes

### Backend
✅ Both Folder and Session have `isFavorite` field  
✅ Both have `/favorite` endpoints  
✅ Can be used independently

### Frontend
✅ Only Folder favorite is visible/usable  
⚠️ Session favorite is commented out (not removed)  
💡 Can be re-enabled later if needed

### Why Keep Both in Backend?
- **Flexibility**: Dễ dàng enable session favorite sau này
- **Data Integrity**: Không mất data hiện có
- **API Consistency**: Cả 2 resources có cùng pattern

### Why Hide Session Favorite in Frontend?
- **Simplicity**: Tránh confuse user (favorite folder hay session?)
- **UX Focus**: Folder-level organization rõ ràng hơn
- **Progressive Enhancement**: Có thể thêm lại sau dựa trên user feedback

---

## ✅ Testing Checklist

### Backend
- [ ] Start database: `docker-compose up -d`
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Test folder create: `POST /folders` → check `isFavorite: false`
- [ ] Test folder favorite: `PATCH /folders/:id/favorite` → check updated
- [ ] Test folder list: `GET /folders` → check `isFavorite` field present
- [ ] Verify session favorite still works: `PATCH /sessions/:id/favorite`

### Frontend
- [ ] TypeScript compiles without errors
- [ ] `folderService.toggleFavorite()` available
- [ ] `sessionService.toggleFavorite()` commented out (but no TS error)
- [ ] Folder interface has `isFavorite?: boolean`
- [ ] Session interface still has `isFavorite?: boolean` (for data compatibility)

### Integration
- [ ] Create folder → favorite it → verify in database
- [ ] List folders → check favorites appear first (if UI sorts)
- [ ] Delete favorite folder → sessions move to "Ungrouped"
- [ ] Session favorite endpoint not called from frontend

---

## 🚀 Deployment

### Database Migration
```bash
# Production
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Or via Docker
docker exec -it chatbot-backend npx prisma migrate deploy
```

### Code Deployment
1. ✅ Pull latest code
2. ✅ Run migration
3. ✅ Restart backend: `npm run start:prod`
4. ✅ Deploy frontend: `npm run build && npm start`

---

## 📚 Documentation Updated

- ✅ `frontend/docs/API_MAPPING.md` - Added folder favorite endpoint
- ✅ `SYNC_SUMMARY.md` - Needs update (separate task)
- ✅ Inline comments in `session.service.ts` explain deprecation

---

**Status:** ✅ **READY FOR TESTING**

Tất cả thay đổi đã hoàn tất. Chỉ cần chạy migration khi database ready, sau đó test các endpoint mới.
