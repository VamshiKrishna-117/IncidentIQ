"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useCreateIncident } from "@/hooks/use-incidents";
import { createIncidentSchema, type CreateIncidentInput } from "@/lib/validations";

export function CreateIncidentModal() {
  const { createIncidentOpen, setCreateIncidentOpen } = useUIStore();
  const createIncident = useCreateIncident();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateIncidentInput>({
    resolver: zodResolver(createIncidentSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      priority: undefined,
      reporter_name: "",
    },
  });

  const priority = watch("priority");

  const onSubmit = (data: CreateIncidentInput) => {
    createIncident.mutate(data, {
      onSuccess: () => {
        reset();
        setCreateIncidentOpen(false);
      },
    });
  };

  return (
    <Modal
      open={createIncidentOpen}
      onOpenChange={(open) => {
        if (!open) reset();
        setCreateIncidentOpen(open);
      }}
      title="Create Incident"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="title"
          label="Incident Title *"
          placeholder="title"
          error={errors.title?.message}
          {...register("title")}
        />

        <Input
          id="reporter_name"
          label="Reporter *"
          placeholder="person"
          error={errors.reporter_name?.message}
          {...register("reporter_name")}
        />

        <Select
          label="Priority Level *"
          placeholder="Select priority..."
          value={priority ?? ""}
          onValueChange={(val) => setValue("priority", val as CreateIncidentInput["priority"], { shouldValidate: true })}
          error={errors.priority?.message}
        >
          <SelectItem value="P0">P0 - Critical Outage (All Hands)</SelectItem>
          <SelectItem value="P1">P1 - Severe Degradation</SelectItem>
          <SelectItem value="P2">P2 - Partial Impact</SelectItem>
          <SelectItem value="P3">P3 - Minor Issue / Informational</SelectItem>
        </Select>

        <Textarea
          id="description"
          label="Description / Symptoms"
          placeholder="Describe the incident..."
          rows={4}
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              reset();
              setCreateIncidentOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" loading={createIncident.isPending}>
            Create Incident
          </Button>
        </div>
      </form>
    </Modal>
  );
}
