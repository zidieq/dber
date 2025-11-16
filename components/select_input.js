import { useState } from 'react';
import { Select } from '@arco-design/web-react';
const Option = Select.Option;

/**
 * 它渲染了一个隐藏的输入（其值为所选选项的值），以及一个来自 antd 的 Select 组件，允许用户从选项列表中选择项或创建新的选项。
 * @returns A SelectInput component that takes in a name, options, defaultValue, and width.
 */
export default function SelectInput({ name, options, defaultValue, width }) {
    const [value, setValue] = useState(defaultValue);

    const handleChange = value => {
        setValue(value);
    };

    return (
        <>
            <input type="hidden" name={name} value={value} />
            <Select value={value} onChange={handleChange} style={{ width }} allowCreate>
                {options.map(item => (
                    <Option key={item} value={item}>
                        {item}
                    </Option>
                ))}
            </Select>
        </>
    );
}
