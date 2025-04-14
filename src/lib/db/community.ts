import { D1Database } from '@cloudflare/workers-types';

export interface Vote {
  id: string;
  story_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface Comment {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export async function getVotesByStory(db: D1Database, storyId: string): Promise<Vote[]> {
  const { results } = await db.prepare(
    'SELECT * FROM votes WHERE story_id = ? ORDER BY created_at DESC'
  ).bind(storyId).all();
  
  return results as Vote[];
}

export async function getAverageRating(db: D1Database, storyId: string): Promise<number> {
  const { results } = await db.prepare(
    'SELECT AVG(rating) as avg_rating FROM votes WHERE story_id = ?'
  ).bind(storyId).all();
  
  return results[0]?.avg_rating ? Number(results[0].avg_rating) : 0;
}

export async function createVote(
  db: D1Database,
  id: string,
  storyId: string,
  userId: string,
  rating: number
): Promise<Vote> {
  // Check if user already voted
  const { results: existingVotes } = await db.prepare(
    'SELECT * FROM votes WHERE story_id = ? AND user_id = ?'
  ).bind(storyId, userId).all();
  
  if (existingVotes.length > 0) {
    // Update existing vote
    await db.prepare(
      'UPDATE votes SET rating = ? WHERE story_id = ? AND user_id = ?'
    ).bind(rating, storyId, userId).run();
    
    const { results } = await db.prepare(
      'SELECT * FROM votes WHERE story_id = ? AND user_id = ?'
    ).bind(storyId, userId).all();
    
    return results[0] as Vote;
  } else {
    // Create new vote
    await db.prepare(
      'INSERT INTO votes (id, story_id, user_id, rating) VALUES (?, ?, ?, ?)'
    ).bind(id, storyId, userId, rating).run();
    
    const { results } = await db.prepare(
      'SELECT * FROM votes WHERE id = ?'
    ).bind(id).all();
    
    return results[0] as Vote;
  }
}

export async function getCommentsByStory(db: D1Database, storyId: string): Promise<Comment[]> {
  const { results } = await db.prepare(
    'SELECT * FROM comments WHERE story_id = ? ORDER BY created_at DESC'
  ).bind(storyId).all();
  
  return results as Comment[];
}

export async function createComment(
  db: D1Database,
  id: string,
  storyId: string,
  userId: string,
  content: string
): Promise<Comment> {
  await db.prepare(
    'INSERT INTO comments (id, story_id, user_id, content) VALUES (?, ?, ?, ?)'
  ).bind(id, storyId, userId, content).run();
  
  const { results } = await db.prepare(
    'SELECT * FROM comments WHERE id = ?'
  ).bind(id).all();
  
  return results[0] as Comment;
}

export async function deleteComment(db: D1Database, id: string): Promise<void> {
  await db.prepare(
    'DELETE FROM comments WHERE id = ?'
  ).bind(id).run();
}
