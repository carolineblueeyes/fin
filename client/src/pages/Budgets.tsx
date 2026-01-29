import { Layout } from "@/components/Layout";
import { CreateBudgetDialog } from "@/components/CreateBudgetDialog";
import { useBudgets, useDeleteBudget } from "@/hooks/use-budgets";
import { useReceipts } from "@/hooks/use-receipts";
import { Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Budgets() {
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: receipts } = useReceipts();
  const deleteBudget = useDeleteBudget();

  // Helper to calculate spend for a category (naive string matching for demo)
  const getSpendForCategory = (category: string) => {
    if (!receipts) return 0;
    // In a real app, this would be more robust or done on backend
    // Here we check if any item in a receipt has this category or receipt merchant matches?
    // Let's assume budgets are general categories and we sum all receipts for now as a demo
    // Or simpler: Mock calculation based on random factor for demo purposes if no category field on receipts
    
    // Better: Match logic. 
    // Since receipts have items with categories, we should sum those.
    // For this MVP, let's just return a mock percentage to show the UI visually.
    
    // Actually, let's try to match items.
    let total = 0;
    receipts.forEach(r => {
      if (Array.isArray(r.items)) {
        (r.items as any[]).forEach(item => {
          if (item.category?.toLowerCase() === category.toLowerCase()) {
            total += (item.price || 0);
          }
        });
      }
    });
    return total;
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground mt-1">Set limits and track your spending goals.</p>
        </div>
        <CreateBudgetDialog />
      </div>

      {budgetsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : budgets?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-border">
          <Wallet className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No budgets set</h3>
          <p className="text-muted-foreground mb-6">Create your first budget to start saving.</p>
          <CreateBudgetDialog />
        </div>
      ) : (
        <div className="grid gap-6">
          {budgets?.map(budget => {
            const spent = getSpendForCategory(budget.category); // In cents
            const limit = budget.limitAmount; // In cents
            const percent = Math.min(Math.round((spent / limit) * 100), 100);
            const isOverBudget = spent > limit;

            return (
              <div key={budget.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{budget.category}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{budget.period} Limit</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteBudget.mutate(budget.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className={isOverBudget ? "text-destructive" : "text-primary"}>
                      ${(spent / 100).toFixed(2)} spent
                    </span>
                    <span className="text-muted-foreground">
                      ${(limit / 100).toFixed(2)} limit
                    </span>
                  </div>
                  <Progress 
                    value={percent} 
                    className={`h-3 ${isOverBudget ? "bg-red-100 [&>div]:bg-red-500" : "[&>div]:bg-primary"}`} 
                  />
                  <p className="text-xs text-right text-muted-foreground pt-1">
                    {isOverBudget ? "Over budget!" : `${100 - percent}% remaining`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
