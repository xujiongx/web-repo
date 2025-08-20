import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown } from "@arco-design/web-react";
import { IconUser } from "@arco-design/web-react/icon";
import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { menuConfig, type MenuItemType } from "./menuConfig";
import { userMenuConfig } from "./userConfig";
import { useAuthStore } from "../../stores/authStore"; // 新增：导入认证store
import styles from "./BasicLayout.module.less";

const { Header, Sider, Content } = Layout;
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore(); // 新增：获取用户信息和登出方法

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const getActiveKey = (pathname: string) => {
    const findKey = (items: MenuItemType[]): string | undefined => {
      for (const item of items) {
        if (item.path === pathname) return item.key;
        if (item.children) {
          const childKey = findKey(item.children);
          if (childKey) return childKey;
        }
      }
    };
    return findKey(menuConfig) || "home";
  };

  const renderMenuItem = (menuItem: MenuItemType) => {
    if (menuItem.children) {
      return (
        <SubMenu
          key={menuItem.key}
          title={
            <div className={styles.menuTitle}>
              {menuItem.icon ? (
                <menuItem.icon className={styles.menuIcon} />
              ) : (
                <span className={styles.menuIcon} />
              )}
              <span>{menuItem.title}</span>
            </div>
          }
        >
          {menuItem.children.map(renderMenuItem)}
        </SubMenu>
      );
    }
    return (
      <MenuItem
        key={menuItem.key}
        onClick={() =>
          menuItem.path &&
          navigate({
            to: menuItem.path,
          })
        }
      >
        <div className={styles.menuTitle}>
          {menuItem.icon ? (
            <menuItem.icon className={styles.menuIcon} />
          ) : (
            <span className={styles.menuIcon} />
          )}
          <span>{menuItem.title}</span>
        </div>
      </MenuItem>
    );
  };

  const handleUserMenuClick = (key: string) => {
    const menuItem = userMenuConfig.find((item) => item.key === key);
    if (menuItem?.path) {
      navigate({
        to: menuItem.path,
      });
    } else if (key === "logout") {
      // 修改：实现真正的退出登录逻辑
      logout(); // 调用store中的logout方法清除认证状态
      navigate({ to: "/login" }); // 跳转到登录页
    }
  };

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>Arco Admin</div>
        </div>
        <div className={styles.headerRight}>
          <Dropdown
            droplist={
              <Menu onClickMenuItem={handleUserMenuClick}>
                {userMenuConfig.map((item) => (
                  <MenuItem key={item.key}>{item.title}</MenuItem>
                ))}
              </Menu>
            }
            position="br"
            trigger={["click"]}
          >
            <Avatar className={styles.avatar} size={32}>
              {/* 修改：显示用户名首字母或默认图标 */}
              {user?.name ? user.name.charAt(0).toUpperCase() : <IconUser />}
            </Avatar>
          </Dropdown>
        </div>
      </Header>
      <Layout className={styles.pageContainer}>
        <Sider
          collapsed={collapsed}
          collapsible
          className={styles.sider}
          onCollapse={toggleCollapse}
        >
          <Menu
            selectedKeys={[getActiveKey(location.pathname)]}
            defaultSelectedKeys={["home"]}
            className={styles.menu}
          >
            {menuConfig.map(renderMenuItem)}
          </Menu>
        </Sider>
        <Content className={styles.content}>
          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
