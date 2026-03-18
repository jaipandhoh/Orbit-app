-- Orbit PostgreSQL schema
-- You can run this directly in the Supabase SQL Editor

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
  contact_id INT DEFAULT NULL REFERENCES contacts(contact_id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  objective TEXT,
  start_date DATE NOT NULL,
  end_date DATE DEFAULT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  post_id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  platform VARCHAR(64) NOT NULL,
  content TEXT,
  scheduled_at TIMESTAMP DEFAULT NULL,
  published_at TIMESTAMP DEFAULT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deliverables (
  deliverable_id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  deliverable_type VARCHAR(64) NOT NULL,
  stage VARCHAR(128) DEFAULT NULL,
  platform VARCHAR(64) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE DEFAULT NULL,
  priority VARCHAR(32) DEFAULT 'medium',
  owner_role VARCHAR(64) DEFAULT NULL,
  status VARCHAR(64) DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
  request_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  department_id INT DEFAULT NULL REFERENCES departments(department_id) ON DELETE SET NULL,
  campaign_id INT DEFAULT NULL REFERENCES campaigns(campaign_id) ON DELETE SET NULL,
  platform VARCHAR(64) NOT NULL,
  content_type VARCHAR(64) NOT NULL,
  priority VARCHAR(32) DEFAULT 'normal',
  deadline_at TIMESTAMP DEFAULT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'new',
  requester_user_id INT DEFAULT NULL REFERENCES users(user_id) ON DELETE SET NULL,
  owner_user_id INT DEFAULT NULL REFERENCES users(user_id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_rules (
  rule_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(64) NOT NULL,
  condition_platform VARCHAR(64) DEFAULT NULL,
  condition_content_type VARCHAR(64) DEFAULT NULL,
  condition_priority VARCHAR(32) DEFAULT NULL,
  condition_campaign_id INT DEFAULT NULL REFERENCES campaigns(campaign_id) ON DELETE SET NULL,
  stages_json JSONB DEFAULT NULL,
  auto_approve_enabled BOOLEAN DEFAULT FALSE,
  auto_approve_conditions_json JSONB DEFAULT NULL,
  emergency_bypass_enabled BOOLEAN DEFAULT FALSE,
  emergency_bypass_roles_json JSONB DEFAULT NULL,
  priority_order INT DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS onboarding_templates (
  template_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  config_json JSONB DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_settings (
  id SERIAL PRIMARY KEY,
  onboarding_template_id INT DEFAULT NULL REFERENCES onboarding_templates(template_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: To handle updated_at automatically, PostgreSQL uses triggers. 
-- For a simple setup, the timestamp updates will ideally be handled in the code layer 
-- or by creating a trigger.

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
