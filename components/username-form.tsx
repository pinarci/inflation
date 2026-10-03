import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/loading-button";

export function UsernameForm({
  action,
  message,
}: {
  action: (formData: FormData) => void | Promise<void>;
  message?: string;
}) {
  return (
    <form className="space-y-4" action={action}>
      <div className="space-y-2 text-left">
        <label htmlFor="username" className="text-sm font-medium">Username</label>
        <Input
          id="username"
          type="text"
          name="username"
          placeholder="3–11 letters or numbers"
          pattern="[a-zA-Z0-9]{3,11}"
          minLength={3}
          maxLength={11}
          autoComplete="nickname"
          required
        />
      </div>
      <LoadingButton idleLabel="Enter game" pendingLabel="Joining…" className="w-full" />
      {message ? <p role="alert" className="text-sm text-destructive">{message}</p> : null}
    </form>
  );
}
