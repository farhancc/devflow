import clientPromise from '@/lib/mongodb';
import fs from 'fs/promises';
import path from 'path';

export interface UserRecord {
  id: string;
  username: string;
  passwordHash: string;
  role: 'manager' | 'designer';
  fullName: string;
  createdAt: string;
  phone?: string;
  email?: string;
  address?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function syncUsersJson(collection: any) {
  try {
    const users = await collection.find({}).toArray();
    const usersDbPath = path.join(process.cwd(), 'data', 'users.json');
    // Ensure data directory exists
    await fs.mkdir(path.dirname(usersDbPath), { recursive: true });
    await fs.writeFile(
      usersDbPath, 
      JSON.stringify(users.map((u: any) => ({
        id: u.id,
        username: u.username,
        passwordHash: u.passwordHash,
        role: u.role,
        fullName: u.fullName,
        createdAt: u.createdAt,
        phone: u.phone || '',
        email: u.email || '',
        address: u.address || ''
      })), null, 2), 
      'utf-8'
    );
  } catch (e) {
    console.error('Failed to sync users.json:', e);
  }
}

async function getCollection() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<UserRecord>('users');
  
  // Seed database if empty
  const count = await collection.countDocuments();
  if (count === 0) {
    const defaultUsers: UserRecord[] = [
      {
        id: 'user-manager-id-111',
        username: 'manager',
        passwordHash: await hashPassword('manager123'),
        role: 'manager',
        fullName: 'Creative Manager',
        createdAt: new Date().toISOString(),
        phone: '',
        email: '',
        address: ''
      }
    ];
    await collection.insertMany(defaultUsers);
    await syncUsersJson(collection);
  }
  
  return collection;
}

export async function getUsers(): Promise<UserRecord[]> {
  try {
    const collection = await getCollection();
    return await collection.find({}).toArray();
  } catch (e) {
    console.error('Failed to get users from MongoDB:', e);
    return [];
  }
}

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  try {
    const collection = await getCollection();
    const normalizedUsername = username.toLowerCase().trim();
    // Case-insensitive exact search
    return await collection.findOne({ 
      username: { $regex: new RegExp(`^${normalizedUsername}$`, 'i') } 
    });
  } catch (e) {
    console.error('Failed to find user by username from MongoDB:', e);
    return null;
  }
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  try {
    const collection = await getCollection();
    return await collection.findOne({ id });
  } catch (e) {
    console.error('Failed to find user by id from MongoDB:', e);
    return null;
  }
}

export async function createUser(
  username: string,
  passwordPlain: string,
  role: 'manager' | 'designer',
  fullName: string,
  phone?: string,
  email?: string,
  address?: string
): Promise<UserRecord | { error: string }> {
  try {
    const normalizedUsername = username.toLowerCase().trim();
    
    if (normalizedUsername.length < 3) {
      return { error: 'Username must be at least 3 characters long.' };
    }
    
    if (passwordPlain.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    const collection = await getCollection();
    const existing = await collection.findOne({ 
      username: { $regex: new RegExp(`^${normalizedUsername}$`, 'i') } 
    });
    if (existing) {
      return { error: 'Username is already taken.' };
    }

    const newUser: UserRecord = {
      id: `user-${Math.random().toString(36).substring(2, 11)}`,
      username: username.trim(),
      passwordHash: await hashPassword(passwordPlain),
      role,
      fullName: fullName.trim() || 'Anonymous User',
      createdAt: new Date().toISOString(),
      phone: phone?.trim() || '',
      email: email?.trim() || '',
      address: address?.trim() || ''
    };

    await collection.insertOne(newUser);
    await syncUsersJson(collection);
    return newUser;
  } catch (e: any) {
    console.error('Failed to create user in MongoDB:', e);
    return { error: e.message || 'Database error occurred' };
  }
}

export async function updateUser(
  id: string,
  updates: {
    username?: string;
    passwordPlain?: string;
    fullName?: string;
    role?: 'manager' | 'designer';
    phone?: string;
    email?: string;
    address?: string;
  }
): Promise<UserRecord | { error: string }> {
  try {
    const collection = await getCollection();
    const user = await collection.findOne({ id });
    if (!user) {
      return { error: 'User not found.' };
    }

    const setFields: any = {};

    if (updates.username !== undefined) {
      const normalizedUsername = updates.username.toLowerCase().trim();
      if (normalizedUsername.length < 3) {
        return { error: 'Username must be at least 3 characters long.' };
      }
      // Check if another user has this username
      const existing = await collection.findOne({
        id: { $ne: id },
        username: { $regex: new RegExp(`^${normalizedUsername}$`, 'i') }
      });
      if (existing) {
        return { error: 'Username is already taken.' };
      }
      setFields.username = updates.username.trim();
    }

    if (updates.passwordPlain !== undefined && updates.passwordPlain !== '') {
      if (updates.passwordPlain.length < 6) {
        return { error: 'Password must be at least 6 characters long.' };
      }
      setFields.passwordHash = await hashPassword(updates.passwordPlain);
    }

    if (updates.fullName !== undefined) {
      setFields.fullName = updates.fullName.trim() || 'Anonymous User';
    }

    if (updates.phone !== undefined) {
      setFields.phone = updates.phone.trim();
    }

    if (updates.email !== undefined) {
      setFields.email = updates.email.trim();
    }

    if (updates.address !== undefined) {
      setFields.address = updates.address.trim();
    }

    if (updates.role !== undefined) {
      setFields.role = updates.role;
    }

    if (Object.keys(setFields).length === 0) {
      return user;
    }

    await collection.updateOne({ id }, { $set: setFields });
    await syncUsersJson(collection);

    const updatedUser = await collection.findOne({ id });
    return updatedUser!;
  } catch (e: any) {
    console.error('Failed to update user in MongoDB:', e);
    return { error: e.message || 'Database error occurred' };
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean } | { error: string }> {
  try {
    const collection = await getCollection();
    const user = await collection.findOne({ id });
    if (!user) {
      return { error: 'User not found.' };
    }

    if (user.role === 'manager') {
      const managersCount = await collection.countDocuments({ role: 'manager' });
      if (managersCount <= 1) {
        return { error: 'Cannot delete the last manager account.' };
      }
    }

    await collection.deleteOne({ id });
    await syncUsersJson(collection);
    return { success: true };
  } catch (e: any) {
    console.error('Failed to delete user in MongoDB:', e);
    return { error: e.message || 'Database error occurred' };
  }
}

