import Link from 'next/link';
import { Button, Space, Popconfirm, Input, Switch, Dropdown, Menu } from '@arco-design/web-react';
import { IconSunFill, IconMoonFill, IconLeft } from '@arco-design/web-react/icon';

import graphState from '@/hooks/use-graph-state';
import tableModel from '@/hooks/table-model';

/**
 * 它渲染了一个导航栏，包含标题、保存按钮、示例按钮、清空按钮、导出按钮和一个名称输入框。
 * @param props - the props passed to the component
 * @returns A Nav component that takes in a title, a save button, a demo button, a clear button, an export button
 */
export default function Nav({ setShowModal, setShowDrawer }) {
    const { name, setName, theme, setTheme, setTableDict, setLinkDict, version } =
        graphState.useContainer();
    const { updateGraph, addTable, applyVersion } = tableModel();

    if (version !== 'currentVersion') {
        return (
            <nav className="nav">
                <div className="nav-title">版本历史: {name}</div>
                <Space>
                    <Button
                        onClick={() => updateGraph()}
                        type="primary"
                        status="success"
                        shape="round"
                        style={{ marginLeft: 8 }}
                    >
                        Apply Select Version
                    </Button>
                    <Button
                        onClick={() => applyVersion('currentVersion')}
                        shape="round"
                        style={{ marginLeft: 8 }}
                    >
                        Exit Logs View
                    </Button>
                </Space>
            </nav>
        );
    }

    return (
        <nav className="nav">
            <Space>
                <Link href="/graphs" passHref>
                    <IconLeft style={{ fontSize: 20 }} />
                </Link>
                <Input
                    type="text"
                    value={name}
                    onChange={value => setName(value)}
                    style={{ width: '240px' }}
                />
            </Space>

            <Space>
                <Button
                    size="small"
                    type="primary"
                    status="success"
                    shape="round"
                    onClick={() => updateGraph()}
                >
                    Save
                </Button>
                <Dropdown
                    position="bottom"
                    droplist={
                        <Menu>
                            <Menu.Item
                                key="add"
                                className="context-menu-item"
                                onClick={() => addTable()}
                            >
                                添加表格
                            </Menu.Item>
                            <Menu.Item
                                key="import"
                                className="context-menu-item"
                                onClick={() => setShowModal('import')}
                            >
                                导入表格
                            </Menu.Item>
                        </Menu>
                    }
                >
                    <Button size="small" type="primary" shape="round">
                        新增表格
                    </Button>
                </Dropdown>
                <Popconfirm
                    title="确定要删除所有表格吗?"
                    okText="是"
                    cancelText="否"
                    position="br"
                    onOk={() => {
                        setTableDict({});
                        setLinkDict({});
                    }}
                >
                    <Button size="small" type="outline" status="danger" shape="round">
                        清空
                    </Button>
                </Popconfirm>
                <Button
                    size="small"
                    type="outline"
                    shape="round"
                    onClick={() => setShowModal('export')}
                >
                    导出
                </Button>
                <Button
                    size="small"
                    type="secondary"
                    shape="round"
                    onClick={() => setShowDrawer('logs')}
                >
                    版本历史
                </Button>
                <Switch
                    checkedIcon={<IconMoonFill />}
                    uncheckedIcon={<IconSunFill />}
                    checked={theme === 'dark'}
                    onChange={e => setTheme(e ? 'dark' : 'light')}
                />
            </Space>
        </nav>
    );
}
