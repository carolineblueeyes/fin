import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertBudget } from "@shared/schema";
import { z } from "zod";

export function useBudgets() {
  return useQuery({
    queryKey: [api.budgets.list.path],
    queryFn: async () => {
      const res = await fetch(api.budgets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch budgets");
      return api.budgets.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBudget) => {
      // Coerce amount to number if it comes from a string input
      const preparedData = {
        ...data,
        limitAmount: Number(data.limitAmount)
      };
      
      const validated = api.budgets.create.input.parse(preparedData);
      const res = await fetch(api.budgets.create.path, {
        method: api.budgets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.budgets.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create budget");
      }
      return api.budgets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.budgets.list.path] }),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.budgets.delete.path, { id });
      const res = await fetch(url, {
        method: api.budgets.delete.method,
        credentials: "include",
      });
      if (res.status === 404) throw new Error("Budget not found");
      if (!res.ok) throw new Error("Failed to delete budget");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.budgets.list.path] }),
  });
}
