import { RegisterForm } from './RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-ink">
            Create account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Start writing and sharing your ideas
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
