import { nanoid } from 'nanoid';
import { Notification } from '@arco-design/web-react';

import { saveGraph, getGraph, delLogs } from '@/engine/db';
import {
    tableWidth,
    tableMarginLeft,
    tableMarginTop,
    tableRowNumbers,
    fieldHeight,
    titleHeight,
    commentHeight,
} from '@/config/settings';
import graphState from './use-graph-state';

const tableModel = () => {
    const {
        id,
        tableList,
        tableDict,
        setTableDict,
        linkDict,
        setLinkDict,
        box,
        name,
        setName,
        version,
        setVersion,
        setEditingTable,
        setEditingField,
        setAddingField,
    } = graphState.useContainer();

    const updateGraph = async () => {
        try {
            await saveGraph({ id, name, tableDict, linkDict, box });
            if (version !== 'currentVersion') {
                await delLogs(version);
            }

            setVersion('currentVersion');
            Notification.success({
                title: 'Save success',
            });
        } catch (e) {
            console.log(e);
            Notification.error({
                title: 'Save failed',
            });
        }
    };
    // 计算新表格位置
    const calcXY = (start, tables = tableList) => {
        // 默认添加在最后
        const index = start || Math.max(1, tables.length);
        let x, y;
        // 第一行第一个表格
        if (!tables.length) {
            x = box.x + 196 + 72;
            y = box.y + 72;
        } else {
            // 计算新表格位置
            if (index < tableRowNumbers) {
                // 同一行
                const lastTable = tables[index - 1];
                // 在最后一个表格后面添加
                x = lastTable.x + tableWidth + tableMarginLeft;
                // 同一行y不变
                y = lastTable.y;
            } else {
                // 换行添加
                const lastTable = tables[index - tableRowNumbers];
                // 在上一行对应位置表格下面添加
                const { fields } = lastTable;
                // x不变
                x = lastTable.x;
                // y增加表格高度
                y =
                    lastTable.y +
                    fields.length * fieldHeight +
                    titleHeight +
                    commentHeight +
                    tableMarginTop;
            }
        }
        return [x, y];
    };

    /**
     * 它会创建一个新的表对象，并将其添加到表字典中。
     */
    const addTable = () => {
        const [x, y] = calcXY();
        const id = nanoid();
        const newTable = {
            [id]: {
                id,
                name: `Table Name ${tableList.length + 1}`,
                x,
                y,
                fields: [
                    {
                        id: nanoid(),
                        name: 'id',
                        type: 'INTEGER',
                        pk: true,
                        increment: true,
                    },
                ],
            },
        };
        // setTableDict(state => ({ ...state, ...newTable }));
        setEditingTable(newTable[id]);
    };

    /**
     *它接受一个表对象，用新的表对象更新tableDict状态，然后将editingTable状态设置为null
     */
    const updateTable = table => {
        if (table) {
            setTableDict(state => {
                return {
                    ...state,
                    [table.id]: {
                        ...state[table.id],
                        ...table,
                    },
                };
            });
        }
        setLinkDict(state => {
            const newState = { ...state };
            // 删除所有连接到当前表格已删除字段的链接
            Object.keys(newState).forEach(key => {
                if (
                    newState[key].endpoints.some(
                        endpoint =>
                            endpoint.id === table.id &&
                            !table.fields.some(field => field.id === endpoint.fieldId)
                    )
                )
                    delete newState[key];
            });
            return newState;
        });
        setEditingTable(null);
        setEditingField({});
    };

    /**
     * 它从表字典中删除表，并删除连接到该表的所有链接
     */
    const removeTable = tableId => {
        // 从表字典中删除表
        setTableDict(state => {
            const newState = { ...state };
            delete newState[tableId];
            return newState;
        });
        // 删除连接到该表的所有链接
        setLinkDict(state => {
            const newState = { ...state };
            Object.keys(newState).forEach(key => {
                if (newState[key].endpoints.find(endpoint => endpoint.id === tableId)) {
                    delete newState[key];
                }
            });
            return newState;
        });

        setEditingTable(null);
    };
    // 在表格中添加字段
    const addField = (table, index) => {
        table.fields.splice(index + 1, 0, {
            id: nanoid(),
            name: '新字段' + table.fields.length,
            nameCh: '',
            type: 'VARCHAR',
            valueLength: '10',
            unique: false,
        });
        // 更新表格状态
        setTableDict(state => {
            return {
                ...state,
                [table.id]: {
                    ...state[table.id],
                    ...table,
                },
            };
        });
        setEditingField({ field: table.fields[index + 1], table });
        setAddingField({ index: index + 1, table });
    };
    // 从表格中删除字段
    const removeField = (table, index) => {
        const [filed] = table.fields.splice(index, 1);
        // 更新表格状态
        setTableDict(state => {
            return {
                ...state,
                [table.id]: {
                    ...state[table.id],
                    ...table,
                },
            };
        });
        // 删除连接到该字段的所有链接
        setLinkDict(state => {
            const newState = { ...state };
            Object.keys(newState).forEach(key => {
                if (newState[key].endpoints.find(endpoint => endpoint.fieldId === filed.id)) {
                    delete newState[key];
                }
            });
            return newState;
        });
    };
    // 应用版本
    const applyVersion = async item => {
        let graph;
        if (item === 'currentVersion') {
            graph = await getGraph(id);
            graph.updatedAt = 'currentVersion';
            setVersion('currentVersion');
        } else {
            graph = item;
            setVersion(item.id);
        }

        setTableDict(graph.tableDict);
        setLinkDict(graph.linkDict);
        setName(graph.name);
    };

    return {
        updateGraph,
        addTable,
        updateTable,
        removeTable,
        addField,
        removeField,
        applyVersion,
        calcXY,
    };
};

export default tableModel;
