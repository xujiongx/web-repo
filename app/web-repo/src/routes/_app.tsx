import BasicLayout from "@/components/layout/BasicLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BasicLayout></BasicLayout>;
}
