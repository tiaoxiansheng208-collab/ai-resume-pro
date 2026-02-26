import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertCalculation } from "@shared/routes";
import { z } from "zod";

// ============================================
// Calculations Hooks
// ============================================

export function useCalculations() {
  return useQuery({
    queryKey: [api.calculations.list.path],
    queryFn: async () => {
      const res = await fetch(api.calculations.list.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.calculations.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCalculation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCalculation) => {
      const validated = api.calculations.create.input.parse(data);
      const res = await fetch(api.calculations.create.path, {
        method: api.calculations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.calculations.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to save calculation");
      }
      return api.calculations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.calculations.list.path] });
    },
  });
}

// ============================================
// AI Hook
// ============================================

export function useAiAdvisor() {
  return useMutation({
    mutationFn: async (input: z.infer<typeof api.ai.chat.input>) => {
      const validated = api.ai.chat.input.parse(input);
      const res = await fetch(api.ai.chat.path, {
        method: api.ai.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`AI Request Failed: ${errorText}`);
      }

      const data = await res.json();
      return api.ai.chat.responses[200].parse(data);
    },
  });
}
