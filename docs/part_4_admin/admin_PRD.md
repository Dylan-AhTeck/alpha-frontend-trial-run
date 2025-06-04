# **PRD: Admin Dashboard Backend Integration**

## **Project Overview**

Transform the existing mock admin dashboard into a fully functional, secure admin interface connected to real backend APIs with enhanced JWT-based authentication.

---

## **Goals & Success Criteria**

### **Primary Goals**

1. ✅ **Secure Admin Authentication**: JWT-based admin role detection
2. ✅ **Real Data Integration**: Replace dummy data with live thread/user data
3. ✅ **Thread Management**: Enable admin thread deletion functionality
4. ✅ **Production Ready**: Secure, scalable, audit-ready implementation

### **Success Criteria**

- Admin users see all user threads from real Assistant-UI Cloud data
- Non-admin users cannot access admin endpoints (401/403 responses)
- Thread deletion works across both Assistant-UI Cloud and LangGraph
- Admin detection is database-driven, not email string matching
- All admin actions are logged for audit purposes

---

## **Architecture Changes**

### **Database Layer**

```sql
-- New Supabase table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL UNIQUE
);

-- Initial admin users
INSERT INTO admin_users (email) VALUES
    ('admin@alpha.com'),
    ('dylanahteck@gmail.com');
```

### **Authentication Enhancement**

```python
# Enhanced JWT creation with admin claims (via Supabase Custom Access Token Hook)
{
    "sub": "user_id",
    "email": "user@example.com",
    "role": "admin",  # NEW: Added by Supabase hook when user is in admin_users table
    "aud": "authenticated",
    "iss": "supabase"
}
```

---

## **Backend Implementation**

### **1. Database Setup**

```sql
-- File: supabase/migrations/004_create_admin_users.sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL UNIQUE
);

-- RLS Policies (server-only access)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- No client policies = server-only access
```

### **2. Supabase Custom Access Token Hook**

A Custom Access Token Hook will be configured in Supabase to automatically add the `role: "admin"` claim to JWTs when the user's email exists in the `admin_users` table. The hook code will be provided during implementation.

### **3. Admin Service Layer**

```python
# File: backend/app/services/admin_service.py
class AdminService:
    async def get_all_user_threads(self) -> List[ThreadWithUser]
    async def get_thread_details(self, thread_id: str) -> ThreadDetails
    async def delete_thread(self, thread_id: str, admin_user_id: str) -> bool
    async def get_all_users(self) -> List[UserSummary]
```

### **4. Admin Middleware**

```python
# File: backend/app/core/admin_dependencies.py
async def require_admin(current_user: Dict = Depends(get_current_user)) -> Dict:
    """Dependency that ensures user has admin role in JWT"""
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return current_user
```

### **5. Admin API Endpoints**

```python
# File: backend/app/api/admin.py
@router.get("/users")
async def list_all_users(admin_user = Depends(require_admin))

@router.get("/threads")
async def list_all_threads(admin_user = Depends(require_admin))

@router.get("/threads/{thread_id}/messages")
async def get_thread_messages(thread_id: str, admin_user = Depends(require_admin))

@router.delete("/threads/{thread_id}")
async def delete_thread(thread_id: str, admin_user = Depends(require_admin))
```

### **6. Enhanced Auth Service**

```python
# File: backend/app/services/auth_service.py
class AuthService:
    async def check_admin_status(self, email: str) -> bool:
        """Check if user email exists in admin_users table"""

    async def create_enhanced_jwt(self, user_data: dict) -> str:
        """Create JWT with admin role if user is admin"""
```

---

## **Frontend Implementation**

### **1. Admin API Client**

```typescript
// File: frontend/src/lib/admin-api.ts
export class AdminAPI {
  async getAllUsers(): Promise<UserWithThreads[]>;
  async getAllThreads(): Promise<ThreadWithUser[]>;
  async getThreadMessages(threadId: string): Promise<Message[]>;
  async deleteThread(threadId: string): Promise<void>;
}
```

### **2. Admin Authentication**

```typescript
// File: frontend/src/hooks/useAdminAuth.ts
export const useAdminAuth = () => {
  const isAdmin = useMemo(() => {
    return session?.user?.app_metadata?.role === "admin";
  }, [session]);

  return { isAdmin, loading };
};
```

### **3. Update Admin Page**

```typescript
// File: frontend/src/app/admin/page.tsx
// Replace getDummyUsers() with real API calls
// Add loading states, error handling
// Implement real thread deletion
```

---

## **Security Implementation**

### **1. JWT Enhancement**

- **Location**: Supabase Custom Access Token Hook
- **Change**: Add `role: "admin"` claim when user email exists in `admin_users` table
- **Validation**: All admin endpoints verify JWT contains `role: "admin"`

### **2. Database Security**

- **admin_users table**: Server-only access via RLS policies
- **No client access**: Prevents client-side admin escalation
- **Audit trail**: Track who creates/modifies admin users

### **3. API Security**

- **Admin middleware**: Reusable dependency for all admin endpoints
- **JWT validation**: Verify admin role in every admin API call
- **Error handling**: Consistent 403 responses for unauthorized access

---

## **Data Flow**

### **Admin Detection Flow**

```
1. User logs in → Supabase auth
2. Supabase Custom Access Token Hook checks admin_users table
3. If admin: Hook adds role: "admin" to JWT
4. Frontend receives JWT with admin claim
5. Admin UI conditionally rendered
```

### **Admin Dashboard Flow**

```
1. Frontend detects admin role in JWT
2. Calls /api/admin/threads endpoint
3. Backend validates admin JWT claim
4. Returns real thread data from Assistant-UI + LangGraph
5. Frontend renders with delete buttons
6. Delete calls both Assistant-UI and LangGraph APIs
```

---

## **Implementation Phases**

### **Phase 1: Backend Foundation (Days 1-2)**

1. ✅ Create `admin_users` table and migration
2. ✅ Configure Supabase Custom Access Token Hook
3. ✅ Implement admin service layer
4. ✅ Create admin middleware/dependencies
5. ✅ Set up admin API endpoints structure

### **Phase 2: Authentication Enhancement (Day 3)**

1. ✅ Test admin JWT generation with Custom Access Token Hook
2. ✅ Verify admin role claims in backend
3. ✅ Test admin/non-admin authentication flows

### **Phase 3: API Implementation (Days 4-5)**

1. ✅ Implement thread fetching from Assistant-UI Cloud
2. ✅ Implement thread deletion (dual deletion)
3. ✅ Add user listing functionality
4. ✅ Add comprehensive error handling

### **Phase 4: Frontend Integration (Days 6-7)**

1. ✅ Replace dummy data with real API calls
2. ✅ Update admin authentication logic
3. ✅ Implement thread deletion UI
4. ✅ Add loading states and error handling

### **Phase 5: Testing & Hardening (Day 8)**

1. ✅ Test admin/non-admin access controls
2. ✅ Verify thread deletion works end-to-end
3. ✅ Add audit logging
4. ✅ Performance testing

---

## **Technical Specifications**

### **Database Schema**

```sql
admin_users:
  - id: UUID (PK)
  - email: VARCHAR UNIQUE NOT NULL
```

### **JWT Structure**

```json
{
  "sub": "uuid",
  "email": "admin@alpha.com",
  "role": "admin",
  "aud": "authenticated",
  "iss": "supabase",
  "exp": 1234567890
}
```

### **API Endpoints**

```
GET    /api/admin/users          - List all users
GET    /api/admin/threads        - List all threads
GET    /api/admin/threads/{id}/messages - Get thread messages
DELETE /api/admin/threads/{id}   - Delete thread
```

---

## **Success Metrics**

1. **Security**: Zero unauthorized admin access attempts succeed
2. **Functionality**: Admin can view and delete any user thread
3. **Performance**: Thread listing loads within 2 seconds
4. **Reliability**: 99%+ uptime for admin endpoints
5. **Audit**: All admin actions properly logged

---

## **Risks & Mitigations**

| Risk                          | Impact | Mitigation                                    |
| ----------------------------- | ------ | --------------------------------------------- |
| Admin escalation              | HIGH   | Server-only admin_users table, JWT validation |
| Thread deletion errors        | MEDIUM | Rollback mechanism, error handling            |
| Performance issues            | LOW    | Pagination, caching                           |
| Assistant-UI Cloud API limits | MEDIUM | Rate limiting, retry logic                    |

---

## **Dependencies**

- ✅ Existing Supabase infrastructure
- ✅ Assistant-UI Cloud integration working
- ✅ LangGraph backend operational
- ✅ JWT authentication system in place

Ready to begin implementation? 🚀
