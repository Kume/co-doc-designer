import UIDefinitionConfig from '../UIDefinitionConfigObject';
import { ContentListUIDefinitionConfig } from '../ContentListUIDefinition';
import { SelectUIDefinitionConfig } from '../SelectUIDefinition';
import { FormUIDefinitionConfig } from '../FormUIDefinition';
import { TableUIDefinitionConfig } from '../TableUIDefinition';

export const sampleUIConfig: UIDefinitionConfig = {
  type: 'tab',
  key: '',
  label: '',
  contents: [
    <ContentListUIDefinitionConfig> {
      type: 'contentList',
      key: 'main',
      label: 'Main',
      dataType: 'map',
      listIndexKey: '$key',
      content: {
        type: 'form',
        key: '',
        label: '',
        contents: [
          {
            type: 'text',
            key: '$key',
            label: 'キー',
            emptyToNull: false
          },
          {
            type: 'text',
            key: 'text',
            label: 'テキスト'
          },
          {
            type: 'number',
            key: 'num',
            label: '数値入力'
          },
          {
            type: 'text',
            key: 'ref_text',
            label: '参照テキスト',
            references: {
              ref2: {
                name: '参照2',
                paths: [
                  {
                    path: '/references2/*',
                    keyPath: '$key',
                    description: '{{name}}'
                  },
                  {
                    path: 'values/*',
                    keyPath: '$key',
                    description: '{{name}}'
                  }
                ]
              },
              table: {
                name: '自己テーブル参照',
                paths: [
                  {
                    path: '../table_data/*',
                    keyPath: '$key',
                    description: '{{text}} {{select}}'
                  }
                ]
              }
            }
          },
          <SelectUIDefinitionConfig> {
            type: 'select',
            key: 'select',
            label: '選択',
            options: [
              '選択肢１',
              '選択肢２',
              '選択肢３'
            ]
          },
          <SelectUIDefinitionConfig> {
            type: 'select',
            key: 'select_ref',
            label: '参照選択',
            options: {
              path: '/references/*/name'
            }
          },
          <SelectUIDefinitionConfig> {
            type: 'select',
            key: 'select_ref2',
            label: '参照選択2',
            options: {
              path: '/references/*',
              valuePath: 'name',
              labelPath: 'value'
            }
          },
          <SelectUIDefinitionConfig> {
            type: 'select',
            key: 'self_ref',
            label: '自己参照',
            options: {
              path: '../../*',
              valuePath: '$key',
              labelPath: 'text'
            }
          },
          <SelectUIDefinitionConfig> {
            type: 'select',
            key: 'select_ref_multi',
            label: '参照複数選択',
            isMulti: true,
            options: {
              path: '/references/*/name'
            }
          },
          {
            type: 'table',
            key: 'table_data',
            label: 'カラム',
            dataType: 'map',
            contents: [
              {
                type: 'text',
                key: '$key',
                label: 'キー',
                emptyToNull: false
              },
              {
                type: 'text',
                key: 'text',
                label: 'テキスト'
              },
              <SelectUIDefinitionConfig> {
                type: 'select',
                key: 'select',
                label: '選択',
                options: [
                  '選択肢１',
                  '選択肢２',
                  '選択肢３'
                ]
              },
              <SelectUIDefinitionConfig> {
                type: 'select',
                key: 'select_ref',
                label: '参照選択',
                options: {
                  path: '/references/*/name'
                }
              },
              <SelectUIDefinitionConfig> {
                type: 'select',
                key: 'select_ref_multi',
                label: '複数選択',
                isMulti: true,
                options: [
                  '選択肢１',
                  '選択肢２',
                  '選択肢３'
                ]
              },
              {
                type: 'text',
                key: 'ref_text',
                label: '参照テキスト',
                references: {
                  ref2: {
                    name: '参照2',
                    paths: [
                      {
                        path: '/references2/*',
                        keyPath: '$key',
                        description: '{{name}}'
                      },
                      {
                        path: 'values/*',
                        keyPath: '$key',
                        description: '{{name}}'
                      }
                    ]
                  },
                  t: {
                    name: '自己テーブル参照',
                    paths: [
                      {
                        path: '../../*',
                        keyPath: '$key',
                        description: '{{text}} {{select}}'
                      }
                    ]
                  },
                  table: {
                    name: '他テーブル参照',
                    paths: [
                      {
                        path: '/main/*/$key',
                        keyPath: '$key',
                        description: '{{text}}'
                      },
                      {
                        path: '/main/[$key]/table_data/*/$key',
                        keyPath: '$key',
                        description: '{{text}} {{select}}'
                      }
                    ]
                  }
                }
              }
            ]
          },
          {
            type: 'tab',
            key: 'tabs',
            label: 'フォーム中タブ',
            keyFlatten: true,
            contents: [
              {
                type: 'text',
                key: 'tab_form_text',
                label: 'テキストタブ'
              },
              {
                type: 'table',
                key: 'tab_table',
                dataType: 'map',
                label: 'テーブルタブ',
                contents: [
                  {
                    type: 'text',
                    key: 'text1',
                    label: 'テキスト１'
                  },
                  {
                    type: 'text',
                    key: 'text2',
                    label: 'テキスト２'
                  }
                ]
              }
            ]
          }
        ]
      },
    },
    {
      type: 'table',
      key: 'references',
      label: '参照値',
      contents: [
        {
          type: 'text',
          key: 'name',
          label: '参照名'
        },
        {
          type: 'text',
          key: 'value',
          label: '参照値'
        }
      ]
    },
    <ContentListUIDefinitionConfig> {
      type: 'contentList',
      key: 'references2',
      label: '参照値2',
      dataType: 'map',
      listIndexKey: '$key',
      content: <FormUIDefinitionConfig> {
        type: 'form',
        key: '',
        label: '',
        contents: [
          {
            type: 'text',
            key: '$key',
            label: 'キー'
          },
          {
            type: 'text',
            key: 'name',
            label: '名前'
          },
          <TableUIDefinitionConfig> {
            type: 'table',
            key: 'values',
            label: '値定義',
            dataType: 'map',
            contents: [
              {
                type: 'text',
                key: '$key',
                label: 'キー'
              },
              {
                type: 'text',
                key: 'name',
                label: '参照名'
              },
              {
                type: 'text',
                key: 'value',
                label: '参照値'
              }
            ]
          }
        ]
      },
    },
    <FormUIDefinitionConfig> {
      type: 'form',
      key: 'unused',
      label: 'フラットフォーム',
      keyFlatten: true,
      contents: [
        {
          type: 'text',
          key: 'form_value1',
          label: '値１'
        },
        {
          type: 'text',
          key: 'form_value2',
          label: '値２'
        }
      ]
    }
  ]
};

export const sampleDataForUIConfig = {
  main: {
    main_rec1: {
      text: 'Text Value',
      num: 99,
      select: '選択肢２',
      select_ref: '参照名１',
      select_ref2: '参照名２',
      table_data: {
        a: {
          text: 'Text Value',
          select: '選択肢２',
          select_ref: '参照名３',
          ref_text: '特に参照のない文章です。'
        },
        b: {
          text: 'Text Value',
          select: '選択肢１',
          select_ref: '参照名３',
          select_ref_multi: [
            '選択肢２',
            '選択肢１'
          ],
          ref_text: 'ここに{{table:c}}参照を埋め込む。'
        },
        c: {
          text: 'Text Value',
          select: '選択肢２',
          select_ref_multi: [
            '無効選択肢'
          ],
          select_ref: '参照名５',
          ref_text: ''
        },
        d: {
          text: 'Text Value',
          select: '選択肢２',
          select_ref: '参照名５'
        },
        e: {
          text: 'Text Value',
          select: '選択肢２',
          select_ref: '参照名５',
          ref_text: '複数行{{ref2:ref_key1.value_key1_1}}に\n参照を\n埋め込んで{{table:d}}います。'
        }
      },
      tab_form_text: 'タブ内のテキスト入力値',
      tab_table: {
        tab_table1: {
          text1: 'Text 1-1',
          text2: 'Text 1-2'
        },
        tab_table2: {
          text1: 'Text 2-1',
          text2: 'Text 2-2'
        }
      }
    },
    main_rec2: {
      text: 'ほとんど何も入力してない',
      table_data: []
    }
  },
  references: [
    {
      name: '参照名１',
      value: '参照名１に対する値です。'
    },
    {
      name: '参照名２',
      value: '参照名２に対する値です。'
    },
    {
      name: '参照名３',
      value: '参照名３に対する値です。'
    },
    {
      name: '参照名４',
      value: '参照名４に対する値です。'
    },
    {
      name: '参照名５',
      value: '参照名５に対する値です。'
    }
  ],
  references2: {
    ref_key1: {
      name: 'Ref Data1',
      values: {
        value_key1_1: {
          name: 'Value1-1',
          value: 1
        },
        value_key1_2: {
          name: 'Value1-2',
          value: 2
        },
        value_key1_3: {
          name: 'Value1-3',
          value: 3
        },
      }
    },
    ref_key2: {
      name: 'Ref Data2',
      values: {
        value_key2_1: {
          name: 'Value2-1',
          value: 4
        },
        value_key2_2: {
          name: 'Value2-2',
          value: 5
        },
      }
    }
  },
  form_value1: 'タブと並列の値１',
  form_value2: 'タブと並列の値ふたつめ',
};
