interface KPIData {
  label: string;
  value: string;
}

export function exportDashboardCSV(incidents: { display_id: string; title: string; priority: string; status: string; service_affected: string | null; assignee: string | null; created_at: string }[], kpis: KPIData[]) {
  const rows: string[] = [];
  const date = new Date().toISOString().slice(0, 10);
  rows.push(`IncidentIQ Dashboard Report - ${date}`);
  rows.push("");
  rows.push("KPI,Value");
  kpis.forEach((k) => rows.push(`"${k.label}","${k.value}"`));
  rows.push("");
  rows.push("Incident ID,Title,Priority,Status,Service,Assignee,Created");
  incidents.forEach((i) => {
    rows.push(`"${i.display_id}","${i.title.replace(/"/g, '""')}","${i.priority}","${i.status}","${i.service_affected ?? ""}","${i.assignee ?? ""}","${i.created_at}"`);
  });
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `incidentiq-report-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
