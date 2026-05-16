import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign in</h1>
        <Suspense
          fallback={
            <div className="h-48 animate-pulse rounded-lg bg-neutral-100" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
