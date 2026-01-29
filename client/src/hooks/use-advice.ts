import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useAdvice() {
  return useQuery({
    queryKey: [api.advice.list.path],
    queryFn: async () => {
      const res = await fetch(api.advice.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch advice");
      return api.advice.list.responses[200].parse(await res.json());
    },
  });
}

export function useGenerateAdvice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.advice.generate.path, {
        method: api.advice.generate.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate advice");
      return api.advice.generate.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.advice.list.path] }),
  });
}
