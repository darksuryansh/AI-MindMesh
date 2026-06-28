import { Button } from "@/components/ui/Button";

export function ErrorNote({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm">
      <p className="font-medium text-danger">Something went wrong</p>
      <p className="mt-1 text-muted">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
