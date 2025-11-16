import { Checkbox, Form, Input, Space, Tag, Modal, AutoComplete } from '@arco-design/web-react';

import fieldTypes from '@/config/filed_typs';
import graphState from '@/hooks/use-graph-state';
import tableModel from '@/hooks/table-model';

/**
 * 它渲染了一个用于编辑表格的表单。
 * @param props - The props passed to the component.
 * @returns A TableForm component
 */
export default function FieldForm(props) {
    const [form] = Form.useForm();
    const { formChange, onFormChange } = props;
    const { editingField, setEditingField, addingField, setAddingField } =
        graphState.useContainer();
    const { updateTable, removeField } = tableModel();
    const { field, table } = editingField;

    const save = values => {
        const data = { ...field, ...values };
        table.fields = table.fields.map(f => (f.id === data.id ? data : f));
        updateTable(table);
    };

    return table ? (
        <Modal
            title={
                <div style={{ textAlign: 'left' }}>
                    编辑字段：
                    {table ? (
                        <Tag color="arcoblue" style={{ margin: '0 4px' }}>
                            {table.name}
                        </Tag>
                    ) : (
                        ''
                    )}
                </div>
            }
            visible={!!table}
            onCancel={() => {
                if (addingField?.index) {
                    removeField(addingField.table, addingField.index);
                }
                setEditingField({});
            }}
            onOk={() => {
                setAddingField(null);
                form.submit();
            }}
            escToExit={!formChange}
            maskClosable={!formChange}
            afterClose={() => {
                onFormChange(false);
            }}
            afterOpen={() => {
                form.resetFields();
            }}
            style={{ width: 580 }}
            okText="提交"
            cancelText="取消"
        >
            {field && (
                <Form
                    onSubmit={save}
                    form={form}
                    labelAlign="left"
                    requiredSymbol={false}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    onValuesChange={(changedValues, allValues) => {
                        if (!formChange) onFormChange(true);
                    }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space className="table-form-item">
                            <Form.Item
                                label="名称"
                                field="name"
                                initialValue={field.name}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter field name',
                                    },
                                    {
                                        validator: (value, cb) => {
                                            return table.fields
                                                .filter(item => item.id !== field.id)
                                                .find(item => item.name === value)
                                                ? cb('have same name field')
                                                : cb();
                                        },
                                    },
                                ]}
                            >
                                <Input allowClear />
                            </Form.Item>
                            <Form.Item
                                label="中文名"
                                field="nameCh"
                                initialValue={field.nameCh || ''}
                            >
                                <Input allowClear />
                            </Form.Item>
                        </Space>
                        <Space className="table-form-item">
                            <Form.Item
                                label="类型"
                                field="type"
                                initialValue={field.type}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please choose field type',
                                    },
                                ]}
                            >
                                <AutoComplete data={fieldTypes}></AutoComplete>
                            </Form.Item>
                            <Form.Item label="长度" field="valueLength" initialValue="10">
                                <Input allowClear />
                            </Form.Item>
                        </Space>
                        <Space className="table-form-item">
                            <Form.Item label="备注" field="note" initialValue={field.note || ''}>
                                <Input allowClear placeholder="note" />
                            </Form.Item>
                            <Form.Item
                                label="默认值"
                                field="dbdefault"
                                initialValue={field.dbdefault || ''}
                            >
                                <Input allowClear placeholder="default" />
                            </Form.Item>
                        </Space>
                        <Space className="table-form-item">
                            <Form.Item noStyle field="主键" initialValue={field.pk}>
                                <Checkbox defaultChecked={field.pk}>Primary</Checkbox>
                            </Form.Item>
                            <Form.Item noStyle field="唯一" initialValue={field.unique}>
                                <Checkbox defaultChecked={field.unique}>Unique</Checkbox>
                            </Form.Item>
                            <Form.Item noStyle field="非空" initialValue={field.not_null}>
                                <Checkbox defaultChecked={field.not_null}>Not Null</Checkbox>
                            </Form.Item>
                            <Form.Item noStyle field="自增" initialValue={field.increment}>
                                <Checkbox defaultChecked={field.increment}>Increment</Checkbox>
                            </Form.Item>
                        </Space>
                    </Space>
                </Form>
            )}
        </Modal>
    ) : null;
}
