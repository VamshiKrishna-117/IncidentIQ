-- Migration: Core tables for IncidentIQ

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============= INCIDENTS =============
CREATE TABLE incidents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id      TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  priority        TEXT NOT NULL DEFAULT 'P3' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  status          TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED')),
  reporter_name   TEXT NOT NULL,
  assignee        TEXT,
  service_affected TEXT,
  latest_update   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_priority ON incidents(priority);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============= INCIDENT UPDATES =============
CREATE TABLE incident_updates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id  UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  author_name  TEXT NOT NULL,
  update_type  TEXT NOT NULL DEFAULT 'USER' CHECK (update_type IN ('USER', 'SYSTEM', 'AI')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_updates_incident_id ON incident_updates(incident_id, created_at ASC);

-- ============= AI RESULTS =============
CREATE TABLE ai_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id  UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('SUMMARY', 'NEXT_ACTION', 'PRIORITY_REVIEW')),
  result_text  TEXT NOT NULL,
  confidence   REAL,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_incident_id ON ai_results(incident_id, created_at DESC);

-- ============= SETTINGS (KV Store) =============
CREATE TABLE settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO settings (key, value) VALUES
  ('theme', '"dark"'),
  ('notifications_enabled', 'true'),
  ('auto_refresh_interval', '"15s"'),
  ('websocket_endpoint', '"wss://stream.aegis.internal"'),
  ('max_reconnection_retries', '5'),
  ('ai_provider', '"groq"'),
  ('auto_analyze_critical', 'true');

-- ============= INFRASTRUCTURE SERVICES =============
CREATE TABLE services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  cluster         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'HEALTHY' CHECK (status IN ('HEALTHY', 'DEGRADED', 'DOWN')),
  p99_latency_ms  INTEGER,
  error_rate      REAL,
  cpu_usage       REAL,
  memory_usage    REAL,
  request_rate    REAL,
  heartbeat_at    TIMESTAMPTZ DEFAULT now(),
  region          TEXT NOT NULL DEFAULT 'us-east-1',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============= SEQUENCE FOR DISPLAY ID =============
CREATE SEQUENCE IF NOT EXISTS incident_display_seq START 1;

CREATE OR REPLACE FUNCTION generate_display_id()
RETURNS TEXT AS $$
DECLARE
  next_val BIGINT;
BEGIN
  next_val := nextval('incident_display_seq');
  RETURN 'INC-' || LPAD(next_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============= ENABLE REALTIME =============
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE incident_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_results;

-- ============= ROW LEVEL SECURITY =============
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (tighten when auth is added)
CREATE POLICY "Allow all on incidents" ON incidents
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on incident_updates" ON incident_updates
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on ai_results" ON ai_results
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on settings" ON settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on services" ON services
  FOR ALL USING (true) WITH CHECK (true);
