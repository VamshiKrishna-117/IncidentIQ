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
  ),
  (
    'INC-0005',
    'Deployment Pipeline Failure',
    'CI/CD pipeline failing on integration tests for main branch. Blocking all deployments.',
    'P1',
    'INVESTIGATING',
    'DevOps Bot',
    'mike',
    'deployment-pipeline',
    'Investigating test environment configuration drift.'
  ),
  (
    'INC-0006',
    'S3 Bucket Permission Error',
    'Uploads to assets bucket failing with AccessDenied for service account. Media team unable to publish content.',
    'P2',
    'IDENTIFIED',
    'Media Team',
    'ops',
    'storage-service',
    'IAM policy misconfiguration identified. Fix in progress.'
  ),
  (
    'INC-0007',
    'DNS Resolution Delay',
    'DNS resolution for internal services taking >500ms in eu-west-2 region. Intermittent connectivity.',
    'P3',
    'MONITORING',
    'Platform Bot',
    NULL,
    'dns-service',
    'Monitoring after DNS cache refresh in eu-west-2.'
  ),
  (
    'INC-0008',
    'UI Dashboard Latency',
    'Dashboard page load time increased by 40%. Likely due to unoptimized analytics queries.',
    'P3',
    'RESOLVED',
    'Analyst',
    NULL,
    NULL,
    'Resolved after analytics query optimization.'
  ),
  (
    'INC-0009',
    'SSL Certificate Expiry',
    'Wildcard SSL cert for *.app.example.com expires in 7 days. Auto-renewal configured.',
    'P3',
    'RESOLVED',
    'Security Bot',
    'ops',
    NULL,
    'Certificate renewed and deployed.'
  ),
  (
    'INC-0010',
    'Memory Leak in Worker Queue',
    'Worker-queue-processing pod in eu-central-1 consuming 95% memory. Auto-scaling triggered but unable to keep up.',
    'P2',
    'OPEN',
    'System Alert',
    NULL,
    'worker-queue-processing',
    NULL
  );

INSERT INTO incident_updates (incident_id, message, author_name, update_type) VALUES
  -- INC-0001
  ((SELECT id FROM incidents WHERE display_id = 'INC-0001'), 'Alert triggered: High Latency', 'System', 'SYSTEM'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0001'), 'ERROR [gateway] 504 Gateway Timeout connecting to auth-service', 'System', 'SYSTEM'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0001'), 'Started investigation into API gateway latency spike.', 'Alice Chen', 'USER'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0001'), 'AI Analysis Completed - Potential memory leak in auth-service pod causing OOM kills and cascading latency.', 'Nexus AI', 'AI'),

  -- INC-0002
  ((SELECT id FROM incidents WHERE display_id = 'INC-0002'), 'Replication lag detected exceeding 30s threshold.', 'System', 'SYSTEM'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0002'), 'Network team investigating connectivity between AZs.', 'Bob Smith', 'USER'),

  -- INC-0003
  ((SELECT id FROM incidents WHERE display_id = 'INC-0003'), 'Node redis-cache-04 health check failed.', 'System', 'SYSTEM'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0003'), 'Failover to replica completed. Monitoring metrics.', 'Jane Doe', 'USER'),

  -- INC-0005
  ((SELECT id FROM incidents WHERE display_id = 'INC-0005'), 'CI pipeline failed at integration test stage.', 'System', 'SYSTEM'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0005'), 'Test runner shows environment configuration mismatch.', 'DevOps Bot', 'USER'),

  -- INC-0008 (resolved)
  ((SELECT id FROM incidents WHERE display_id = 'INC-0008'), 'Analytics query performance degraded.', 'System', 'SYSTEM'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0008'), 'Optimized the slow analytics query. Deploying fix.', 'Analyst', 'USER'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0008'), 'Fix verified in staging. Dashboard latency back to normal.', 'Analyst', 'USER'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0008'), 'Incident resolved. Query plan optimized.', 'Nexus AI', 'AI'),

  -- INC-0009 (resolved)
  ((SELECT id FROM incidents WHERE display_id = 'INC-0009'), 'Certificate expiry notification triggered.', 'System', 'SYSTEM'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0009'), 'Auto-renewal initiated via cert-manager.', 'Security Bot', 'USER'),
  ((SELECT id FROM incidents WHERE display_id = 'INC-0009'), 'New certificate issued and deployed to all ingress controllers.', 'Security Bot', 'USER');

INSERT INTO ai_results (incident_id, type, result_text, confidence, metadata) VALUES
  (
    (SELECT id FROM incidents WHERE display_id = 'INC-0001'),
    'SUMMARY',
    'Potential memory leak in auth-service pod causing OOM kills and cascading latency. Recommended action: Rollback auth-service deployment to previous stable version.',
    85.0,
    '{"root_cause": "auth-service memory leak", "blast_radius": "12% of user logins globally affected", "affected_services": ["api-gateway", "auth-service", "user-db"]}'
  ),
  (
    (SELECT id FROM incidents WHERE display_id = 'INC-0004'),
    'SUMMARY',
    'Payment gateway 503 errors suggest upstream dependency failure. Check billing service connectivity and recent deployments.',
    72.0,
    '{"root_cause": "Upstream dependency failure in billing service", "blast_radius": "2% of transactions affected, primarily in us-east-1", "affected_services": ["payment-gateway", "billing-service"]}'
  ),
  (
    (SELECT id FROM incidents WHERE display_id = 'INC-0010'),
    'SUMMARY',
    'Worker queue memory leak likely caused by unclosed database connections in the job processor. Mitigation: restart pod and add connection pooling.',
    90.0,
    '{"root_cause": "Unclosed DB connections in job processor", "blast_radius": "All async job processing affected in eu-central-1", "affected_services": ["worker-queue-processing", "database"]}'
  );

INSERT INTO services (name, cluster, status, p99_latency_ms, error_rate, cpu_usage, memory_usage, request_rate, region) VALUES
  ('API Gateway', 'us-east-cluster', 'HEALTHY', 45, 0.2, 12, 45, 12400, 'us-east-1'),
  ('Authentication', 'global-auth-svc', 'DEGRADED', 850, 4.2, 85, 90, 5200, 'us-east-1'),
  ('Database (PostgreSQL)', 'prod-db-primary', 'HEALTHY', 12, 0.0, 40, 60, 8400, 'us-east-1'),
  ('Redis Cache', 'cache-layer-eu', 'HEALTHY', 2, 0.0, 5, 15, 22000, 'eu-west-2'),
  ('Payment Service', 'billing-gateway', 'DOWN', NULL, 100, NULL, NULL, NULL, 'us-east-1'),
  ('Notification Service', 'sns-worker-pool', 'HEALTHY', 25, 0.1, 15, 30, 8200, 'us-east-1'),
  ('DNS Resolver', 'dns-edge', 'DEGRADED', 520, 3.5, 55, 65, 32000, 'eu-west-2'),
  ('Worker Queue', 'async-worker-pool', 'DEGRADED', 1200, 5.1, 92, 95, 1800, 'eu-central-1'),
  ('CDN Edge', 'cdn-global', 'HEALTHY', 8, 0.0, 10, 20, 95000, 'us-east-1'),
  ('Storage Service', 'storage-cluster-01', 'HEALTHY', 35, 0.5, 20, 40, 6500, 'us-east-1');
