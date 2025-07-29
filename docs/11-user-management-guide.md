# คู่มือการจัดการผู้ใช้ (User Management Guide)

## 👥 ภาพรวมการจัดการผู้ใช้

คู่มือนี้ครอบคลุมการจัดการผู้ใช้ในระบบ ตั้งแต่การสร้าง แก้ไข ลบ จนถึงการจัดการสิทธิ์และบทบาทต่างๆ

### คุณสมบัติหลัก
- User registration และ profile management
- Role-based access control (RBAC)
- User activity tracking
- Account management (activate/deactivate)
- Bulk user operations
- User analytics และ reporting

## 🔐 User Roles และ Permissions

### 1. User Roles

#### USER (ผู้ใช้ทั่วไป)
- สร้างและจัดการ posts ของตัวเอง
- อัปโหลดและจัดการไฟล์ของตัวเอง
- ดูข้อมูล profile ของตัวเอง
- เปลี่ยนรหัสผ่านและข้อมูลส่วนตัว

#### ADMIN (ผู้ดูแลระบบ)
- จัดการผู้ใช้ทั้งหมด (CRUD operations)
- ดูและจัดการ posts ทั้งหมด
- เข้าถึง monitoring และ analytics
- จัดการระบบ settings
- ดู audit logs และ security events

### 2. Permission Matrix

| Action | USER | ADMIN |
|--------|------|-------|
| View own profile | ✅ | ✅ |
| Edit own profile | ✅ | ✅ |
| View all users | ❌ | ✅ |
| Create/Edit/Delete users | ❌ | ✅ |
| Upload files | ✅ | ✅ |
| Delete any file | ❌ | ✅ |
| View monitoring dashboard | ❌ | ✅ |
| Access admin endpoints | ❌ | ✅ |

## 🚀 User Management APIs

### 1. Get All Users (Admin Only)

```http
GET /api/users
Authorization: Bearer <admin_token>
```

#### Query Parameters:
- `page`: หมายเลขหน้า (default: 1)
- `limit`: จำนวนรายการต่อหน้า (default: 10)
- `role`: กรองตาม role (USER, ADMIN)
- `isActive`: กรองตามสถานะ (true, false)
- `search`: ค้นหาจาก name หรือ email

#### Response:
```json
{
  "users": [
    {
      "id": "clxxxxx1",
      "email": "user1@example.com",
      "name": "John Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2025-07-29T10:00:00.000Z",
      "updatedAt": "2025-07-29T10:00:00.000Z",
      "_count": {
        "posts": 5,
        "files": 12
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### 2. Get User by ID

```http
GET /api/users/{userId}
Authorization: Bearer <token>
```

#### Response:
```json
{
  "id": "clxxxxx1",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "isActive": true,
  "createdAt": "2025-07-29T10:00:00.000Z",
  "updatedAt": "2025-07-29T10:00:00.000Z",
  "posts": [
    {
      "id": "post1",
      "title": "Sample Post",
      "published": true,
      "createdAt": "2025-07-29T11:00:00.000Z"
    }
  ],
  "files": [
    {
      "id": "file1",
      "originalName": "image.jpg",
      "type": "IMAGE",
      "status": "COMPLETED",
      "createdAt": "2025-07-29T12:00:00.000Z"
    }
  ],
  "stats": {
    "totalPosts": 5,
    "publishedPosts": 3,
    "totalFiles": 12,
    "totalFileSize": 52428800
  }
}
```

### 3. Create User (Admin Only)

```http
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securePassword123!",
  "name": "New User",
  "role": "USER"
}
```

#### Response:
```json
{
  "id": "clxxxxx2",
  "email": "newuser@example.com",
  "name": "New User",
  "role": "USER",
  "isActive": true,
  "createdAt": "2025-07-29T13:00:00.000Z",
  "message": "User created successfully"
}
```

### 4. Update User

```http
PUT /api/users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### Admin can also update:
```json
{
  "name": "Updated Name",
  "role": "ADMIN",
  "isActive": false
}
```

### 5. Delete User (Admin Only)

```http
DELETE /api/users/{userId}
Authorization: Bearer <admin_token>
```

#### Response:
```json
{
  "message": "User deleted successfully",
  "deletedUser": {
    "id": "clxxxxx2",
    "email": "deleted@example.com",
    "name": "Deleted User"
  }
}
```

### 6. Activate/Deactivate User (Admin Only)

```http
PATCH /api/users/{userId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}
```

### 7. Change User Role (Admin Only)

```http
PATCH /api/users/{userId}/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

### 8. Reset User Password (Admin Only)

```http
POST /api/users/{userId}/reset-password
Authorization: Bearer <admin_token>
```

#### Response:
```json
{
  "message": "Password reset email sent",
  "temporaryPassword": "temp123456" // Only in development
}
```

## 📊 User Analytics และ Statistics

### 1. User Statistics

```http
GET /api/users/stats
Authorization: Bearer <admin_token>
```

#### Response:
```json
{
  "total": 150,
  "active": 142,
  "inactive": 8,
  "byRole": {
    "USER": 145,
    "ADMIN": 5
  },
  "registrationTrend": [
    {
      "date": "2025-07-29",
      "count": 5
    }
  ],
  "topActiveUsers": [
    {
      "id": "user1",
      "name": "John Doe",
      "postsCount": 25,
      "filesCount": 50
    }
  ]
}
```

### 2. User Activity Logs

```http
GET /api/users/{userId}/activity
Authorization: Bearer <admin_token>
```

#### Response:
```json
{
  "activities": [
    {
      "id": "activity1",
      "type": "LOGIN",
      "description": "User logged in",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-07-29T10:00:00.000Z"
    },
    {
      "id": "activity2",
      "type": "FILE_UPLOAD",
      "description": "Uploaded image.jpg",
      "metadata": {
        "fileName": "image.jpg",
        "fileSize": 1024000
      },
      "createdAt": "2025-07-29T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🔧 User Management Service Implementation

### 1. User Service

```typescript
// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private activityLogger: ActivityLoggerService,
  ) {}

  async findAll(query: GetUsersDto): Promise<PaginatedUsersResponse> {
    const { page = 1, limit = 10, role, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              files: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, includeDetails = false): Promise<User | null> {
    const include = includeDetails ? {
      posts: {
        select: {
          id: true,
          title: true,
          published: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      files: {
        select: {
          id: true,
          originalName: true,
          type: true,
          status: true,
          size: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    } : undefined;

    const user = await this.prisma.user.findUnique({
      where: { id },
      include,
    });

    if (user && includeDetails) {
      // Add user statistics
      const stats = await this.getUserStats(id);
      (user as any).stats = stats;
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await argon2.hash(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        role: createUserDto.role || UserRole.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await this.activityLogger.log({
      userId: user.id,
      type: 'USER_CREATED',
      description: 'User account created',
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedBy: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await this.activityLogger.log({
      userId: id,
      type: 'USER_UPDATED',
      description: 'User profile updated',
      metadata: { updatedBy, changes: updateUserDto },
    });

    return user;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { email: true, name: true },
    });

    await this.prisma.user.delete({
      where: { id },
    });

    await this.activityLogger.log({
      userId: id,
      type: 'USER_DELETED',
      description: 'User account deleted',
      metadata: { deletedBy, deletedUser: user },
    });
  }

  async updateStatus(id: string, isActive: boolean, updatedBy: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    await this.activityLogger.log({
      userId: id,
      type: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      description: `User account ${isActive ? 'activated' : 'deactivated'}`,
      metadata: { updatedBy },
    });

    return user;
  }

  async updateRole(id: string, role: UserRole, updatedBy: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    await this.activityLogger.log({
      userId: id,
      type: 'USER_ROLE_CHANGED',
      description: `User role changed to ${role}`,
      metadata: { updatedBy, newRole: role },
    });

    return user;
  }

  async getUserStats(userId: string) {
    const [postsStats, filesStats] = await Promise.all([
      this.prisma.post.aggregate({
        where: { authorId: userId },
        _count: { id: true },
      }),
      this.prisma.post.count({
        where: { authorId: userId, published: true },
      }),
      this.prisma.file.aggregate({
        where: { uploadedById: userId },
        _count: { id: true },
        _sum: { size: true },
      }),
    ]);

    return {
      totalPosts: postsStats._count.id,
      publishedPosts: filesStats,
      totalFiles: filesStats._count.id,
      totalFileSize: filesStats._sum.size || 0,
    };
  }

  async getSystemStats() {
    const [total, active, roleStats, recentRegistrations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      this.prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    const byRole = roleStats.reduce((acc, stat) => {
      acc[stat.role] = stat._count.id;
      return acc;
    }, {});

    // Group registrations by date
    const registrationTrend = recentRegistrations.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active,
      inactive: total - active,
      byRole,
      registrationTrend: Object.entries(registrationTrend).map(([date, count]) => ({
        date,
        count,
      })),
    };
  }
}
```

### 2. User Controller

```typescript
// users.controller.ts
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async findAll(@Query() query: GetUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async getStats() {
    return this.usersService.getSystemStats();
  }

  @Get(':id')
  @UseGuards(ResourceOwnershipGuard)
  async findOne(@Param('id') id: string, @GetUser() currentUser: User) {
    const includeDetails = currentUser.role === UserRole.ADMIN || currentUser.id === id;
    return this.usersService.findById(id, includeDetails);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @UseGuards(ResourceOwnershipGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.update(id, updateUserDto, currentUser.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async remove(@Param('id') id: string, @GetUser() currentUser: User) {
    await this.usersService.delete(id, currentUser.id);
    return { message: 'User deleted successfully' };
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateUserStatusDto,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.updateStatus(id, statusDto.isActive, currentUser.id);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async updateRole(
    @Param('id') id: string,
    @Body() roleDto: UpdateUserRoleDto,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.updateRole(id, roleDto.role, currentUser.id);
  }

  @Get(':id/activity')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async getUserActivity(@Param('id') id: string, @Query() query: GetActivityDto) {
    return this.activityService.getUserActivity(id, query);
  }
}
```

## 📱 Frontend User Management

### 1. User Management Dashboard

```jsx
// UserManagement.jsx
import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: '',
    isActive: '',
    search: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (response.ok) {
          fetchUsers(); // Refresh the list
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  return (
    <div className="user-management">
      <h1>User Management</h1>
      
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search users..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        
        <select
          value={filters.isActive}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Posts</th>
            <th>Files</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={user.isActive}
                    onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </td>
              <td>{user._count.posts}</td>
              <td>{user._count.files}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDeleteUser(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        {/* Pagination controls */}
      </div>
    </div>
  );
};

export default UserManagement;
```

### 2. User Profile Component

```jsx
// UserProfile.jsx
import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
        });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      
      <div className="profile-info">
        {editing ? (
          <div className="edit-form">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
            />
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </div>
        ) : (
          <div className="profile-display">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}</p>
            <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <button onClick={() => setEditing(true)}>Edit Profile</button>
          </div>
        )}
      </div>

      {/* User Statistics */}
      {user.stats && (
        <div className="user-stats">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{user.stats.totalPosts}</span>
              <span className="stat-label">Total Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.stats.publishedPosts}</span>
              <span className="stat-label">Published Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.stats.totalFiles}</span>
              <span className="stat-label">Total Files</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{(user.stats.totalFileSize / 1024 / 1024).toFixed(2)} MB</span>
              <span className="stat-label">Storage Used</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Posts */}
      {user.posts && user.posts.length > 0 && (
        <div className="recent-posts">
          <h3>Recent Posts</h3>
          <ul>
            {user.posts.map(post => (
              <li key={post.id}>
                <span>{post.title}</span>
                <span className={`status ${post.published ? 'published' : 'draft'}`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Files */}
      {user.files && user.files.length > 0 && (
        <div className="recent-files">
          <h3>Recent Files</h3>
          <ul>
            {user.files.map(file => (
              <li key={file.id}>
                <span>{file.originalName}</span>
                <span className="file-type">{file.type}</span>
                <span className={`status ${file.status.toLowerCase()}`}>
                  {file.status}
                </span>
                <span>{(file.size / 1024).toFixed(2)} KB</span>
                <span>{new Date(file.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
```

## 🔧 Bulk Operations

### 1. Bulk User Operations

```typescript
// bulk-operations.service.ts
@Injectable()
export class BulkOperationsService {
  constructor(
    private prisma: PrismaService,
    private activityLogger: ActivityLoggerService,
  ) {}

  async bulkUpdateStatus(userIds: string[], isActive: boolean, updatedBy: string) {
    const result = await this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { isActive },
    });

    // Log bulk operation
    await this.activityLogger.log({
      userId: updatedBy,
      type: 'BULK_USER_STATUS_UPDATE',
      description: `Bulk ${isActive ? 'activated' : 'deactivated'} ${result.count} users`,
      metadata: { userIds, isActive, count: result.count },
    });

    return result;
  }

  async bulkUpdateRole(userIds: string[], role: UserRole, updatedBy: string) {
    const result = await this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { role },
    });

    await this.activityLogger.log({
      userId: updatedBy,
      type: 'BULK_USER_ROLE_UPDATE',
      description: `Bulk updated ${result.count} users to ${role} role`,
      metadata: { userIds, role, count: result.count },
    });

    return result;
  }

  async bulkDelete(userIds: string[], deletedBy: string) {
    // Get user info before deletion
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true },
    });

    const result = await this.prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    await this.activityLogger.log({
      userId: deletedBy,
      type: 'BULK_USER_DELETE',
      description: `Bulk deleted ${result.count} users`,
      metadata: { deletedUsers: users, count: result.count },
    });

    return result;
  }

  async exportUsers(filters: GetUsersDto): Promise<Buffer> {
    const users = await this.prisma.user.findMany({
      where: this.buildWhereClause(filters),
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            files: true,
          },
        },
      },
    });

    // Convert to CSV
    const csv = this.convertToCSV(users);
    return Buffer.from(csv, 'utf-8');
  }

  private convertToCSV(users: any[]): string {
    const headers = ['ID', 'Email', 'Name', 'Role', 'Status', 'Posts', 'Files', 'Created'];
    const rows = users.map(user => [
      user.id,
      user.email,
      user.name || '',
      user.role,
      user.isActive ? 'Active' : 'Inactive',
      user._count.posts,
      user._count.files,
      user.createdAt.toISOString(),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
```

## 📊 User Analytics Dashboard

### 1. Analytics Service

```typescript
// user-analytics.service.ts
@Injectable()
export class UserAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getUserGrowthAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const registrations = await this.prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        role: true,
      },
    });

    // Group by date
    const growthData = registrations.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, USER: 0, ADMIN: 0 };
      }
      acc[date].total++;
      acc[date][user.role]++;
      return acc;
    }, {});

    return Object.entries(growthData).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  async getUserActivityAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [activeUsers, totalPosts, totalFiles] = await Promise.all([
      this.prisma.user.count({
        where: {
          OR: [
            { posts: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { files: { some: { createdAt: { gte: thirtyDaysAgo } } } },
          ],
        },
      }),
      this.prisma.post.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.file.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    return {
      activeUsers,
      totalPosts,
      totalFiles,
      period: '30 days',
    };
  }

  async getTopUsers(limit = 10) {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            posts: true,
            files: true,
          },
        },
      },
      orderBy: [
        { posts: { _count: 'desc' } },
        { files: { _count: 'desc' } },
      ],
      take: limit,
    });

    return users.map(user => ({
      ...user,
      totalActivity: user._count.posts + user._count.files,
    }));
  }
}
```

## 🔗 Related Guides

- [Authentication Guide](02-authentication-guide.md) - ระบบ authentication และ authorization
- [Security Guide](09-security-guide.md) - ความปลอดภัยในการจัดการผู้ใช้
- [API Testing Guide](06-api-testing-guide.md) - การทดสอบ user management APIs
- [Monitoring Guide](04-monitoring-guide.md) - การ monitor user activities