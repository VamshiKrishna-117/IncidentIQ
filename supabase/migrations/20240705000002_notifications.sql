-- Migration: Notifications table for bell icon

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('incident_created', 'update_posted', 'status_changed', 'ai_analysis')),
  incident_id     UUID REFERENCES incidents(id) ON DELETE CASCADE,
  read            BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on notifications" ON notifications;
CREATE POLICY "Allow all on notifications" ON notifications
  FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
