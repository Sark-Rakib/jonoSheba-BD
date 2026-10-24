"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteListingAction } from "@/actions/listings";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

export function DeleteListingButton({
  listingId,
  name,
}: {
  listingId: string;
  name: string;
}): React.ReactNode {
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      title="তালিকা মুছে ফেলুন"
      message={`“${name}” স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি ফেরানো যাবে না।`}
      confirmLabel="মুছে ফেলুন"
      cancelLabel="বাতিল"
      onConfirm={() => {
        startTransition(() => {
          void deleteListingAction(listingId).catch(() => {
            toast.error("মুছে ফেলা যায়নি — আবার চেষ্টা করুন");
          });
        });
      }}
    >
      <button type="button" className="btn-danger px-3 py-1.5 text-xs" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        মুছে ফেলুন
      </button>
    </ConfirmDialog>
  );
}
