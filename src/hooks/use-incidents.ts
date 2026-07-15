import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./use-toast";
import type { Incident, IncidentUpdate, AIResult, NotificationType } from "@/types";
import type { CreateIncidentInput, CreateUpdateInput } from "@/lib/validations";

function getClient() {
  return createClient();
}

export function useIncidents() {
  return useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const { data, error } = await getClient()
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Incident[];
    },
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ["incident", id],
    queryFn: async () => {
      const { data, error } = await getClient()
        .from("incidents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Incident;
    },
    enabled: !!id,
  });
}

export function useIncidentUpdates(incidentId: string) {
  return useQuery({
    queryKey: ["incident-updates", incidentId],
    queryFn: async () => {
      const { data, error } = await getClient()
        .from("incident_updates")
        .select("*")
        .eq("incident_id", incidentId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as IncidentUpdate[];
    },
    enabled: !!incidentId,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (input: CreateIncidentInput) => {
      const { data, error } = await getClient()
        .from("incidents")
        .insert({
          display_id: `INC-${Date.now()}`,
          title: input.title,
          description: input.description,
          priority: input.priority,
          reporter_name: input.reporter_name,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Incident;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast.success("Incident created successfully");
      getClient().from("notifications").insert({
        title: `New ${data.priority} incident`,
        message: data.title,
        type: "incident_created" as NotificationType,
        incident_id: data.id,
      }).then().catch(() => {});
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create incident");
    },
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Incident> & { id: string }) => {
      const { data, error } = await getClient()
        .from("incidents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Incident;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", data.id] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update incident");
    },
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getClient()
        .from("incidents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast.success("Incident deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete incident");
    },
  });
}

export function useDeleteUpdate(incidentId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (updateId: string) => {
      const { error } = await getClient()
        .from("incident_updates")
        .delete()
        .eq("id", updateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-updates", incidentId] });
      toast.success("Update deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete update");
    },
  });
}

export function useCreateUpdate(incidentId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (input: CreateUpdateInput) => {
      const { data, error } = await getClient()
        .from("incident_updates")
        .insert({
          incident_id: incidentId,
          message: input.message,
          author_name: input.author_name,
        })
        .select()
        .single();

      if (error) throw error;
      return data as IncidentUpdate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["incident-updates", incidentId] });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      getClient().from("notifications").insert({
        title: `New update from ${data.author_name}`,
        message: data.message,
        type: "update_posted" as NotificationType,
        incident_id: incidentId,
      }).then().catch(() => {});
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to post update");
    },
  });
}
