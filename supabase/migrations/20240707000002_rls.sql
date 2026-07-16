-- Migration: Replace permissive policies with auth-aware RLS
-- Run AFTER 20240707000001_auth.sql

-- ============= INCIDENTS =============

DROP POLICY IF EXISTS "Allow all on incidents" ON incidents;

-- Everyone sees demo incidents; authenticated users also see their own
CREATE POLICY "Select incidents" ON incidents
  FOR SELECT USING (
    is_demo = true OR user_id = auth.uid()
  );

-- Users create their own; admins can create demo incidents
CREATE POLICY "Insert incidents" ON incidents
  FOR INSERT WITH CHECK (
    (user_id = auth.uid() AND is_demo = false) OR
    (is_demo = true AND EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  );

-- Users update their own; admins update demo incidents
CREATE POLICY "Update incidents" ON incidents
  FOR UPDATE USING (
    (user_id = auth.uid()) OR
    (is_demo = true AND EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  ) WITH CHECK (
    (user_id = auth.uid() AND is_demo = false) OR
    (is_demo = true AND EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  );

-- Users delete their own; admins delete demo incidents
CREATE POLICY "Delete incidents" ON incidents
  FOR DELETE USING (
    (user_id = auth.uid()) OR
    (is_demo = true AND EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  );

-- ============= INCIDENT UPDATES =============

DROP POLICY IF EXISTS "Allow all on incident_updates" ON incident_updates;

-- Can see updates if the parent incident is visible (demo or owned)
CREATE POLICY "Select incident_updates" ON incident_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = incident_updates.incident_id
      AND (incidents.is_demo = true OR incidents.user_id = auth.uid())
    )
  );

-- Can add updates if authenticated and parent incident is owned or admin
CREATE POLICY "Insert incident_updates" ON incident_updates
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = incident_updates.incident_id
      AND (incidents.user_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
    )
  );

-- Can delete updates if parent incident is owned or admin
CREATE POLICY "Delete incident_updates" ON incident_updates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = incident_updates.incident_id
      AND (incidents.user_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
    )
  );

-- ============= AI RESULTS =============

DROP POLICY IF EXISTS "Allow all on ai_results" ON ai_results;

-- Can see AI results if the parent incident is visible
CREATE POLICY "Select ai_results" ON ai_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = ai_results.incident_id
      AND (incidents.is_demo = true OR incidents.user_id = auth.uid())
    )
  );

-- Can generate AI results if parent incident is owned or admin
CREATE POLICY "Insert ai_results" ON ai_results
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = ai_results.incident_id
      AND (incidents.user_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
    )
  );

-- Can delete AI results if parent incident is owned or admin
CREATE POLICY "Delete ai_results" ON ai_results
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = ai_results.incident_id
      AND (incidents.user_id = auth.uid() OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
    )
  );

-- ============= NOTIFICATIONS =============

DROP POLICY IF EXISTS "Allow all on notifications" ON notifications;

-- Notifications are personal — users only see their own
CREATE POLICY "Select notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Insert notifications" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Delete notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- ============= SETTINGS =============

DROP POLICY IF EXISTS "Allow all on settings" ON settings;

-- Settings are global; any authenticated user can read
CREATE POLICY "Select settings" ON settings
  FOR SELECT USING (true);

-- ============= SERVICES =============

DROP POLICY IF EXISTS "Allow all on services" ON services;

-- Services are global; any user can read
CREATE POLICY "Select services" ON services
  FOR SELECT USING (true);

-- ============= ADMIN_USERS =============

-- Anyone can see who the admins are
CREATE POLICY "Select admin_users" ON admin_users
  FOR SELECT USING (true);

-- Only existing admins can add new admins
-- (first admin must be added via Supabase Dashboard SQL editor with service role)
CREATE POLICY "Insert admin_users" ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Only existing admins can remove admins
CREATE POLICY "Delete admin_users" ON admin_users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );
