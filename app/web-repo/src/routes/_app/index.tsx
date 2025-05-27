import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: HomeComponent,
  beforeLoad: () => {
    throw redirect({ to: "/home" });
  },
});

function HomeComponent() {
  return null;
}
