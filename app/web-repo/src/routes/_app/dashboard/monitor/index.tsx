import { createFileRoute } from "@tanstack/react-router";
import styles from "./index.module.less";

export const Route = createFileRoute("/_app/dashboard/monitor/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className={styles["container"]}>监控页</div>;
}
