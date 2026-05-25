import LoginForm from "@/components/forms/LoginForm";

export const metadata = {
  title: "Login — LM Prime System",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-2xl font-semibold text-primary-700">
            LM Prime System
          </h1>
          <p className="text-sm text-neutral-500">
            Faca login para acessar o sistema
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
