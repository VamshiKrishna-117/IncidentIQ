import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./use-toast";
import type { Incident, IncidentUpdate, AIResult } from "@/types";
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
          display_id: "INC-...",
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast.success("Incident created successfully");
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-updates", incidentId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to post update");
    },
  });
}
