import { D1Database } from '@cloudflare/workers-types';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  is_admin: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const { results } = await db.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(id).all();
  
  return results.length > 0 ? results[0] as User : null;
}

export async function getUserByUsername(db: D1Database, username: string): Promise<User | null> {
  const { results } = await db.prepare(
    'SELECT * FROM users WHERE username = ?'
  ).bind(username).all();
  
  return results.length > 0 ? results[0] as User : null;
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const { results } = await db.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).all();
  
  return results.length > 0 ? results[0] as User : null;
}

export async function createUser(
  db: D1Database, 
  id: string, 
  username: string, 
  email: string, 
  password: string, 
  is_admin: boolean
): Promise<User> {
  await db.prepare(
    'INSERT INTO users (id, username, email, password, is_admin) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, username, email, password, is_admin ? 1 : 0).run();
  
  return getUserById(db, id) as Promise<User>;
}

export async function searchUsers(db: D1Database, query: string): Promise<User[]> {
  const { results } = await db.prepare(
    'SELECT * FROM users WHERE username LIKE ? OR email LIKE ? LIMIT 10'
  ).bind(`%${query}%`, `%${query}%`).all();
  
  return results as User[];
}

export async function sanitizeUser(user: User): Promise<AuthUser> {
  const { password, ...authUser } = user;
  return authUser as AuthUser;
}
