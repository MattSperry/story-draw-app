import { D1Database } from '@cloudflare/workers-types';

export interface Panel {
  id: string;
  story_id: string;
  sequence_number: number;
  image_url: string;
  created_by: string;
  created_at: string;
}

export async function getPanelById(db: D1Database, id: string): Promise<Panel | null> {
  const { results } = await db.prepare(
    'SELECT * FROM panels WHERE id = ?'
  ).bind(id).all();
  
  return results.length > 0 ? results[0] as Panel : null;
}

export async function getPanelsByStory(db: D1Database, storyId: string): Promise<Panel[]> {
  const { results } = await db.prepare(
    'SELECT * FROM panels WHERE story_id = ? ORDER BY sequence_number ASC'
  ).bind(storyId).all();
  
  return results as Panel[];
}

export async function getNextSequenceNumber(db: D1Database, storyId: string): Promise<number> {
  const { results } = await db.prepare(
    'SELECT MAX(sequence_number) as max_seq FROM panels WHERE story_id = ?'
  ).bind(storyId).all();
  
  const maxSeq = results[0]?.max_seq;
  return maxSeq ? Number(maxSeq) + 1 : 1;
}

export async function createPanel(
  db: D1Database,
  id: string,
  story_id: string,
  image_url: string,
  created_by: string,
  sequence_number?: number
): Promise<Panel> {
  // If sequence_number is not provided, get the next one
  if (!sequence_number) {
    sequence_number = await getNextSequenceNumber(db, story_id);
  }
  
  await db.prepare(
    'INSERT INTO panels (id, story_id, sequence_number, image_url, created_by) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, story_id, sequence_number, image_url, created_by).run();
  
  return getPanelById(db, id) as Promise<Panel>;
}

export async function updatePanelImage(
  db: D1Database,
  id: string,
  image_url: string
): Promise<Panel | null> {
  await db.prepare(
    'UPDATE panels SET image_url = ? WHERE id = ?'
  ).bind(image_url, id).run();
  
  return getPanelById(db, id);
}

export async function getPanelsByUser(db: D1Database, userId: string): Promise<Panel[]> {
  const { results } = await db.prepare(
    'SELECT * FROM panels WHERE created_by = ? ORDER BY created_at DESC'
  ).bind(userId).all();
  
  return results as Panel[];
}
