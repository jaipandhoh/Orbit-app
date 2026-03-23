-- Orbit PostgreSQL schema for Supabase
-- Run this in the Supabase dashboard: SQL Editor → New query → paste & run

-- =============================================================================
-- TABLES (create in FK order)
-- =============================================================================

CREATE TABLE IF NOT EXISTS contacts (
  contact_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  organization VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
  department_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(64) DEFAULT 'member'
);

CREATE TABLE IF NOT EXISTS campaigns (
  campaign_id SERIAL PRIMARY KEY,
  contact_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  objective TEXT,
  start_date DATE NOT NULL,
  end_date DATE DEFAULT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS posts (
  post_id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL,
  platform VARCHAR(64) NOT NULL,
  content TEXT,
  scheduled_at TIMESTAMP DEFAULT NULL,
  published_at TIMESTAMP DEFAULT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deliverables (
  deliverable_id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL,
  deliverable_type VARCHAR(64) NOT NULL,
  stage VARCHAR(128) DEFAULT NULL,
  platform VARCHAR(64) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE DEFAULT NULL,
  priority VARCHAR(32) DEFAULT 'medium',
  owner_role VARCHAR(64) DEFAULT NULL,
  status VARCHAR(64) DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS requests (
  request_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  department_id INT DEFAULT NULL,
  campaign_id INT DEFAULT NULL,
  platform VARCHAR(64) NOT NULL,
  content_type VARCHAR(64) NOT NULL,
  priority VARCHAR(32) DEFAULT 'normal',
  deadline_at TIMESTAMP DEFAULT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'new',
  requester_user_id INT DEFAULT NULL,
  owner_user_id INT DEFAULT NULL,
  scheduled_at TIMESTAMP DEFAULT NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'internal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE SET NULL,
  FOREIGN KEY (requester_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (owner_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS approval_rules (
  rule_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(64) NOT NULL,
  condition_platform VARCHAR(64) DEFAULT NULL,
  condition_content_type VARCHAR(64) DEFAULT NULL,
  condition_priority VARCHAR(32) DEFAULT NULL,
  condition_campaign_id INT DEFAULT NULL,
  stages_json JSON DEFAULT NULL,
  auto_approve_enabled SMALLINT DEFAULT 0,
  auto_approve_conditions_json JSON DEFAULT NULL,
  emergency_bypass_enabled SMALLINT DEFAULT 0,
  emergency_bypass_roles_json JSON DEFAULT NULL,
  priority_order INT DEFAULT 100,
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (condition_campaign_id) REFERENCES campaigns(campaign_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS onboarding_templates (
  template_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  config_json JSON DEFAULT NULL,
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_settings (
  id SERIAL PRIMARY KEY,
  onboarding_template_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (onboarding_template_id) REFERENCES onboarding_templates(template_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS campaign_plans (
  campaign_id INT PRIMARY KEY,
  brief_text TEXT NULL,
  colors_json JSON NULL,
  plan_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS approvals (
  id SERIAL PRIMARY KEY,
  post_id INT NULL,
  request_id INT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  feedback TEXT NULL,
  submitted_by VARCHAR(100) NULL,
  reviewed_by VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS approval_comments (
  id SERIAL PRIMARY KEY,
  request_id INT NOT NULL,
  body TEXT NOT NULL,
  author_name VARCHAR(255) NULL,
  pin_x FLOAT NULL,
  pin_y FLOAT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
);

-- =============================================================================
-- VIEW
-- =============================================================================

CREATE OR REPLACE VIEW v_campaign_summary AS
SELECT
  c.campaign_id,
  c.title,
  c.objective,
  c.start_date,
  c.end_date,
  c.status,
  c.contact_id,
  (SELECT COUNT(*) FROM posts p WHERE p.campaign_id = c.campaign_id) AS post_count
FROM campaigns c;
