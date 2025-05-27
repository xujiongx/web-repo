export interface UserMenuItem {
  key: string;
  title: string;
  path?: string;
}

export const userMenuConfig: UserMenuItem[] = [
  {
    key: 'profile',
    title: '个人中心',
    path: '/user/profile'
  },
  {
    key: 'settings',
    title: '设置',
    path: '/user/settings'
  },
  {
    key: 'logout',
    title: '退出登录'
  }
];