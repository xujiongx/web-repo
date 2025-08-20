import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '../components/auth/LoginForm';
import { AuthGuard } from '../components/auth/AuthGuard';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <LoginForm />
    </AuthGuard>
  );
}
