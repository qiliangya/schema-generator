import React, { useRef } from 'react';
import { useSet, useStorageState } from './hooks';
import copyTOClipboard from 'copy-text-to-clipboard';
import Left from './Left';
import Right from './Right';
import {
  flattenSchema,
  idToSchema,
  combineSchema,
  dataToFlatten,
  flattenToData,
  getSaveNumber,
} from './utils';
import { Ctx, PropsCtx, InnerCtx } from './context';
// import SCHEMA from './json/basic.json';
import FR from './FR';
import { Modal, Input, message } from 'antd';
import { Button } from 'antd';
import 'antd/dist/antd.css';
import 'tachyons';
import './App.css';

const { TextArea } = Input;

const Wrapper = ({
  simple = true,
  schema,
  formData,
  onChange,
  onSchemaChange,
  ...globalProps
}) => {
  const [local, setLocal] = useSet({
    showModal: false,
    showModal2: false,
    showModal3: false,
    schemaForImport: '',
  });

  const [saveList, setSaveList] = useStorageState([]);

  const saveNameRef = useRef();

  const {
    preview,
    setState,
    mapping,
    widgets,
    selected,
    hovering,
    ...rest
  } = globalProps;
  const _schema = combineSchema(schema.propsSchema, schema.uiSchema);
  const flatten = flattenSchema(_schema);
  const flattenWithData = dataToFlatten(flatten, formData);
  // console.log(flatten);

  const onFlattenChange = newFlatten => {
    const newSchema = idToSchema(newFlatten);
    const newData = flattenToData(newFlatten);
    // 判断只有schema变化时才调用，一般需求的用户不需要
    if (onSchemaChange) {
      onSchemaChange(newSchema);
    }
    onChange(newData);
  };

  const onItemChange = (key, value) => {
    flattenWithData[key] = value;
    onFlattenChange(flattenWithData);
  };

  const toggleModal = () => setLocal({ showModal: !local.showModal });
  const toggleModal2 = () => setLocal({ showModal2: !local.showModal2 });
  const toggleModal3 = () => setLocal({ showModal3: !local.showModal3 });

  const clearSchema = () => {
    setState({
      schema: {
        propsSchema: {
          type: 'object',
          properties: {},
        },
      },
      formData: {},
      selected: undefined,
    });
  };

  const onTextareaChange = e => {
    setLocal({ schemaForImport: e.target.value });
  };

  const importSchema = () => {
    try {
      const info = JSON.parse(local.schemaForImport);
      const { propsSchema, ...rest } = info;
      setState({
        schema: {
          propsSchema,
        },
        formData: {},
        selected: undefined,
        ...rest,
      });
    } catch (error) {
      message.info('格式不对哦，请重新尝试'); // 可以加个格式哪里不对的提示
    }
    toggleModal2();
  };

  let displaySchemaString = '';

  try {
    const propsSchema = idToSchema(flattenWithData, '#', true);
    displaySchemaString = JSON.stringify({ propsSchema, ...rest }, null, 2);
  } catch (error) {}

  const copySchema = () => {
    copyTOClipboard(displaySchemaString);
    message.info('复制成功');
  };

  const saveSchema = () => {
    try {
      const text = saveNameRef.current.state.value;
      const name = 'save' + getSaveNumber();
      const schema = idToSchema(flattenWithData, '#', true);
      setSaveList([...saveList, { text, name, schema }]);
      toggleModal3();
    } catch (error) {
      message.error('保存失败');
    }
  };

  // TODO: flatten是频繁在变的，应该和其他两个函数分开
  const store = {
    flatten: flattenWithData,
    onFlattenChange,
    onItemChange,
    ...globalProps,
  };

  if (simple) {
    return (
      <Ctx.Provider value={setState}>
        <PropsCtx.Provider value={globalProps}>
          <InnerCtx.Provider value={store}>
            <FR preview={true} />
          </InnerCtx.Provider>
        </PropsCtx.Provider>
      </Ctx.Provider>
    );
  }

  return (
    <Ctx.Provider value={setState}>
      <PropsCtx.Provider value={globalProps}>
        <InnerCtx.Provider value={store}>
          <div className="flex vh-100 overflow-hidden">
            <Left saveList={saveList} setSaveList={setSaveList} />
            <div className="mid-layout pr2">
              <div className="mv3 mh1">
                <Button
                  className="mr2"
                  onClick={() => {
                    setState({ preview: !preview, selected: '#' });
                  }}
                >
                  {preview ? '开始编辑' : '最终展示'}
                </Button>
                <Button className="mr2" onClick={clearSchema}>
                  清空
                </Button>
                <Button className="mr2" onClick={toggleModal3}>
                  保存
                </Button>
                <Button className="mr2" onClick={toggleModal2}>
                  导入
                </Button>
                <Button type="primary" className="mr2" onClick={toggleModal}>
                  导出schema
                </Button>
              </div>
              <FR preview={preview} />
            </div>
            <Right globalProps={rest} />
            <Modal
              visible={local.showModal}
              onOk={copySchema}
              onCancel={toggleModal}
              okText="复制"
              cancelText="取消"
            >
              <div className="mt3">
                <TextArea
                  style={{ fontSize: 12 }}
                  value={displaySchemaString}
                  autoSize={{ minRows: 10, maxRows: 30 }}
                />
              </div>
            </Modal>
            <Modal
              visible={local.showModal2}
              okText="导入"
              cancelText="取消"
              onOk={importSchema}
              onCancel={toggleModal2}
            >
              <div className="mt3">
                <TextArea
                  style={{ fontSize: 12 }}
                  value={local.schemaForImport}
                  placeholder="贴入需要导入的schema，模样可点击导出schema参考"
                  onChange={onTextareaChange}
                  autoSize={{ minRows: 10, maxRows: 30 }}
                />
              </div>
            </Modal>
            <Modal
              visible={local.showModal3}
              okText="确定"
              cancelText="取消"
              onOk={saveSchema}
              onCancel={toggleModal3}
            >
              <div className="mt4 flex items-center">
                <div style={{ width: 100 }}>保存名称：</div>
                <div style={{ width: 280 }}>
                  <Input
                    defaultValue={'存档' + getSaveNumber()}
                    ref={saveNameRef}
                  />
                </div>
              </div>
            </Modal>
          </div>
        </InnerCtx.Provider>
      </PropsCtx.Provider>
    </Ctx.Provider>
  );
};

Wrapper.defaultProps = {
  labelWidth: 120,
};

export default Wrapper;
