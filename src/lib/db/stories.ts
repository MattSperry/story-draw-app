import { D1Database } from '@cloudflare/workers-types';

export interface Story {
  id: string;
  title: string;
  prompt: string;
  created_by: string;
  status: 'in_progress' | 'completed';
  created_at: string;
}

export async function getStoryById(db: D1Database, id: string): Promise<Story | null> {
  const { results } = await db.prepare(
    'SELECT * FROM stories WHERE id = ?'
  ).bind(id).all();
  
  return results.length > 0 ? results[0] as Story : null;
}

export async function getStoriesByUser(db: D1Database, userId: string): Promise<Story[]> {
  const { results } = await db.prepare(
    'SELECT * FROM stories WHERE created_by = ? ORDER BY created_at DESC'
  ).bind(userId).all();
  
  return results as Story[];
}

export async function getTopStories(db: D1Database, limit: number = 10): Promise<Story[]> {
  const { results } = await db.prepare(`
    SELECT s.*, AVG(v.rating) as avg_rating 
    FROM stories s
    LEFT JOIN votes v ON s.id = v.story_id
    GROUP BY s.id
    ORDER BY avg_rating DESC, s.created_at DESC
    LIMIT ?
  `).bind(limit).all();
  
  return results as Story[];
}

export async function createStory(
  db: D1Database,
  id: string,
  title: string,
  prompt: string,
  created_by: string
): Promise<Story> {
  await db.prepare(
    'INSERT INTO stories (id, title, prompt, created_by) VALUES (?, ?, ?, ?)'
  ).bind(id, title, prompt, created_by).run();
  
  return getStoryById(db, id) as Promise<Story>;
}

export async function updateStoryStatus(
  db: D1Database,
  id: string,
  status: 'in_progress' | 'completed'
): Promise<Story | null> {
  await db.prepare(
    'UPDATE stories SET status = ? WHERE id = ?'
  ).bind(status, id).run();
  
  return getStoryById(db, id);
}

export async function getStoryPrompts(db: D1Database): Promise<{id: string, prompt: string}[]> {
  const { results } = await db.prepare(
    'SELECT id, prompt FROM story_prompts ORDER BY created_at DESC'
  ).all();
  
  return results as {id: string, prompt: string}[];
}

export async function createStoryPrompt(
  db: D1Database,
  id: string,
  prompt: string,
  created_by: string
): Promise<{id: string, prompt: string}> {
  await db.prepare(
    'INSERT INTO story_prompts (id, prompt, created_by) VALUES (?, ?, ?)'
  ).bind(id, prompt, created_by).run();
  
  const { results } = await db.prepare(
    'SELECT id, prompt FROM story_prompts WHERE id = ?'
  ).bind(id).all();
  
  return results[0] as {id: string, prompt: string};
}
