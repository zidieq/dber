import Link from 'next/link';
import { Space, Button, Switch } from '@arco-design/web-react';
import { IconSunFill, IconMoonFill } from '@arco-design/web-react/icon';

import graphState from '@/hooks/use-graph-state';

/**
 * 它渲染了一个导航栏，包含一个指向主页的链接、一个用于添加新图的按钮，以及一个列出导入选项的下拉菜单。
 * @param props - the props passed to the component
 * @returns List Nav component
 */
export default function ListNav({ importGraph, addGraph, addExample }) {
    const { theme, setTheme } = graphState.useContainer();

    return (
        <div className="nav">
            <div>
                <Link href="/" passHref>
                    <strong>DBER</strong> | 表格关联关系可视化
                </Link>
            </div>
            <Space>
                <Button size="small" type="outline" shape="round" onClick={() => importGraph()}>
                    导入
                </Button>
                <Button size="small" type="primary" shape="round" onClick={() => addGraph()}>
                    新增关系图
                </Button>
                <Button size="small" shape="round" onClick={() => addExample()}>
                    Example graph
                </Button>
                <Switch
                    checkedIcon={<IconMoonFill />}
                    uncheckedIcon={<IconSunFill />}
                    checked={theme === 'dark'}
                    onChange={e => setTheme(e ? 'dark' : 'light')}
                />
            </Space>
        </div>
    );
}
