CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE panels (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES stories(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE(story_id, sequence_number)
);

CREATE TABLE connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  connected_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (connected_user_id) REFERENCES users(id),
  UNIQUE(user_id, connected_user_id)
);

CREATE TABLE connection_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  connected_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (connected_user_id) REFERENCES users(id),
  UNIQUE(user_id, connected_user_id)
);

CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES stories(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(story_id, user_id)
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES stories(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE story_prompts (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insert initial admin user (password is hashed 'password')
INSERT INTO users (id, username, email, password, is_admin)
VALUES ('admin-user-id', 'admin', 'admin@storydraw.app', '$2a$10$JdJO7S7.eThQZAJ9B1Tc6.MRd/Q7G4k.nGsXp.TJGGTJJxcYyWUdm', 1);

-- Insert initial story prompts
INSERT INTO story_prompts (id, prompt, created_by)
VALUES 
('prompt-1', 'A space explorer discovers a mysterious alien artifact', 'admin-user-id'),
('prompt-2', 'Two friends find a hidden door in their school library', 'admin-user-id'),
('prompt-3', 'A talking animal needs help finding its way home', 'admin-user-id');
