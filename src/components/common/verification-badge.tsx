import { BadgeCheck, CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Verification status indicator. "Verified" is only rendered for listings a
 * moderator actually verified; the tooltip text explains what it means.
 */
export function VerificationBadge({
  verified,
  className,
}: {
  verified: boolean;
  className?: string;
}): React.ReactNode {
  if (verified) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-semibold text-white",
          className,
        )}
        title="জনসেবা BD টিম কর্তুক তথ্য যাচাই করা হয়েছে"
      >
        <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
        যাচাইকৃত
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-medium text-ink-muted",
        className,
      )}
      title="এই তালিকাটি এখনো জনসেবা BD টিম কর্তুক যাচাই করা হয়নি"
    >
      <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
      যাচাইকৃত নয়
    </span>
  );
}
