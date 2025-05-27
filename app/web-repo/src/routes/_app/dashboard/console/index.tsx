import { createFileRoute } from "@tanstack/react-router";
import styles from "./index.module.less";

export const Route = createFileRoute("/_app/dashboard/console/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className={styles["container"]}>分析页</div>;
}
