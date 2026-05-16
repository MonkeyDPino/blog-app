import { RegisterForm } from './RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Create account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
