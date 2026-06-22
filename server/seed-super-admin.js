const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./app/models/User');


dotenv.config({ path: path.join(__dirname, '.env') });

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        
        const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'subhradeepnath2.o@gmail.com';
        const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';

        const adminData = {
            name: 'StoreSync Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'super_admin',
            isActive: true,
            isVerified: true
        };

        
        await User.deleteOne({ role: 'super_admin' });
        await User.create(adminData);

        console.log('Super Admin created/updated successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed Super Admin:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
