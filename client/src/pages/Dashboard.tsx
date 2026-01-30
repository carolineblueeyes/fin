import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { useReceipts } from "@/hooks/use-receipts";
import { useBudgets } from "@/hooks/use-budgets";
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Activity,
  ArrowRight,
  Receipt
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { Link } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: receipts, isLoading: receiptsLoading } = useReceipts();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();

  if (receiptsLoading || budgetsLoading) {
    return (
      <Layout>
        <div className="h-[60vh] flex items-center justify-center">
          <Activity className="h-8 w-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  // Calculate totals
  const totalSpending = receipts?.reduce((sum, r) => sum + (r.totalAmount || 0), 0) || 0;
  const recentReceipts = receipts?.slice(0, 5) || [];
  
  // Prepare chart data (spending by day for last 7 days)
  const chartData = receipts?.slice(0, 7).map(r => ({
    date: r.date ? format(new Date(r.date), "MMM d") : "Unknown",
    amount: (r.totalAmount || 0) / 100
  })).reverse() || [];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here's your financial overview for this month.</p>
        </div>
        <div className="text-sm font-medium bg-white px-4 py-2 rounded-full border border-border shadow-sm">
          {format(new Date(), "MMMM d, yyyy")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Spending" 
          value={`$${(totalSpending / 100).toFixed(2)}`} 
          icon={<DollarSign className="h-6 w-6" />}
          trend="+12%"
          trendUp={false} // Red means spending went up
        />
        <StatCard 
          title="Active Budgets" 
          value={String(budgets?.length || 0)} 
          icon={<CreditCard className="h-6 w-6" />}
        />
        <StatCard 
          title="Recent Activity" 
          value={`${recentReceipts.length} txns`} 
          icon={<Activity className="h-6 w-6" />}
          className="bg-primary text-primary-foreground"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Spending Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Recent Receipts</h3>
            <Link href="/receipts">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4 flex-1">
            {recentReceipts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
                <Receipt className="h-10 w-10 mb-2 opacity-20" />
                <p>No receipts yet</p>
              </div>
            ) : (
              recentReceipts.map(receipt => (
                <div key={receipt.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{receipt.merchantName || "Unknown Merchant"}</p>
                      <p className="text-xs text-muted-foreground">
                        {receipt.date ? format(new Date(receipt.date), "MMM d, yyyy") : "Processing..."}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {receipt.totalAmount ? `$${(receipt.totalAmount / 100).toFixed(2)}` : "--"}
                    </p>
                    <p className={`text-xs capitalize ${
                      receipt.status === 'completed' ? 'text-green-600' : 
                      receipt.status === 'failed' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {receipt.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
