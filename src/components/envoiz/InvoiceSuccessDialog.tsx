import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function InvoiceSuccessDialog({
  open,
  onOpenChange,
  invoiceNumber,
  isUpdate,
  onNewInvoice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
  isUpdate?: boolean;
  onNewInvoice?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 rounded-3xl border-hairline p-8 text-center [&>button]:hidden">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-foreground/5">
          <CheckCircle2 className="h-7 w-7 text-foreground" strokeWidth={1.75} />
        </div>
        <h2 className="mt-5 text-[17px] font-semibold tracking-[-0.02em]">
          Invoice {isUpdate ? "updated" : "saved"}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{invoiceNumber}</span> has been{" "}
          {isUpdate ? "updated" : "saved"} successfully.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {!isUpdate && onNewInvoice && (
            <button
              onClick={() => {
                onOpenChange(false);
                onNewInvoice();
              }}
              className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-4 py-2.5 text-[13px] font-medium text-background transition-colors hover:opacity-90"
            >
              Create another invoice
            </button>
          )}
          <button
            onClick={() => onOpenChange(false)}
            className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors ${
              !isUpdate && onNewInvoice
                ? "border border-[#2a2a2a] bg-[#141414] text-foreground hover:bg-[#1f1f1f]"
                : "bg-foreground text-background hover:opacity-90"
            }`}
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
