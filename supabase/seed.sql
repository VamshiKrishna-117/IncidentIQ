-- Seed data for IncidentIQ

INSERT INTO incidents (display_id, title, description, priority, status, reporter_name, assignee, service_affected, latest_update) VALUES
  (
    'INC-0001',
    'API Gateway Latency Spike',
    'P99 latency on API gateway spiked to over 2000ms affecting all routes. Users are experiencing timeouts on login and data fetch endpoints.',
    'P0',
    'INVESTIGATING',
    'Alice Chen',
    NULL,
    'api-gateway',
    'Investigating slow queries originating from auth service.'
  ),
  (
    'INC-0002',
    'Database Replication Lag',
    'Primary DB cluster in us-east-1 showing >30s replication delay to read replicas. Some users seeing stale data.',
    'P1',
    'IDENTIFIED',
    'Bob Smith',
    'jchen',
    'database',
    'Identified as network congestion between AZs. Routing team notified.'
  ),
  (
    'INC-0003',
    'Cache Node Failure',
    'Redis cache cluster node cache-04 is unresponsive. Some session data may be stale.',
    'P2',
    'MONITORING',
    'Jane Doe',
    NULL,
    'redis-cache',
    'Automated failover completed. Monitoring for stability.'
  ),
  (
    'INC-0004',
    'Payment Gateway 5xx Errors',
    'Payment gateway returning 503 errors for approximately 2% of transactions. Users reporting failed payments.',
    'P0',
    'OPEN',
    'System Alert',
    NULL,
    'payment-gateway',
    NULL
  );

INSERT INTO incident_updates (incident_id, message, author_name, update_type) VALUES
  ((SELECT id FROM incidents WHERE display_id = 'INC-0001'), 'Alert triggered: High Latency', 'System', 'SYSTEM'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0001'), 'ERROR [gateway] 504 Gateway Timeout connecting to auth-service', 'System', 'SYSTEM'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0001'), 'Started investigation into API gateway latency spike.', 'Alice Chen', 'USER'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0001'), 'AI Analysis Completed - Potential memory leak in auth-service pod causing OOM kills and cascading latency.', 'Nexus AI', 'AI'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0002'), 'Replication lag detected exceeding 30s threshold.', 'System', 'SYSTEM'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0002'), 'Network team investigating connectivity between AZs.', 'Bob Smith', 'USER'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0003'), 'Node redis-cache-04 health check failed.', 'System', 'SYSTEM'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0003'), 'Failover to replica completed. Monitoring metrics.', 'Jane Doe', 'USER');

INSERT INTO ai_results (incident_id, type, result_text, confidence, metadata) VALUES
  (
    (SELECT id FROM incidents WHERE display_id = 'INC-0001'),
    'SUMMARY',
    'Potential memory leak in auth-service pod causing OOM kills and cascading latency. Recommended action: Rollback auth-service deployment to previous stable version.',
    85.0,
    '{"root_cause": "auth-service memory leak", "blast_radius": "12% of user logins globally affected", "affected_services": ["api-gateway", "auth-service", "user-db"]}'
  );

INSERT INTO services (name, cluster, status, p99_latency_ms, error_rate, cpu_usage, memory_usage, request_rate, region) VALUES
  ('API Gateway', 'us-east-cluster', 'HEALTHY', 45, 0.2, 12, 45, 12400, 'us-east-1'),
  ('Authentication', 'global-auth-svc', 'DEGRADED', 850, 4.2, 85, 90, 5200, 'us-east-1'),
  ('Database (PostgreSQL)', 'prod-db-primary', 'HEALTHY', 12, 0.0, 40, 60, 8400, 'us-east-1'),
  ('Redis Cache', 'cache-layer-eu', 'HEALTHY', 2, 0.0, 5, 15, 22000, 'eu-west-2'),
  ('Payment Service', 'billing-gateway', 'DOWN', NULL, 100, NULL, NULL, NULL, 'us-east-1'),
  ('Notification Service', 'sns-worker-pool', 'HEALTHY', 25, 0.1, 15, 30, 8200, 'us-east-1');
