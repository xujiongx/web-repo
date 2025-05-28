import {
  IconHome,
  IconDashboard,
  IconSettings,
} from "@arco-design/web-react/icon";

export interface MenuItemType {
  key: string;
  title: string;
  icon?: any;
  children?: MenuItemType[];
  path?: string;
}

export const menuConfig: MenuItemType[] = [
  {
    key: "home",
    title: "首页",
    icon: IconHome,
    path: "/",
  },
  {
    key: "dashboard",
    title: "仪表盘",
    icon: IconDashboard,
    children: [
      {
        key: "console",
        title: "分析页",
        path: "/dashboard/console",
      },
      {
        key: "monitor",
        title: "监控页",
        path: "/dashboard/monitor",
      },
    ],
  },
  {
    key: "settings",
    title: "系统设置",
    icon: IconSettings,
    path: "/settings",
  },
];
