import { getCurrentUser } from "@/lib/auth/dal";
import { AuthButtons } from "./auth-buttons";
import { UserMenu } from "./user-menu";

/**
 * Session-aware auth cluster. Must be rendered inside <Suspense> so the
 * header's static shell is not blocked by the cookie/session lookup.
 */
export async function AuthCluster(): Promise<React.ReactNode> {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return <AuthButtons />;
  return (
    <UserMenu
      user={{ id: user.id, name: user.name, role: user.role as never }}
    />
  );
}

/** Matches AuthButtons' width so the header does not shift while streaming. */
export function AuthClusterFallback(): React.ReactNode {
  return (
    <div className="hidden items-center gap-2 lg:flex" aria-hidden="true">
      <div className="h-9 w-20 animate-pulse rounded-lg bg-surface-muted" />
      <div className="h-9 w-24 animate-pulse rounded-lg bg-surface-muted" />
    </div>
  );
}
