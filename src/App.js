import React from 'react';
import { useSet } from './hooks';
// import SCHEMA from './json/basic.json';
import FRWrapper from './FRWrapper';
import { widgets } from './widgets/antd';
import { mapping } from './mapping';
import 'antd/dist/antd.css';
import 'tachyons';
import './App.css';

// const SCHEMA = {
//   propsSchema: {
//     type: 'object',
//     properties: {
//       obj1: {
//         title: '对象',
//         type: 'object',
//       },
//       obj2: {
//         title: '对象',
//         type: 'object',
//         properties: {
//           obj3: {
//             title: '对象',
//             type: 'object',
//             properties: {
//               col: {
//                 title: '颜色选择',
//                 type: 'string',
//                 format: 'color',
//               },
//               img: {
//                 title: '图片展示',
//                 type: 'string',
//                 format: 'image',
//                 'ui:options': {},
//               },
//             },
//           },
//         },
//       },
//     },
//   },
//   uiSchema: {},
//   formData: {},
// };

const SCHEMA = {
  propsSchema: {
    type: 'object',
    properties: {},
  },
  uiSchema: {},
  formData: {},
};

// TODO: formData 不存在的时候会报错：can't find # of undefined

function App() {
  const initGlobal = {
    displayType: 'row',
  };

  const [state, setState] = useSet({
    formData: SCHEMA.formData,
    schema: SCHEMA,
    selected: undefined, // 被选中的$id, 如果object/array的内部，以首字母0标识
    hovering: undefined, // 目前没有用到
    preview: false, // preview = false 是编辑模式
    ...initGlobal, // form-render 的全局props等
  });

  const { schema, formData, preview, selected, hovering, ...rest } = state;

  const { displayType } = rest;
  const showDescIcon = displayType === 'row' ? true : false;

  const onChange = data => {
    setState({ formData: data });
  };

  const onSchemaChange = newSchema => {
    const result = { ...schema, propsSchema: newSchema };
    setState({ schema: result });
  };

  const _mapping = { ...mapping, array: 'listEditor' };

  const globalProps = {
    preview,
    setState,
    simple: false,
    mapping: _mapping,
    widgets,
    selected,
    hovering,
    ...rest,
    showDescIcon,
  };

  const FRProps = {
    schema,
    formData,
    onChange,
    onSchemaChange,
    ...globalProps,
  };

  return <FRWrapper {...FRProps} />;
}

export default App;
