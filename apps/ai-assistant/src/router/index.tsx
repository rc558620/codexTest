import {
  createBrowserRouter,
  Outlet,
  RouteObject,
  RouterProvider,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Login from '@/pages/Login';
import routerConfig from './config';
import { getToken, clearToken } from 'ythUtils/common';
import YTHLocalization from 'ythUtils/localization';

import { ExpandOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@yth/icons';
import { Button, Divider, Dropdown, Input, Layout, Menu } from 'antd';
import { useEffect, useRef, useState } from 'react';

const { Header, Sider } = Layout;

const languageList = YTHLocalization.getLanguageOptions();

interface LanguageOption {
  label: string;
  value: string;
  key: string;
}

// 定义扩展类型
interface ComponentWithMobile {
  default: React.ComponentType & {
    Mobile?: React.ComponentType;
  };
}

const RouterLayout = () => {
  const { setLocale, language } = YTHLocalization.useLocal();
  const location = useLocation();
  const navigate = useNavigate();

  const ref = useRef<HTMLDivElement>(null);

  const [collapsed, setCollapsed] = useState(true);

  // 菜单标题映射
  const menuTitleMap: Record<string, string> = {
    Bulk: '大宗商品',
    FinancialReports: '财报',
    Custom: '自定义',
    CustomCard: '自定义卡片',
    Login: '登录',
    PageTest: '页面测试',
  };

  // 隐藏路由列表（不在菜单中显示的路由）
  const hiddenRoutes = ['AssistantHistory'];

  const [menus, setMenus] = useState(
    Object.keys(routerConfig)
      .filter((key) => !hiddenRoutes.includes(key)) // 过滤掉隐藏路由
      .map((key) => ({
        key: `/${key}`,
        label: menuTitleMap[key] || routerConfig[key as keyof typeof routerConfig].name,
      })),
  );

  useEffect(() => {
    if (!getToken()) {
      // navigate('/login');
    }
  }, [navigate]);

  return location.pathname === '/login' ? (
    <Outlet />
  ) : (
    <Layout style={{ width: '100vw', height: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        collapsedWidth={0}
        style={{ background: 'white' }}
      >
        <div style={{ padding: '16px 4px' }}>
          <Input
            placeholder={'搜索菜单'}
            allowClear
            onChange={(e) => {
              const val = e.target.value;
              const result = Object.keys(routerConfig)
                .filter(
                  (x) =>
                    routerConfig[x as keyof typeof routerConfig].name.includes(val) ||
                    x.toLowerCase().includes(val.toLowerCase()),
                )
                .map((x) => ({
                  key: `/${x}`,
                  label: routerConfig[x as keyof typeof routerConfig].name,
                }));
              setMenus(result);
            }}
          />
        </div>
        <Divider style={{ margin: '10px 0' }} />
        <Menu
          items={menus}
          selectedKeys={[location.pathname]}
          onClick={({ key }) => {
            navigate(key);
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{ padding: 0, background: '#007fba', display: 'flex', alignItems: 'center' }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              color: 'white',
            }}
          />
          <Button
            type="text"
            icon={<ExpandOutlined />}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              color: 'white',
            }}
            onClick={() => ref.current?.requestFullscreen()}
          />
          <div style={{ flex: 1 }} />
          <Dropdown
            menu={{
              items: languageList,
              onClick: ({ key }: { key: string }) => {
                if (key !== language) {
                  setLocale(key);
                  window.location.reload();
                }
              },
            }}
          >
            <div
              style={{
                color: 'white',
                marginLeft: 'auto',
                cursor: 'pointer',
              }}
            >
              {(languageList as LanguageOption[])?.find((x) => x.key === language)?.label ??
                '简体中文'}
            </div>
          </Dropdown>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              color: 'white',
              marginLeft: 'auto',
            }}
            onClick={() => {
              clearToken();
              navigate('/login');
            }}
          />
        </Header>
        {/* <Content
          style={{
            margin: location.pathname === '/Bulk' ? 0 : '24px 16px',
            padding: location.pathname === '/Bulk' ? 0 : 24,
            minHeight: 280,
            overflow: 'auto',
          }}
        > */}
        <div ref={ref} style={{ width: '100%', height: 'calc(100% - 64px)', overflow: 'auto' }}>
          <Outlet />
        </div>
        {/* </Content> */}
      </Layout>
    </Layout>
  );
};

const dynamicRouter = Object.keys(routerConfig).map((x) => {
  const item = routerConfig[x as keyof typeof routerConfig];
  return {
    path: `/${x}`,
    lazy: async () => {
      const ele = (await item.component()) as ComponentWithMobile;
      return { Component: window.isMobile ? ele.default.Mobile || ele.default : ele.default };
    },
  };
}) as RouteObject[];

const router = createBrowserRouter([
  {
    path: '/',
    element: <RouterLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      ...dynamicRouter,
    ],
  },
]);
const Router = () => <RouterProvider router={router} />;

export default YTHLocalization.withLocal(Router, {}, YTHLocalization.getLanguage() as any);
