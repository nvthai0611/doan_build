const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRoles() {
  console.log('🔄 Updating user roles...');

  try {
    // Get all roles
    const roles = await prisma.role.findMany();
    console.log('Available roles:', roles.map(r => ({ name: r.name, id: r.id })));

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, roleId: true }
    });

    console.log(`Found ${users.length} users to update`);

    for (const user of users) {
      console.log(`\nUpdating user: ${user.email} (current role: ${user.role})`);
      
      // Find matching role
      const matchingRole = roles.find(r => r.name === user.role);
      
      if (matchingRole) {
        // Update user with roleId
        await prisma.user.update({
          where: { id: user.id },
          data: { roleId: matchingRole.id }
        });
        console.log(`✅ Updated ${user.email} with roleId: ${matchingRole.id}`);
      } else {
        console.log(`❌ No matching role found for: ${user.role}`);
      }
    }

    // Verify updates
    const updatedUsers = await prisma.user.findMany({
      where: { roleId: { not: null } },
      include: { roleData: true }
    });

    console.log(`\n✅ Successfully updated ${updatedUsers.length} users with roleId`);
    
    // Show sample
    for (const user of updatedUsers.slice(0, 3)) {
      console.log(`- ${user.email}: ${user.role} -> ${user.roleData?.displayName}`);
    }

  } catch (error) {
    console.error('❌ Error updating user roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  updateUserRoles()
    .then(() => {
      console.log('✅ User role update completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ User role update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateUserRoles };
