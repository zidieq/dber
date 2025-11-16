import graphState from '@/hooks/use-graph-state';
import { tableWidth, fieldHeight, commentHeight, titleHeight } from '@/config/settings';

const control = 20;
const padding = 5;
const gripWidth = 10;
const gripRadius = gripWidth / 2;
const margin = 0.5;

/**
 * 它接收一个 link 对象，并返回一个表示连接两个表的路径（SVG path）元素
 * @param props - The props object that is passed to the component.
 * {
 *      link,
 *      setEditingLink,
 *  }
 * @returns A svg path is being returned.
 */
export default function LinkPath(props) {
    const { link, setEditingLink } = props;
    const { tableDict, version } = graphState.useContainer();

    const editable = version === 'currentVersion';

    if (!tableDict) return null;

    const { endpoints } = link;
    // 取出源表和目标表
    const [sourceTable, targetTable] = [tableDict[endpoints[0].id], tableDict[endpoints[1].id]];
    // 取出两个字段在表中的索引位置
    const [sourceFieldIndex, targetFieldIndex] = [
        sourceTable.fields.findIndex(field => field.id === endpoints[0].fieldId),
        targetTable.fields.findIndex(field => field.id === endpoints[1].fieldId),
    ];
    // 计算出在y方向上第一个字段中间位置在表格中的相对高度
    const calcHeight = titleHeight + commentHeight + fieldHeight / 2;
    // 计算出源字段：源表y + 字段高度*字段索引 + 第一个字段的相对高度
    const sourceFieldPosition = {
        x: sourceTable.x,
        y: sourceTable.y + sourceFieldIndex * fieldHeight + calcHeight,
        ...endpoints[0],
    };
    // 计算出目标字段
    const targetFieldPosition = {
        x: targetTable.x,
        y: targetTable.y + targetFieldIndex * fieldHeight + calcHeight,
        ...endpoints[1],
    };

    // const [source, target] = [sourceFieldPosition, targetFieldPosition];
    // 根据x坐标排序，确保source在左边，target在右边;或source在上边，target在下边
    const [source, target] = [sourceFieldPosition, targetFieldPosition].sort((a, b) => {
        return a.x - b.x || a.y - b.y;
    });
    // 计算源表的左侧位置
    const sourceLeft = source.x + padding + gripRadius + margin;
    // 计算源表的右侧位置
    const sourceRight = source.x + tableWidth - padding - gripRadius - margin;
    // 默认x坐标为sourceLeft
    let x = sourceLeft;
    // 计算源字段的y坐标
    const y = source.y + gripRadius + margin;
    // 目标表的左侧位置
    const targetLeft = target.x + padding + gripRadius + margin;
    // 目标表的右侧位置
    const targetRight = target.x + tableWidth - padding - gripRadius - margin;
    // 初始化最小距离为sourceLeft和targetLeft的距离
    let minDistance = Math.abs(sourceLeft - targetLeft);
    // 默认目标x坐标为targetLeft
    let x1 = targetLeft;
    // 比较在x方向上的四种可能的连接方式，选择距离最短的一种
    [
        [sourceLeft, targetRight],
        [sourceRight, targetLeft],
        [sourceRight, targetRight],
    ].forEach(items => {
        // 计算当前的距离
        const currentDistance = Math.abs(items[0] - items[1]);
        // 如果当前距离小于最小距离，则更新最小距离和对应的x坐标
        if (currentDistance < minDistance) {
            minDistance = currentDistance;
            x = items[0];
            x1 = items[1];
        }
    });

    const y1 = target.y + gripRadius + margin;
    // 计算中点坐标
    const midX = x1 - (x1 - x) / 2;
    const midY = y1 - (y1 - y) / 2;

    const handlerContextMenu = e => {
        e.preventDefault();
        e.stopPropagation();
    };

    // 构造贝塞尔曲线的路径
    // 移动到起点
    // 第一段贝塞尔曲线：控制点为(x+control,y)和(midX,midY)，终点为(midX,midY)
    // 第二段贝塞尔曲线：控制点为(midX,midY)和(x1-control,y1)，终点为(x1,y1)
    let d = `M ${x} ${y} 
    C ${x + control} ${y} ${midX} ${midY} ${midX} ${midY} 
    C ${midX} ${midY} ${x1 - control} ${y1} ${x1} ${y1}`;

    // 计算标签位置 1-> *  * -> 1
    let foreignObjectPositions = [
        // source标签位置
        {
            x: (x + control + midX) / 2 - 10, // x方向起点的控制点和中点中间的点向上偏移10
            y: (y + midY) / 2 - 10, // y方向起点的控制点中和点中间的点向左偏移10
        },
        // target标签位置
        { x: (x1 - control + midX) / 2 - 10, y: (y1 + midY) / 2 - 10 },
    ];

    // 处理自关联的情况
    if (endpoints[0].id === endpoints[1].id) {
        const factor = (y1 - y) / 50 < 2 ? 2 : (y1 - y) / 50;
        // 默认直接显示在右侧
        // 移动到起点
        // 画直线到达第一个临时点
        // 贝塞尔曲线到达第一个控制点，控制点为(sourceRight+control*factor,y)
        // 第二个控制点为(sourceRight+control*factor,y1)
        // 贝塞尔曲线的终点，即第二个临时点，即终点右侧的、与第一临时点x想同的点
        // 画直线到达终点
        d = `M ${sourceRight} ${y} 
        L ${sourceRight + control} ${y} 
        C ${sourceRight + control * factor} ${y} ${sourceRight + control * factor} ${y1} ${
            sourceRight + control
        } ${y1} 
        L ${sourceRight} ${y1}`;
        // 计算自关联情况下的标签位置
        // source标签位置，直接就是第一个临时点
        // target标签位置，就是终点右侧、与第一个临时点x想同的点
        foreignObjectPositions = [
            { x: sourceRight + control - 10, y: y - 10 },
            { x: targetRight + control - 10, y: y1 - 10 },
        ];
    }

    return (
        <>
            <path d={d} stroke="black" strokeWidth="1" fill="none" className="path-line" />
            <foreignObject
                x={foreignObjectPositions[0].x}
                y={foreignObjectPositions[0].y}
                width={20}
                height={20}
                onMouseDown={() => {
                    if (!editable) return;
                    setEditingLink({
                        linkId: link.id,
                        fieldId: source.fieldId,
                    });
                }}
                onContextMenu={handlerContextMenu}
            >
                <div
                    style={{
                        cursor: editable ? 'pointer' : 'default',
                        userSelect: 'none',
                    }}
                    className="path-label"
                >
                    {source.relation}
                </div>
            </foreignObject>
            <foreignObject
                x={foreignObjectPositions[1].x}
                y={foreignObjectPositions[1].y}
                width={20}
                height={20}
                onMouseDown={() => {
                    if (!editable) return;
                    setEditingLink({
                        linkId: link.id,
                        fieldId: target.fieldId,
                    });
                }}
                onContextMenu={handlerContextMenu}
            >
                <div
                    style={{
                        cursor: editable ? 'pointer' : 'default',
                        userSelect: 'none',
                    }}
                    className="path-label"
                >
                    {target.relation}
                </div>
            </foreignObject>
        </>
    );
}
