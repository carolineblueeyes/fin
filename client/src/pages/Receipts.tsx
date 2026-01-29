import { Layout } from "@/components/Layout";
import { ReceiptUploadDialog } from "@/components/ReceiptUploadDialog";
import { useReceipts, useDeleteReceipt } from "@/hooks/use-receipts";
import { format } from "date-fns";
import { 
  Trash2, 
  Search, 
  Receipt as ReceiptIcon, 
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Receipts() {
  const { data: receipts, isLoading } = useReceipts();
  const deleteReceipt = useDeleteReceipt();

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Receipts</h1>
          <p className="text-muted-foreground mt-1">Manage and track your expenses.</p>
        </div>
        <div className="flex gap-2">
          <ReceiptUploadDialog />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search merchants..." className="pl-9 max-w-sm bg-white" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : receipts?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <ReceiptIcon className="h-12 w-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No receipts yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            Upload your first receipt to start tracking your expenses automatically.
          </p>
          <ReceiptUploadDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receipts?.map(receipt => (
            <Card key={receipt.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/60">
              <div className="relative h-32 bg-gray-50 border-b border-border/50 group">
                {receipt.imageUrl ? (
                  <img 
                    src={receipt.imageUrl} 
                    alt="Receipt" 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <ReceiptIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-white/90 shadow-sm backdrop-blur-sm ${
                    receipt.status === 'completed' ? 'text-green-700' :
                    receipt.status === 'failed' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    {receipt.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : 
                     receipt.status === 'failed' ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    <span className="capitalize">{receipt.status}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg leading-tight mb-1">
                      {receipt.merchantName || "Unknown Merchant"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {receipt.date ? format(new Date(receipt.date), "PPP") : "Processing..."}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary block">
                      {receipt.totalAmount ? `$${(receipt.totalAmount / 100).toFixed(2)}` : "--"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border/50 mt-4">
                  <span className="text-xs text-muted-foreground">
                    {Array.isArray(receipt.items) ? (receipt.items as any[]).length : 0} Items
                  </span>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Receipt?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this receipt and its data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteReceipt.mutate(receipt.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
