const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function seedRoles() {
    console.log('🌱 Bắt đầu seed roles...');
    try {
        const roles = [
            {
                name: 'parent',
                displayName: 'Phụ huynh',
                description: 'Quyền hạn của phụ huynh trong hệ thống',
                isActive: true,
            },
            {
                name: 'teacher',
                displayName: 'Giáo viên',
                description: 'Quyền hạn của giáo viên trong hệ thống',
                isActive: true,
            },
            {
                name: 'center_owner',
                displayName: 'Chủ trung tâm',
                description: 'Có toàn quyền quản lý trung tâm giáo dục',
                isActive: true,
            },
            {
                name: 'student',
                displayName: 'Học sinh',
                description: 'Quyền hạn của học sinh trong hệ thống',
                isActive: true,
            },
        ];
        const createdRoles = [];
        for (const roleData of roles) {
            const role = await prisma.role.upsert({
                where: { name: roleData.name },
                update: {
                    displayName: roleData.displayName,
                    description: roleData.description,
                    isActive: roleData.isActive,
                },
                create: roleData,
            });
            createdRoles.push(role);
            console.log(`✅ Created/Updated role: ${role.displayName} (${role.name})`);
        }
        console.log(`\n✅ Hoàn tất seed ${createdRoles.length} roles!`);
        console.log('\n📋 Danh sách roles đã tạo:');
        createdRoles.forEach((role) => {
            console.log(`   - ${role.displayName} (${role.name})`);
        });
        return createdRoles;
    }
    catch (error) {
        console.error('❌ Lỗi khi seed roles:', error);
        throw error;
    }
}
async function main() {
    try {
        await seedRoles();
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=seed-role.js.map