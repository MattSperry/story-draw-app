import { D1Database } from '@cloudflare/workers-types';

export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'active' | 'blocked';
  created_at: string;
}

export interface ConnectionRequest {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export async function getConnectionsByUser(db: D1Database, userId: string): Promise<Connection[]> {
  const { results } = await db.prepare(
    'SELECT * FROM connections WHERE user_id = ? AND status = "active" ORDER BY created_at DESC'
  ).bind(userId).all();
  
  return results as Connection[];
}

export async function getConnectionRequestsByUser(db: D1Database, userId: string): Promise<ConnectionRequest[]> {
  const { results } = await db.prepare(
    'SELECT * FROM connection_requests WHERE connected_user_id = ? AND status = "pending" ORDER BY created_at DESC'
  ).bind(userId).all();
  
  return results as ConnectionRequest[];
}

export async function createConnectionRequest(
  db: D1Database,
  id: string,
  userId: string,
  connectedUserId: string
): Promise<ConnectionRequest> {
  await db.prepare(
    'INSERT INTO connection_requests (id, user_id, connected_user_id) VALUES (?, ?, ?)'
  ).bind(id, userId, connectedUserId).run();
  
  const { results } = await db.prepare(
    'SELECT * FROM connection_requests WHERE id = ?'
  ).bind(id).all();
  
  return results[0] as ConnectionRequest;
}

export async function acceptConnectionRequest(
  db: D1Database,
  requestId: string
): Promise<Connection> {
  // Get the request
  const { results: requestResults } = await db.prepare(
    'SELECT * FROM connection_requests WHERE id = ?'
  ).bind(requestId).all();
  
  const request = requestResults[0] as ConnectionRequest;
  
  // Update request status
  await db.prepare(
    'UPDATE connection_requests SET status = "accepted" WHERE id = ?'
  ).bind(requestId).run();
  
  // Create connection
  const connectionId = `conn-${Date.now()}`;
  await db.prepare(
    'INSERT INTO connections (id, user_id, connected_user_id) VALUES (?, ?, ?)'
  ).bind(connectionId, request.user_id, request.connected_user_id).run();
  
  // Create reverse connection
  const reverseConnectionId = `conn-rev-${Date.now()}`;
  await db.prepare(
    'INSERT INTO connections (id, user_id, connected_user_id) VALUES (?, ?, ?)'
  ).bind(reverseConnectionId, request.connected_user_id, request.user_id).run();
  
  const { results } = await db.prepare(
    'SELECT * FROM connections WHERE id = ?'
  ).bind(connectionId).all();
  
  return results[0] as Connection;
}

export async function rejectConnectionRequest(
  db: D1Database,
  requestId: string
): Promise<ConnectionRequest> {
  await db.prepare(
    'UPDATE connection_requests SET status = "rejected" WHERE id = ?'
  ).bind(requestId).run();
  
  const { results } = await db.prepare(
    'SELECT * FROM connection_requests WHERE id = ?'
  ).bind(requestId).all();
  
  return results[0] as ConnectionRequest;
}

export async function checkConnection(
  db: D1Database,
  userId: string,
  connectedUserId: string
): Promise<boolean> {
  const { results } = await db.prepare(
    'SELECT * FROM connections WHERE user_id = ? AND connected_user_id = ? AND status = "active"'
  ).bind(userId, connectedUserId).all();
  
  return results.length > 0;
}
