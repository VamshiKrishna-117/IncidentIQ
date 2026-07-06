import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const incidents = [
  {
    display_id: "INC-0001", title: "API Gateway Latency Spike",
    description: "P99 latency on API gateway spiked to over 2000ms affecting all routes.",
    priority: "P0", status: "INVESTIGATING", reporter_name: "Alice Chen",
    service_affected: "api-gateway",
  },
  {
    display_id: "INC-0002", title: "Database Replication Lag",
    description: "Primary DB cluster showing >30s replication delay to read replicas.",
    priority: "P1", status: "IDENTIFIED", reporter_name: "Bob Smith", assignee: "jchen",
    service_affected: "database",
  },
  {
    display_id: "INC-0003", title: "Cache Node Failure",
    description: "Redis cache cluster node cache-04 is unresponsive.",
    priority: "P2", status: "MONITORING", reporter_name: "Jane Doe",
    service_affected: "redis-cache",
  },
  {
    display_id: "INC-0004", title: "Payment Gateway 5xx Errors",
    description: "Payment gateway returning 503 errors for 2% of transactions.",
    priority: "P0", status: "OPEN", reporter_name: "System Alert",
    service_affected: "payment-gateway",
  },
  {
    display_id: "INC-0005", title: "Deployment Pipeline Failure",
    description: "CI/CD pipeline failing on integration tests for main branch.",
    priority: "P1", status: "INVESTIGATING", reporter_name: "DevOps Bot", assignee: "mike",
    service_affected: "deployment-pipeline",
  },
  {
    display_id: "INC-0006", title: "S3 Bucket Permission Error",
    description: "Uploads to assets bucket failing with AccessDenied for service account.",
    priority: "P2", status: "IDENTIFIED", reporter_name: "Media Team", assignee: "ops",
    service_affected: "storage-service",
  },
  {
    display_id: "INC-0007", title: "DNS Resolution Delay",
    description: "DNS resolution for internal services taking >500ms in eu-west-2.",
    priority: "P3", status: "MONITORING", reporter_name: "Platform Bot",
    service_affected: "dns-service",
  },
  {
    display_id: "INC-0008", title: "UI Dashboard Latency",
    description: "Dashboard page load time increased by 40%.",
    priority: "P3", status: "RESOLVED", reporter_name: "Analyst",
  },
  {
    display_id: "INC-0009", title: "SSL Certificate Expiry",
    description: "Wildcard SSL cert for *.app.example.com expires in 7 days.",
    priority: "P3", status: "RESOLVED", reporter_name: "Security Bot", assignee: "ops",
  },
  {
    display_id: "INC-0010", title: "Memory Leak in Worker Queue",
    description: "Worker-queue-processing pod in eu-central-1 consuming 95% memory.",
    priority: "P2", status: "OPEN", reporter_name: "System Alert",
    service_affected: "worker-queue-processing",
  },
];

const services = [
  { name: "API Gateway", cluster: "us-east-cluster", status: "HEALTHY", p99_latency_ms: 45, error_rate: 0.2, cpu_usage: 12, memory_usage: 45, request_rate: 12400, region: "us-east-1" },
  { name: "Authentication", cluster: "global-auth-svc", status: "DEGRADED", p99_latency_ms: 850, error_rate: 4.2, cpu_usage: 85, memory_usage: 90, request_rate: 5200, region: "us-east-1" },
  { name: "Database (PostgreSQL)", cluster: "prod-db-primary", status: "HEALTHY", p99_latency_ms: 12, error_rate: 0, cpu_usage: 40, memory_usage: 60, request_rate: 8400, region: "us-east-1" },
  { name: "Redis Cache", cluster: "cache-layer-eu", status: "HEALTHY", p99_latency_ms: 2, error_rate: 0, cpu_usage: 5, memory_usage: 15, request_rate: 22000, region: "eu-west-2" },
  { name: "Payment Service", cluster: "billing-gateway", status: "DOWN", region: "us-east-1" },
  { name: "Notification Service", cluster: "sns-worker-pool", status: "HEALTHY", p99_latency_ms: 25, error_rate: 0.1, cpu_usage: 15, memory_usage: 30, request_rate: 8200, region: "us-east-1" },
  { name: "DNS Resolver", cluster: "dns-edge", status: "DEGRADED", p99_latency_ms: 520, error_rate: 3.5, cpu_usage: 55, memory_usage: 65, request_rate: 32000, region: "eu-west-2" },
  { name: "Worker Queue", cluster: "async-worker-pool", status: "DEGRADED", p99_latency_ms: 1200, error_rate: 5.1, cpu_usage: 92, memory_usage: 95, request_rate: 1800, region: "eu-central-1" },
  { name: "CDN Edge", cluster: "cdn-global", status: "HEALTHY", p99_latency_ms: 8, error_rate: 0, cpu_usage: 10, memory_usage: 20, request_rate: 95000, region: "us-east-1" },
  { name: "Storage Service", cluster: "storage-cluster-01", status: "HEALTHY", p99_latency_ms: 35, error_rate: 0.5, cpu_usage: 20, memory_usage: 40, request_rate: 6500, region: "us-east-1" },
];

async function main() {
  console.log("Deleting existing seed data...");
  await supabase.from("ai_results").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("incident_updates").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("incidents").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("services").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("Inserting services...");
  const { error: svcErr } = await supabase.from("services").insert(services);
  if (svcErr) throw new Error(`Services: ${svcErr.message}`);
  console.log(`  ${services.length} services inserted`);

  console.log("Inserting incidents...");
  const { data: inserted, error: incErr } = await supabase.from("incidents").insert(incidents).select();
  if (incErr) throw new Error(`Incidents: ${incErr.message}`);
  console.log(`  ${inserted.length} incidents inserted`);

  const incMap = Object.fromEntries(inserted.map((i) => [i.display_id, i.id]));

  const updates = [
    { incident_id: incMap["INC-0001"], message: "Alert triggered: High Latency", author_name: "System", update_type: "SYSTEM" },
    { incident_id: incMap["INC-0001"], message: "Started investigation into API gateway latency spike.", author_name: "Alice Chen", update_type: "USER" },
    { incident_id: incMap["INC-0002"], message: "Replication lag detected exceeding 30s threshold.", author_name: "System", update_type: "SYSTEM" },
    { incident_id: incMap["INC-0002"], message: "Network team investigating connectivity between AZs.", author_name: "Bob Smith", update_type: "USER" },
    { incident_id: incMap["INC-0003"], message: "Node redis-cache-04 health check failed.", author_name: "System", update_type: "SYSTEM" },
    { incident_id: incMap["INC-0003"], message: "Failover to replica completed. Monitoring metrics.", author_name: "Jane Doe", update_type: "USER" },
    { incident_id: incMap["INC-0005"], message: "CI pipeline failed at integration test stage.", author_name: "System", update_type: "SYSTEM" },
    { incident_id: incMap["INC-0005"], message: "Test runner shows environment configuration mismatch.", author_name: "DevOps Bot", update_type: "USER" },
    { incident_id: incMap["INC-0008"], message: "Analytics query performance degraded.", author_name: "System", update_type: "SYSTEM" },
    { incident_id: incMap["INC-0008"], message: "Optimized the slow analytics query. Deploying fix.", author_name: "Analyst", update_type: "USER" },
    { incident_id: incMap["INC-0008"], message: "Incident resolved. Query plan optimized.", author_name: "Nexus AI", update_type: "AI" },
    { incident_id: incMap["INC-0009"], message: "Certificate expiry notification triggered.", author_name: "System", update_type: "SYSTEM" },
    { incident_id: incMap["INC-0009"], message: "Auto-renewal initiated via cert-manager.", author_name: "Security Bot", update_type: "USER" },
    { incident_id: incMap["INC-0009"], message: "New certificate issued and deployed to all ingress controllers.", author_name: "Security Bot", update_type: "USER" },
  ];

  console.log("Inserting updates...");
  const { error: upErr } = await supabase.from("incident_updates").insert(updates);
  if (upErr) throw new Error(`Updates: ${upErr.message}`);
  console.log(`  ${updates.length} updates inserted`);

  const ai = [
    { incident_id: incMap["INC-0001"], type: "SUMMARY", result_text: "Potential memory leak in auth-service pod causing OOM kills and cascading latency.", confidence: 85, metadata: { root_cause: "auth-service memory leak", blast_radius: "12% of user logins globally affected", affected_services: ["api-gateway", "auth-service", "user-db"] } },
    { incident_id: incMap["INC-0004"], type: "SUMMARY", result_text: "Payment gateway 503 errors suggest upstream dependency failure.", confidence: 72, metadata: { root_cause: "Upstream dependency failure in billing service", blast_radius: "2% of transactions affected", affected_services: ["payment-gateway", "billing-service"] } },
    { incident_id: incMap["INC-0010"], type: "SUMMARY", result_text: "Worker queue memory leak likely caused by unclosed database connections.", confidence: 90, metadata: { root_cause: "Unclosed DB connections in job processor", blast_radius: "All async job processing affected", affected_services: ["worker-queue-processing", "database"] } },
  ];

  console.log("Inserting AI results...");
  const { error: aiErr } = await supabase.from("ai_results").insert(ai);
  if (aiErr) throw new Error(`AI: ${aiErr.message}`);
  console.log(`  ${ai.length} AI results inserted`);

  console.log("\nSeed complete! 10 incidents, 14 updates, 3 AI results, 10 services.");
}

main().catch((err) => { console.error("FAILED:", err.message); process.exit(1); });
