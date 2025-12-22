/**
 * Utility script to manage admin roles for users
 * Usage: 
 *   Set admin: node scripts/setAdminRole.js <email>
 *   Set super admin: node scripts/setAdminRole.js <email> super
 *   List admins: node scripts/setAdminRole.js list
 * Examples: 
 *   node scripts/setAdminRole.js admin@example.com
 *   node scripts/setAdminRole.js superadmin@example.com super
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setAdminRole(email, roleType = 'admin') {
    try {
        const targetRole = roleType === 'super' ? 'super_admin' : 'admin';
        
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) {
            console.error(`❌ User with email "${email}" not found.`);
            return;
        }

        if (user.role === targetRole) {
            const roleLabel = targetRole === 'super_admin' ? 'super admin' : 'admin';
            console.log(`✅ User "${user.name || user.email}" is already a ${roleLabel}.`);
            return;
        }

        // Special warning for super admin assignment
        if (targetRole === 'super_admin') {
            console.log('⚠️  WARNING: You are about to assign SUPER ADMIN role!');
            console.log('   Super admins can manage other admins and have full system access.');
            console.log('   Make sure this is intended.');
            
            // Check if there are existing super admins
            const existingSuperAdmins = await prisma.user.count({
                where: { role: 'super_admin' }
            });
            
            if (existingSuperAdmins > 0) {
                console.log(`   Note: There are already ${existingSuperAdmins} super admin(s) in the system.`);
            }
        }

        // Update user role
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: targetRole },
            select: { id: true, name: true, email: true, role: true }
        });

        const roleLabel = targetRole === 'super_admin' ? 'Super Admin' : 'Admin';
        console.log(`✅ ${roleLabel} role successfully assigned!`);
        console.log('User details:');
        console.log(`  - ID: ${updatedUser.id}`);
        console.log(`  - Name: ${updatedUser.name || 'N/A'}`);
        console.log(`  - Email: ${updatedUser.email}`);
        console.log(`  - Role: ${updatedUser.role}`);

        if (targetRole === 'super_admin') {
            console.log('\n🎯 Next steps:');
            console.log('   1. The user can now access the admin dashboard');
            console.log('   2. They can promote/demote other users to/from admin role');
            console.log('   3. They have access to all admin features');
        }

    } catch (error) {
        console.error('❌ Error setting admin role:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

async function listAdmins() {
    try {
        const admins = await prisma.user.findMany({
            where: { 
                OR: [
                    { role: 'admin' },
                    { role: 'super_admin' }
                ]
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: [
                { role: 'desc' }, // super_admin first
                { createdAt: 'desc' }
            ]
        });

        if (admins.length === 0) {
            console.log('📋 No admin users found.');
            return;
        }

        const superAdmins = admins.filter(admin => admin.role === 'super_admin');
        const regularAdmins = admins.filter(admin => admin.role === 'admin');

        console.log(`📋 Found ${admins.length} admin user(s):`);
        
        if (superAdmins.length > 0) {
            console.log(`\n👑 Super Admins (${superAdmins.length}):`);
            superAdmins.forEach((admin, index) => {
                console.log(`\n${index + 1}. ${admin.name || 'N/A'} 👑`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   ID: ${admin.id}`);
                console.log(`   Role: Super Admin`);
                console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
            });
        }

        if (regularAdmins.length > 0) {
            console.log(`\n🔧 Regular Admins (${regularAdmins.length}):`);
            regularAdmins.forEach((admin, index) => {
                console.log(`\n${index + 1}. ${admin.name || 'N/A'}`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   ID: ${admin.id}`);
                console.log(`   Role: Admin`);
                console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
            });
        }

        console.log('\n📊 Summary:');
        console.log(`   - Super Admins: ${superAdmins.length}`);
        console.log(`   - Regular Admins: ${regularAdmins.length}`);
        console.log(`   - Total Admins: ${admins.length}`);

    } catch (error) {
        console.error('❌ Error listing admins:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// // Get command line arguments
// const args = process.argv.slice(2);
// console.log("args", process);
// const command = args[0];
// console.log("command", command);
// const roleType = args[1];
// console.log("roleType", roleType);

// if (command === 'list') {
//     listAdmins();
// } else if (command && command.includes('@')) {
//     // If argument contains @, treat it as email
//     setAdminRole(command, roleType);
// }
