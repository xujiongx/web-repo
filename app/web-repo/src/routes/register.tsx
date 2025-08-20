import { createFileRoute } from '@tanstack/react-router';
import { RegisterForm } from '../components/auth/RegisterForm';
import { AuthGuard } from '../components/auth/AuthGuard';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <AuthGuard requireAuth={false}>
      <RegisterForm />
    </AuthGuard>
  );
}
