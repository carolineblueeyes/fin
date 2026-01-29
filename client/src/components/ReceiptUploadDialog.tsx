import { useState } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { useCreateReceipt } from "@/hooks/use-receipts";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Receipt, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ReceiptUploadDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createReceipt = useCreateReceipt();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5">
          <UploadCloud className="h-4 w-4" /> Upload Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Scan New Receipt
          </DialogTitle>
          <DialogDescription>
            Upload a photo of your receipt. Our AI will automatically extract merchant, date, and items.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 flex justify-center">
          <ObjectUploader
            onGetUploadParameters={async (file) => {
              try {
                const res = await fetch("/api/uploads/request-url", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: file.name,
                    size: file.size,
                    contentType: file.type,
                  }),
                });
                
                if (!res.ok) throw new Error("Failed to get upload URL");
                
                const { uploadURL } = await res.json();
                return {
                  method: "PUT",
                  url: uploadURL,
                  headers: { "Content-Type": file.type },
                };
              } catch (error) {
                console.error("Upload error:", error);
                throw error;
              }
            }}
            onComplete={async (result) => {
              if (result.successful && result.successful.length > 0) {
                const file = result.successful[0];
                const uploadURL = file.uploadURL;
                
                // We need the object URL or path to save in our DB
                // Since the uploadURL is the signed PUT url, we can derive the public/access URL 
                // However, for this implementation let's assume the backend will construct it or we pass what we have
                // The requirements say: send resulting uploadURL (or object path)
                
                // Usually uppy returns the uploadURL. 
                // Let's grab the actual file URL if possible or just pass the upload URL for now 
                // and let backend handle the extraction or use the Object path logic from the hook
                
                // Re-implementing a simple fetch to get the object path again because Uppy hides it
                // Ideally we'd store it in state from onGetUploadParameters but Uppy API is tricky there.
                // A workaround: Send the file name again to create receipt or assume the hook is better.
                // But ObjectUploader component is forced by requirements.
                
                // Let's try to extract from the uploadURL or pass a placeholder and let backend fix it? 
                // No, that's brittle.
                
                // Better approach: The backend `request-url` returns `objectPath`. 
                // We need to capture that. 
                // The `ObjectUploader` component doesn't easily expose the response from `getUploadParameters` to `onComplete`.
                
                // Simpler fallback: We'll trigger the createReceipt with the `uploadURL` (without query params) 
                // or just the filename if we can trust the backend to find it.
                // Let's pass the full uploadURL and let the backend parse/sanitize it.
                
                // Clean URL to remove query params (signature)
                const cleanUrl = uploadURL ? uploadURL.split('?')[0] : "";

                createReceipt.mutate(
                  { imageUrl: cleanUrl },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      toast({
                        title: "Receipt Uploaded",
                        description: "AI is processing your receipt now.",
                      });
                    },
                    onError: () => {
                      toast({
                        title: "Processing Failed",
                        description: "Could not create receipt record.",
                        variant: "destructive",
                      });
                    }
                  }
                );
              }
            }}
          >
            <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-muted-foreground/25 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer w-full">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-lg">Click to select receipt</p>
                <p className="text-sm text-muted-foreground">or drag and drop here</p>
              </div>
            </div>
          </ObjectUploader>
        </div>
      </DialogContent>
    </Dialog>
  );
}
