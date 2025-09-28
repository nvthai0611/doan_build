const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPermissions() {
  console.log('🌱 Seeding permissions...');

  try {
    // Create roles
    const roles = [
      {
        name: 'center_owner',
        displayName: 'Chủ trung tâm',
        description: 'Có toàn quyền quản lý trung tâm',
        isActive: true
      },
      {
        name: 'teacher',
        displayName: 'Giáo viên',
        description: 'Quyền hạn của giáo viên',
        isActive: true
      },
      {
        name: 'admin',
        displayName: 'Quản trị viên',
        description: 'Quyền hạn quản trị hệ thống',
        isActive: true
      },
      {
        name: 'student',
        displayName: 'Học sinh',
        description: 'Quyền hạn của học sinh',
        isActive: true
      },
      {
        name: 'parent',
        displayName: 'Phụ huynh',
        description: 'Quyền hạn của phụ huynh',
        isActive: true
      }
    ];

    const createdRoles = {};
    for (const roleData of roles) {
      const role = await prisma.role.upsert({
        where: { name: roleData.name },
        update: roleData,
        create: roleData
      });
      createdRoles[role.name] = role;
      console.log(`✅ Created role: ${role.displayName}`);
    }

    // Create permissions
    const permissions = [
      // Student management
      { name: 'students.view', displayName: 'Xem học sinh', module: 'students', action: 'view' },
      { name: 'students.create', displayName: 'Tạo học sinh', module: 'students', action: 'create' },
      { name: 'students.edit', displayName: 'Sửa học sinh', module: 'students', action: 'edit' },
      { name: 'students.delete', displayName: 'Xóa học sinh', module: 'students', action: 'delete' },
      { name: 'students.enrollment', displayName: 'Quản lý đăng ký', module: 'students', action: 'enrollment' },
      { name: 'students.attendance', displayName: 'Quản lý điểm danh', module: 'students', action: 'attendance' },

      // Teacher management
      { name: 'teachers.view', displayName: 'Xem giáo viên', module: 'teachers', action: 'view' },
      { name: 'teachers.create', displayName: 'Tạo giáo viên', module: 'teachers', action: 'create' },
      { name: 'teachers.edit', displayName: 'Sửa giáo viên', module: 'teachers', action: 'edit' },
      { name: 'teachers.delete', displayName: 'Xóa giáo viên', module: 'teachers', action: 'delete' },
      { name: 'teachers.assign', displayName: 'Phân công giáo viên', module: 'teachers', action: 'assign' },

      // Course management
      { name: 'courses.view', displayName: 'Xem khóa học', module: 'courses', action: 'view' },
      { name: 'courses.create', displayName: 'Tạo khóa học', module: 'courses', action: 'create' },
      { name: 'courses.edit', displayName: 'Sửa khóa học', module: 'courses', action: 'edit' },
      { name: 'courses.delete', displayName: 'Xóa khóa học', module: 'courses', action: 'delete' },
      { name: 'courses.assign', displayName: 'Phân công khóa học', module: 'courses', action: 'assign' },

      // Schedule management
      { name: 'schedule.view', displayName: 'Xem lịch học', module: 'schedule', action: 'view' },
      { name: 'schedule.create', displayName: 'Tạo lịch học', module: 'schedule', action: 'create' },
      { name: 'schedule.edit', displayName: 'Sửa lịch học', module: 'schedule', action: 'edit' },
      { name: 'schedule.delete', displayName: 'Xóa lịch học', module: 'schedule', action: 'delete' },

      // Financial management
      { name: 'finance.view', displayName: 'Xem tài chính', module: 'finance', action: 'view' },
      { name: 'finance.create', displayName: 'Tạo tài chính', module: 'finance', action: 'create' },
      { name: 'finance.edit', displayName: 'Sửa tài chính', module: 'finance', action: 'edit' },
      { name: 'finance.delete', displayName: 'Xóa tài chính', module: 'finance', action: 'delete' },
      { name: 'finance.reports', displayName: 'Báo cáo tài chính', module: 'finance', action: 'reports' },

      // Reports and analytics
      { name: 'reports.view', displayName: 'Xem báo cáo', module: 'reports', action: 'view' },
      { name: 'reports.export', displayName: 'Xuất báo cáo', module: 'reports', action: 'export' },
      { name: 'reports.advanced', displayName: 'Báo cáo nâng cao', module: 'reports', action: 'advanced' },

      // System settings
      { name: 'settings.view', displayName: 'Xem cài đặt', module: 'settings', action: 'view' },
      { name: 'settings.edit', displayName: 'Sửa cài đặt', module: 'settings', action: 'edit' },
      { name: 'settings.system', displayName: 'Cài đặt hệ thống', module: 'settings', action: 'system' },

      // User management
      { name: 'users.view', displayName: 'Xem người dùng', module: 'users', action: 'view' },
      { name: 'users.create', displayName: 'Tạo người dùng', module: 'users', action: 'create' },
      { name: 'users.edit', displayName: 'Sửa người dùng', module: 'users', action: 'edit' },
      { name: 'users.delete', displayName: 'Xóa người dùng', module: 'users', action: 'delete' }
    ];

    const createdPermissions = {};
    for (const permData of permissions) {
      const permission = await prisma.permission.upsert({
        where: { name: permData.name },
        update: permData,
        create: permData
      });
      createdPermissions[permission.name] = permission;
      console.log(`✅ Created permission: ${permission.displayName}`);
    }

    // Assign permissions to roles
    const rolePermissions = {
      center_owner: [
        'students.view', 'students.create', 'students.edit', 'students.delete', 'students.enrollment', 'students.attendance',
        'teachers.view', 'teachers.create', 'teachers.edit', 'teachers.delete', 'teachers.assign',
        'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.assign',
        'schedule.view', 'schedule.create', 'schedule.edit', 'schedule.delete',
        'finance.view', 'finance.create', 'finance.edit', 'finance.delete', 'finance.reports',
        'reports.view', 'reports.export', 'reports.advanced',
        'settings.view', 'settings.edit', 'settings.system',
        'users.view', 'users.create', 'users.edit', 'users.delete'
      ],
      teacher: [
        'students.view', 'students.attendance',
        'courses.view',
        'schedule.view',
        'reports.view',
        'settings.view'
      ],
      admin: [
        'students.view', 'students.create', 'students.edit', 'students.delete', 'students.enrollment', 'students.attendance',
        'teachers.view', 'teachers.create', 'teachers.edit', 'teachers.delete', 'teachers.assign',
        'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.assign',
        'schedule.view', 'schedule.create', 'schedule.edit', 'schedule.delete',
        'finance.view', 'finance.reports',
        'reports.view', 'reports.export', 'reports.advanced',
        'settings.view', 'settings.edit', 'settings.system',
        'users.view', 'users.create', 'users.edit', 'users.delete'
      ],
      student: [
        'schedule.view',
        'reports.view'
      ],
      parent: [
        'students.view',
        'schedule.view',
        'reports.view'
      ]
    };

    // Clear existing role permissions
    await prisma.rolePermission.deleteMany({});

    // Create role permissions
    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const role = createdRoles[roleName];
      if (!role) continue;

      for (const permissionName of permissionNames) {
        const permission = createdPermissions[permissionName];
        if (!permission) continue;

        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id
          }
        });
      }
      console.log(`✅ Assigned ${permissionNames.length} permissions to ${role.displayName}`);
    }

    console.log('🎉 Permission seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  seedPermissions()
    .then(() => {
      console.log('✅ Seeder completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeder failed:', error);
      process.exit(1);
    });
}

module.exports = { seedPermissions };
