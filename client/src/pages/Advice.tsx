import { Layout } from "@/components/Layout";
import { useAdvice, useGenerateAdvice } from "@/hooks/use-advice";
import { Lightbulb, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";

export default function Advice() {
  const { data: adviceList, isLoading } = useAdvice();
  const generateAdvice = useGenerateAdvice();

  return (
    <Layout>
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-indigo-100 font-medium">AI Financial Advisor</span>
            </div>
            <h1 className="text-3xl font-bold font-display mb-2">Smart Insights for You</h1>
            <p className="text-indigo-100 max-w-xl">
              Get personalized recommendations based on your recent spending habits and budgets.
            </p>
          </div>
          <Button 
            onClick={() => generateAdvice.mutate()} 
            disabled={generateAdvice.isPending}
            className="bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-lg whitespace-nowrap"
          >
            {generateAdvice.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Lightbulb className="h-4 w-4 mr-2" />
            )}
            Generate New Insights
          </Button>
        </div>
        
        {/* Abstract shapes background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl" />
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2].map(i => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : adviceList?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No advice generated yet. Click the button above to analyze your finances.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {adviceList?.map(item => (
            <Card key={item.id} className="border-l-4 border-l-violet-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start text-lg">
                  <span className="font-bold">Recommendation</span>
                  <span className="text-xs font-normal text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                    {item.createdAt ? format(new Date(item.createdAt), "MMM d, yyyy") : ""}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
              </CardContent>
              {item.context && (
                <CardFooter className="bg-gray-50/50 py-3 mt-2 border-t text-xs text-muted-foreground">
                  Context: <span className="font-medium ml-1">{item.context}</span>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
