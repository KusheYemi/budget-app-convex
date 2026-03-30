interface FormErrorProps {
  error: string | null;
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;
  return (
    <div role="alert" aria-live="polite" className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
      {error}
    </div>
  );
}
