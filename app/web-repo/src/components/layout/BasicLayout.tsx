import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown } from "@arco-design/web-react";
import { IconUser } from "@arco-design/web-react/icon";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { menuConfig, MenuItemType } from "./menuConfig";
import { userMenuConfig } from "./userConfig";
import styles from "./BasicLayout.module.less";

const { Header, Sider, Content } = Layout;
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const renderMenuItem = (menuItem: MenuItemType) => {
    if (menuItem.children) {
      return (
        <SubMenu
          key={menuItem.key}
          title={
            <span>
              <span>{menuItem.icon && <menuItem.icon />}</span>
              <span>{menuItem.title}</span>
            </span>
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
        <span style={{ marginRight: menuItem.icon ? 0 : "10px" }}>
          {menuItem.icon && <menuItem.icon />}
        </span>
        <span>{menuItem.title}</span>
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
      // 处理退出登录逻辑
      console.log("logout");
    }
  };

  return (
    <Layout className={styles.layout}>
      <Sider
        collapsed={collapsed}
        collapsible
        trigger={null}
        className={styles.sider}
      >
        <div className={styles.logo}>{collapsed ? "AD" : "Arco Admin"}</div>
        <Menu
          defaultSelectedKeys={["home"]}
          defaultOpenKeys={["dashboard"]}
          className={styles.menu}
          hasCollapseButton
          onCollapseChange={toggleCollapse}
        >
          {menuConfig.map(renderMenuItem)}
        </Menu>
      </Sider>
      <Layout>
        <Header className={styles.header}>
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
            >
              <Avatar className={styles.avatar} size={32}>
                <IconUser />
              </Avatar>
            </Dropdown>
          </div>
        </Header>
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
