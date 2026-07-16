-- Migration: Add user isolation and demo data support
-- Run this FIRST, then 20240707000002_rls.sql

-- ============= COLUMNS =============

-- Add ownership and demo flag to incidents
ALTER TABLE incidents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE incidents ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;

-- Add ownership to related tables (references auth.users for integrity,
-- but actual ownership flows from the parent incident for RLS)
ALTER TABLE incident_updates ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ai_results ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============= ADMIN TABLE =============

CREATE TABLE admin_users (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============= AUTO-SET USER_ID ON INSERT =============

CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_incidents_user_id
  BEFORE INSERT ON incidents
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_incident_updates_user_id
  BEFORE INSERT ON incident_updates
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_ai_results_user_id
  BEFORE INSERT ON ai_results
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_notifications_user_id
  BEFORE INSERT ON notifications
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

-- ============= MARK EXISTING SEED DATA AS DEMO =============

UPDATE incidents SET is_demo = true, user_id = NULL;
UPDATE incident_updates SET user_id = NULL;
UPDATE ai_results SET user_id = NULL;
UPDATE notifications SET user_id = NULL;

-- ============= INDEXES =============

CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_is_demo ON incidents(is_demo);
CREATE INDEX idx_incident_updates_user_id ON incident_updates(user_id);
CREATE INDEX idx_ai_results_user_id ON ai_results(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
