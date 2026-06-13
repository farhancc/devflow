const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read MONGODB_URI from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let mongodbUri = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MONGODB_URI=(.*)/);
  if (match && match[1]) {
    mongodbUri = match[1].trim();
  }
}

if (!mongodbUri) {
  console.error('Error: MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(mongodbUri);
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    console.log('Connected to database:', db.databaseName);

    // Get all users in the system to assign data to
    const usersCol = db.collection('users');
    const users = await usersCol.find({}).toArray();
    console.log(`Found ${users.length} users in the database.`);

    const manager = users.find(u => u.role === 'manager') || users[0];
    if (!manager) {
      console.error('No users found in database to seed data for!');
      process.exit(1);
    }
    const managerId = manager.id;
    console.log(`Using manager ID: ${managerId} (${manager.username})`);

    const designers = users.filter(u => u.id !== managerId);
    console.log(`Found ${designers.length} designers in the database.`);

    // Collections to clear
    const collections = ['clients', 'projects', 'payments', 'expenses', 'goals'];
    for (const name of collections) {
      const col = db.collection(name);
      const deleteResult = await col.deleteMany({});
      console.log(`Cleared ${deleteResult.deletedCount} documents from '${name}' collection.`);
    }

    const now = new Date();
    const currentYear = now.getFullYear();

    // 1. Seed Clients
    console.log('Seeding new clients...');
    const clientData = [
      { id: 'client-1', user_id: managerId, name: 'Sarah Connor', email: 'sarah@skynet.io', phone: '+1 (555) 123-4567', company: 'Skynet Solutions', created_at: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'client-2', user_id: managerId, name: 'Bruce Wayne', email: 'bruce@waynecorp.com', phone: '+1 (555) 999-1111', company: 'Wayne Enterprises', created_at: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'client-3', user_id: managerId, name: 'Tony Stark', email: 'tony@starkindustries.com', phone: '+1 (555) 300-3000', company: 'Stark Industries', created_at: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'client-4', user_id: managerId, name: 'Diana Prince', email: 'diana@themyscira.org', phone: '+1 (555) 777-7777', company: 'Themyscira Museum', created_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'client-5', user_id: managerId, name: 'Clark Kent', email: 'clark@dailyplanet.com', phone: '+1 (555) 444-4444', company: 'Daily Planet', created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    ];
    await db.collection('clients').insertMany(clientData);

    // 2. Seed Projects
    console.log('Seeding new projects...');
    const projectData = [
      {
        id: 'proj-1',
        user_id: managerId,
        assigned_to: designers[0] ? designers[0].id : managerId,
        title: 'Mobile App Redesign',
        description: 'Complete overhaul of the mobile onboarding, dashboard, and billing flows. Building a unified Design System.',
        status: 'in_progress',
        deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client_id: 'client-2',
        category: 'ui_ux',
        amount: 8500,
        preview_images: [],
        slug: 'mobile-app-redesign',
        is_featured: true,
        created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'proj-2',
        user_id: managerId,
        assigned_to: designers[1] ? designers[1].id : managerId,
        title: 'E-commerce Website Design',
        description: 'High-converting design for a premium sustainable clothing startup. Built with responsive layout.',
        status: 'revision',
        deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client_id: 'client-3',
        category: 'branding',
        amount: 6200,
        preview_images: [],
        slug: 'ecommerce-clothing',
        is_featured: true,
        created_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'proj-3',
        user_id: managerId,
        assigned_to: designers[0] ? designers[0].id : managerId,
        title: 'Skynet Logo & Identity',
        description: 'Brand identity, visual guidelines, typography selection, and color palette creation.',
        status: 'completed',
        deadline: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed_date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client_id: 'client-1',
        category: 'logo',
        amount: 4500,
        preview_images: [],
        slug: 'skynet-identity',
        is_featured: false,
        created_at: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'proj-4',
        user_id: managerId,
        assigned_to: managerId,
        title: 'Museum Exhibition Branding',
        description: 'Marketing posters, banners, interactive kiosks layouts, and social media templates for the Greek Antiquities exhibition.',
        status: 'completed',
        deadline: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed_date: new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client_id: 'client-4',
        category: 'branding',
        amount: 7500,
        preview_images: [],
        slug: 'exhibition-branding',
        is_featured: true,
        created_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'proj-5',
        user_id: managerId,
        assigned_to: designers[0] ? designers[0].id : managerId,
        title: 'Daily Planet Web Portal',
        description: 'Responsive news feed and article layout design optimized for readability and ad placements.',
        status: 'waiting_payment',
        deadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client_id: 'client-5',
        category: 'ui_ux',
        amount: 9500,
        preview_images: [],
        slug: 'daily-planet-portal',
        is_featured: false,
        created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'proj-6',
        user_id: managerId,
        assigned_to: designers[1] ? designers[1].id : managerId,
        title: 'Social Media Banner Kit',
        description: 'Dozens of reusable social media template designs for Instagram, Facebook, and Twitter marketing campaigns.',
        status: 'completed',
        deadline: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed_date: new Date(now.getTime() - 48 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client_id: 'client-3',
        category: 'social_media',
        amount: 3200,
        preview_images: [],
        slug: 'banner-kit',
        is_featured: false,
        created_at: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'proj-7',
        user_id: managerId,
        assigned_to: managerId,
        title: 'Wayne Enterprises Investor Deck',
        description: 'High-impact investor keynote presentation design with interactive charts and custom illustrations.',
        status: 'inquiry',
        deadline: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client_id: 'client-2',
        category: 'custom',
        amount: 5000,
        preview_images: [],
        slug: 'investor-deck',
        is_featured: false,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    await db.collection('projects').insertMany(projectData);

    // 3. Seed Payments (spread across the last 6 months for beautiful trends)
    console.log('Seeding new payments...');
    const paymentData = [];
    const getPastDateStr = (daysAgo) => {
      return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    };

    // Project 3 payments
    paymentData.push({ id: 'pay-1', user_id: managerId, employee_id: designers[0] ? designers[0].id : managerId, amount: 2250, payment_date: getPastDateStr(38), project_id: 'proj-3', client_id: 'client-1', status: 'paid', notes: 'Logo deposit (50%)', created_at: getPastDateStr(38) });
    paymentData.push({ id: 'pay-2', user_id: managerId, employee_id: designers[0] ? designers[0].id : managerId, amount: 2250, payment_date: getPastDateStr(12), project_id: 'proj-3', client_id: 'client-1', status: 'paid', notes: 'Logo final payment (50%)', created_at: getPastDateStr(12) });

    // Project 1 payments
    paymentData.push({ id: 'pay-3', user_id: managerId, employee_id: designers[0] ? designers[0].id : managerId, amount: 4000, payment_date: getPastDateStr(14), project_id: 'proj-1', client_id: 'client-2', status: 'paid', notes: 'App redesign advance payment', created_at: getPastDateStr(14) });

    // Project 2 payments
    paymentData.push({ id: 'pay-4', user_id: managerId, employee_id: designers[1] ? designers[1].id : managerId, amount: 3000, payment_date: getPastDateStr(24), project_id: 'proj-2', client_id: 'client-3', status: 'paid', notes: 'E-commerce website advance payment', created_at: getPastDateStr(24) });

    // Project 4 payments
    paymentData.push({ id: 'pay-5', user_id: managerId, employee_id: managerId, amount: 3750, payment_date: getPastDateStr(58), project_id: 'proj-4', client_id: 'client-4', status: 'paid', notes: 'Exhibition design advance', created_at: getPastDateStr(58) });
    paymentData.push({ id: 'pay-6', user_id: managerId, employee_id: managerId, amount: 3750, payment_date: getPastDateStr(24), project_id: 'proj-4', client_id: 'client-4', status: 'paid', notes: 'Exhibition design final', created_at: getPastDateStr(24) });

    // Project 5 payments
    paymentData.push({ id: 'pay-7', user_id: managerId, employee_id: designers[0] ? designers[0].id : managerId, amount: 4750, payment_date: getPastDateStr(29), project_id: 'proj-5', client_id: 'client-5', status: 'paid', notes: 'Web portal advance', created_at: getPastDateStr(29) });

    // Project 6 payments
    paymentData.push({ id: 'pay-8', user_id: managerId, employee_id: designers[1] ? designers[1].id : managerId, amount: 3200, payment_date: getPastDateStr(48), project_id: 'proj-6', client_id: 'client-3', status: 'paid', notes: 'Banner kit full payment', created_at: getPastDateStr(48) });

    // Add some random historical payments (milestones from older projects that are closed)
    paymentData.push({ id: 'pay-hist-1', user_id: managerId, employee_id: designers[0] ? designers[0].id : managerId, amount: 5000, payment_date: getPastDateStr(140), project_id: 'old-proj-1', client_id: 'client-1', status: 'paid', notes: 'Legacy UI Work', created_at: getPastDateStr(140) });
    paymentData.push({ id: 'pay-hist-2', user_id: managerId, employee_id: designers[1] ? designers[1].id : managerId, amount: 6200, payment_date: getPastDateStr(115), project_id: 'old-proj-2', client_id: 'client-2', status: 'paid', notes: 'Legacy Brand Design', created_at: getPastDateStr(115) });
    paymentData.push({ id: 'pay-hist-3', user_id: managerId, employee_id: managerId, amount: 4500, payment_date: getPastDateStr(88), project_id: 'old-proj-3', client_id: 'client-3', status: 'paid', notes: 'Web Design Phase 1', created_at: getPastDateStr(88) });
    paymentData.push({ id: 'pay-hist-4', user_id: managerId, employee_id: designers[0] ? designers[0].id : managerId, amount: 3500, payment_date: getPastDateStr(72), project_id: 'old-proj-4', client_id: 'client-4', status: 'paid', notes: 'Poster Design', created_at: getPastDateStr(72) });

    await db.collection('payments').insertMany(paymentData);

    // 4. Seed Expenses (spread across the last 6 months)
    console.log('Seeding new expenses...');
    const expenseData = [
      { id: 'exp-1', user_id: managerId, employee_id: managerId, amount: 290, expense_date: getPastDateStr(145), category: 'Software Subscriptions', description: 'Figma Annual Subscription', created_at: getPastDateStr(145) },
      { id: 'exp-2', user_id: managerId, employee_id: managerId, amount: 120, expense_date: getPastDateStr(138), category: 'Web Hosting', description: 'Vercel Team Plan Hosting', created_at: getPastDateStr(138) },
      { id: 'exp-3', user_id: managerId, employee_id: designers[0] ? designers[0].id : managerId, amount: 450, expense_date: getPastDateStr(110), category: 'Equipment & Hardware', description: 'Wacom Tablet for Designer', created_at: getPastDateStr(110) },
      { id: 'exp-4', user_id: managerId, employee_id: managerId, amount: 80, expense_date: getPastDateStr(108), category: 'Office Supplies', description: 'Notebooks and design stationary', created_at: getPastDateStr(108) },
      { id: 'exp-5', user_id: managerId, employee_id: managerId, amount: 120, expense_date: getPastDateStr(105), category: 'Web Hosting', description: 'Vercel Team Plan Hosting', created_at: getPastDateStr(105) },
      { id: 'exp-6', user_id: managerId, employee_id: designers[1] ? designers[1].id : managerId, amount: 600, expense_date: getPastDateStr(85), category: 'Professional Services', description: 'Custom Font Family Licensing', created_at: getPastDateStr(85) },
      { id: 'exp-7', user_id: managerId, employee_id: managerId, amount: 120, expense_date: getPastDateStr(75), category: 'Web Hosting', description: 'Vercel Team Plan Hosting', created_at: getPastDateStr(75) },
      { id: 'exp-8', user_id: managerId, employee_id: managerId, amount: 1500, expense_date: getPastDateStr(45), category: 'Marketing & Ads', description: 'Google Ads Search Campaign', created_at: getPastDateStr(45) },
      { id: 'exp-9', user_id: managerId, employee_id: managerId, amount: 120, expense_date: getPastDateStr(40), category: 'Web Hosting', description: 'Vercel Team Plan Hosting', created_at: getPastDateStr(40) },
      { id: 'exp-10', user_id: managerId, employee_id: managerId, amount: 350, expense_date: getPastDateStr(15), category: 'Travel & Events', description: 'Design Conference Tickets', created_at: getPastDateStr(15) },
      { id: 'exp-11', user_id: managerId, employee_id: managerId, amount: 120, expense_date: getPastDateStr(8), category: 'Web Hosting', description: 'Vercel Team Plan Hosting', created_at: getPastDateStr(8) },
    ];
    await db.collection('expenses').insertMany(expenseData);

    // 5. Seed Goals
    console.log('Seeding new goals...');
    const goalData = [];
    // Last 6 months goals
    for (let i = 5; i >= 0; i--) {
      const gDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      goalData.push({
        id: `goal-inc-${i}`,
        user_id: managerId,
        target_value: 10000 + (Math.floor(Math.random() * 5) * 1000),
        target_type: 'income',
        month: gDate.getMonth() + 1,
        year: gDate.getFullYear(),
        created_at: gDate.toISOString()
      });
      goalData.push({
        id: `goal-exp-${i}`,
        user_id: managerId,
        target_value: 1500 + (Math.floor(Math.random() * 3) * 200),
        target_type: 'expenses',
        month: gDate.getMonth() + 1,
        year: gDate.getFullYear(),
        created_at: gDate.toISOString()
      });
    }
    await db.collection('goals').insertMany(goalData);

    console.log('Successfully completed database re-seeding!');
  } catch (err) {
    console.error('An error occurred during database seeding:', err);
  } finally {
    await client.close();
  }
}

run();
