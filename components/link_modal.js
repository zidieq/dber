import { Modal, Button, Space, Popconfirm } from '@arco-design/web-react';

import graphState from '@/hooks/use-graph-state';

/**
 * 它渲染了一个模态窗口，允许用户更改链接的关系或删除该链接
 * @param props - { editingLink, setEditingLink, setLinkDict }
 * @returns  Modal component
 */
export default function LinkModal(props) {
    const { editingLink, setEditingLink } = props;
    const { setLinkDict } = graphState.useContainer();

    const changeRelation = relation => {
        const { linkId, fieldId } = editingLink;
        setLinkDict(state => {
            return {
                ...state,
                [linkId]: {
                    ...state[linkId],
                    endpoints: state[linkId].endpoints.map(endpoint => {
                        if (endpoint.fieldId === fieldId) {
                            return {
                                ...endpoint,
                                relation,
                            };
                        }
                        if (relation === '*' && endpoint.fieldId !== fieldId) {
                            return {
                                ...endpoint,
                                relation: '1',
                            };
                        }
                        return endpoint;
                    }),
                },
            };
        });
        setEditingLink(null);
    };

    const removeLink = () => {
        const { linkId } = editingLink;
        setLinkDict(state => {
            delete state[linkId];
            return { ...state };
        });
        setEditingLink(null);
    };

    return (
        <Modal
            title="Link"
            visible={!!editingLink}
            onCancel={() => setEditingLink(null)}
            footer={null}
            autoFocus={false}
            focusLock={false}
        >
            <Space
                style={{
                    width: '100%',
                    justifyContent: 'space-between',
                }}
            >
                <Space>
                    <label>Change relation:</label>
                    <Button
                        type="primary"
                        onClick={() => {
                            changeRelation('1');
                        }}
                    >
                        1
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            changeRelation('*');
                        }}
                    >
                        *
                    </Button>
                </Space>
                <Popconfirm
                    title="确定要删除该关联关系吗?"
                    onOk={() => {
                        removeLink();
                    }}
                >
                    <Button>Delete Path</Button>
                </Popconfirm>
            </Space>
        </Modal>
    );
}
