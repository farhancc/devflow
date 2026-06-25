import clientPromise from '@/lib/mongodb';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  company: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  assigned_to?: string | null;  // employee user_id this project is assigned to
  title: string;
  description: string;
  status: 'inquiry' | 'in_progress' | 'revision' | 'waiting_payment' | 'completed' | 'cancelled';
  deadline: string;
  client_id: string;
  completed_date?: string;
  category: string;
  amount: number;
  preview_images: string[];
  slug: string;
  is_featured: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  project_id: string;
  client_id: string;
  status: 'pending' | 'paid';
  notes: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  expense_date: string;
  category: string;
  description: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  target_value: number;
  target_type: 'income' | 'projects' | 'expenses';
  month: number;
  year: number;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  tagline: string;
  bio: string;
  years_experience: number;
  email: string;
  phone: string;
  whatsapp: string;
  social_links: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    behance?: string;
    dribbble?: string;
  };
}

async function getDb() {
  const client = await clientPromise;
  return client.db();
}

// Seed helper for a new user ID in MongoDB
export async function seedUserData(userId: string, fullName: string) {
  const db = await getDb();
  
  const clientsCol = db.collection<Client>('clients');
  const projectsCol = db.collection<Project>('projects');
  const goalsCol = db.collection<Goal>('goals');
  const paymentsCol = db.collection<Payment>('payments');
  const expensesCol = db.collection<Expense>('expenses');
  const profilesCol = db.collection<Profile>('profiles');

  // Check if seeded already
  const hasClients = await clientsCol.findOne({ user_id: userId });
  const hasProjects = await projectsCol.findOne({ user_id: userId });

  if (hasClients || hasProjects) {
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Add Profile
  const profileExists = await profilesCol.findOne({ id: userId });
  if (!profileExists) {
    await profilesCol.insertOne({
      id: userId,
      full_name: fullName,
      tagline: 'Senior UI/UX Designer & Brand Strategist',
      bio: 'Crafting premium digital experiences for forward-thinking startups and brands. Specializing in design systems, Webflow, and product strategy.',
      years_experience: 6,
      email: `${userId.replace('user-', '')}@designflow.com`,
      phone: '+1 (555) 234-5678',
      whatsapp: '+1 (555) 234-5678',
      social_links: {
        instagram: 'https://instagram.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        behance: 'https://behance.net',
        dribbble: 'https://dribbble.com',
      }
    });
  }

  // Seed Clients
  const client1Id = `client-${Math.random().toString(36).substring(2, 9)}`;
  const client2Id = `client-${Math.random().toString(36).substring(2, 9)}`;
  const client3Id = `client-${Math.random().toString(36).substring(2, 9)}`;

  await clientsCol.insertMany([
    {
      id: client1Id,
      user_id: userId,
      name: 'Sarah Connor',
      email: 'sarah@skynet.io',
      phone: '+1 (555) 123-4567',
      company: 'Skynet Solutions',
      created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: client2Id,
      user_id: userId,
      name: 'Bruce Wayne',
      email: 'bruce@waynecorp.com',
      phone: '+1 (555) 999-1111',
      company: 'Wayne Enterprises',
      created_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: client3Id,
      user_id: userId,
      name: 'Tony Stark',
      email: 'tony@starkindustries.com',
      phone: '+1 (555) 300-3000',
      company: 'Stark Industries',
      created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ]);

  // Seed Projects
  const project1Id = `proj-${Math.random().toString(36).substring(2, 9)}`;
  const project2Id = `proj-${Math.random().toString(36).substring(2, 9)}`;
  const project3Id = `proj-${Math.random().toString(36).substring(2, 9)}`;

  const deadline1 = new Date();
  deadline1.setDate(deadline1.getDate() + 4); // 4 days from now

  const deadline2 = new Date();
  deadline2.setDate(deadline2.getDate() + 18); // 18 days from now

  await projectsCol.insertMany([
    {
      id: project1Id,
      user_id: userId,
      title: 'Mobile App Redesign',
      description: 'Complete overhaul of the mobile onboarding, dashboard, and billing flows. Building a unified Design System.',
      status: 'in_progress',
      deadline: deadline1.toISOString().split('T')[0],
      client_id: client2Id,
      category: 'UI/UX Design',
      amount: 6500,
      preview_images: [],
      slug: 'mobile-app-redesign',
      is_featured: true,
      created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: project2Id,
      user_id: userId,
      title: 'E-commerce Website Design',
      description: 'High-converting design for a premium sustainable clothing startup. Built with responsive layout.',
      status: 'revision',
      deadline: deadline2.toISOString().split('T')[0],
      client_id: client3Id,
      category: 'Web Design',
      amount: 4800,
      preview_images: [],
      slug: 'ecommerce-clothing',
      is_featured: true,
      created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: project3Id,
      user_id: userId,
      title: 'Skynet Logo & Identity',
      description: 'Brand identity, visual guidelines, typography selection, and color palette creation.',
      status: 'completed',
      deadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client_id: client1Id,
      category: 'Branding',
      amount: 3500,
      preview_images: [],
      slug: 'skynet-identity',
      is_featured: false,
      created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ]);

  // Seed Goals
  await goalsCol.insertOne({
    id: `goal-${Math.random().toString(36).substring(2, 9)}`,
    user_id: userId,
    target_value: 8000,
    target_type: 'income',
    month,
    year,
    created_at: now.toISOString(),
  });

  // Seed Payments
  await paymentsCol.insertMany([
    {
      id: `pay-${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      amount: 3500,
      payment_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      project_id: project3Id,
      client_id: client1Id,
      status: 'paid',
      notes: 'Initial milestone payment (50%)',
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `pay-${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      amount: 1500,
      payment_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      project_id: project1Id,
      client_id: client2Id,
      status: 'paid',
      notes: 'Setup deposit',
      created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ]);

  // Seed Expenses
  await expensesCol.insertMany([
    {
      id: `exp-${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      amount: 290,
      expense_date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Software Subscriptions',
      description: 'Figma Organization license annual renewal portion',
      created_at: new Date().toISOString(),
    },
    {
      id: `exp-${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      amount: 120,
      expense_date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Web Hosting',
      description: 'Vercel Team plan & domain renewals',
      created_at: new Date().toISOString(),
    }
  ]);
}

function serialize<T>(data: any): T {
  return JSON.parse(JSON.stringify(data))
}

async function getUserRole(userId: string): Promise<'manager' | 'designer'> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ id: userId }) as any;
  return user?.role || 'designer';
}

// DB Selects
export async function getLocalClients(userId: string, role?: 'manager' | 'designer'): Promise<Client[]> {
  const db = await getDb();
  const actualRole = role || await getUserRole(userId);
  const query = actualRole === 'manager' ? {} : { user_id: userId };
  const res = await db.collection<Client>('clients').find(query).toArray();
  return serialize(res);
}

export async function getLocalProjects(userId: string, role?: 'manager' | 'designer'): Promise<Project[]> {
  const db = await getDb();
  const actualRole = role || await getUserRole(userId);
  const query = actualRole === 'manager' 
    ? {} 
    : { $or: [{ user_id: userId }, { assigned_to: userId }] };
  const res = await db.collection<Project>('projects').find(query).toArray();
  return serialize(res);
}

export async function getLocalPayments(userId: string, role?: 'manager' | 'designer'): Promise<Payment[]> {
  const db = await getDb();
  const actualRole = role || await getUserRole(userId);
  const query = actualRole === 'manager' 
    ? {} 
    : { $or: [{ user_id: userId }, { employee_id: userId }] };
  const res = await db.collection<Payment>('payments').find(query).toArray();
  return serialize(res);
}

export async function getLocalExpenses(userId: string, role?: 'manager' | 'designer'): Promise<Expense[]> {
  const db = await getDb();
  const actualRole = role || await getUserRole(userId);
  const query = actualRole === 'manager' 
    ? {} 
    : { $or: [{ user_id: userId }, { employee_id: userId }] };
  const res = await db.collection<Expense>('expenses').find(query).toArray();
  return serialize(res);
}

export async function getLocalGoals(userId: string, role?: 'manager' | 'designer'): Promise<Goal[]> {
  const db = await getDb();
  const actualRole = role || await getUserRole(userId);
  
  let query = {};
  if (actualRole !== 'manager') {
    const managers = await db.collection('users').find({ role: 'manager' }).toArray();
    const managerIds = managers.map((m: any) => m.id);
    query = { user_id: { $in: [userId, ...managerIds] } };
  } else {
    query = { user_id: userId };
  }

  const res = await db.collection<Goal>('goals').find(query).toArray();
  return serialize(res);
}

export async function getLocalProfile(userId: string): Promise<Profile | null> {
  const db = await getDb();
  const res = await db.collection<Profile>('profiles').findOne({ id: userId });
  return serialize(res);
}

// Compatibility layer for settings profile update Server Actions
export async function readDb(): Promise<any> {
  const db = await getDb();
  const clients = (await db.collection<Client>('clients').find({}).toArray()) as any[];
  const projects = (await db.collection<Project>('projects').find({}).toArray()) as any[];
  const payments = (await db.collection<Payment>('payments').find({}).toArray()) as any[];
  const expenses = (await db.collection<Expense>('expenses').find({}).toArray()) as any[];
  const goals = (await db.collection<Goal>('goals').find({}).toArray()) as any[];
  const profiles = (await db.collection<Profile>('profiles').find({}).toArray()) as any[];

  return serialize({ clients, projects, payments, expenses, goals, profiles });
}

export async function writeDb(data: any) {
  const db = await getDb();
  if (data.profiles) {
    for (const profile of data.profiles) {
      // Clean Mongo properties if existing
      const { _id, ...profileData } = profile as any;
      await db.collection<Profile>('profiles').updateOne(
        { id: profile.id },
        { $set: profileData },
        { upsert: true }
      );
    }
  }
}
