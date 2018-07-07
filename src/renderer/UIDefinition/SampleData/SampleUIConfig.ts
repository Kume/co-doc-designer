import UIDefinitionConfigObject from '../UIDefinitionConfigObject';
import { ContentListUIDefinitionConfigObject } from '../ContentListUIDefinition';
import { SelectUIDefinitionConfigObject } from '../SelectUIDefinition';
import { FormUIDefinitionConfigObject } from '../FormUIDefinition';

export const sampleUIConfig: UIDefinitionConfigObject = {
  type: 'tab',
  key: '',
  label: '',
  contents: [
    <ContentListUIDefinitionConfigObject> {
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
          <SelectUIDefinitionConfigObject> {
            type: 'select',
            key: 'select',
            label: '選択',
            options: [
              '選択肢１',
              '選択肢２',
              '選択肢３'
            ]
          },
          <SelectUIDefinitionConfigObject> {
            type: 'select',
            key: 'select_ref',
            label: '参照選択',
            options: {
              path: 'references/*/name'
            }
          },
          <SelectUIDefinitionConfigObject> {
            type: 'select',
            key: 'select_ref2',
            label: '参照選択2',
            options: {
              path: 'references/*',
              valuePath: 'name',
              labelPath: 'value'
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
              <SelectUIDefinitionConfigObject> {
                type: 'select',
                key: 'select',
                label: '選択',
                options: [
                  '選択肢１',
                  '選択肢２',
                  '選択肢３'
                ]
              },
              <SelectUIDefinitionConfigObject> {
                type: 'select',
                key: 'select_ref',
                label: '参照選択',
                options: {
                  path: 'references/*/name'
                }
              },
              <SelectUIDefinitionConfigObject> {
                type: 'select',
                key: 'select_ref2',
                label: '参照選択2',
                options: {
                  path: 'references/*',
                  valuePath: 'name',
                  labelPath: 'value'
                }
              },
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
    <FormUIDefinitionConfigObject> {
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
      select: '選択肢２',
      select_ref: '参照名１',
      select_ref2: '参照名２',
      table_data: {
        a: {
          text: 'Text Value',
          select: '選択肢２',
          select_ref: '参照名３',
          select_ref2: '参照名５',
        },
        b: {
          text: 'Text Value',
          select: '選択肢１',
          select_ref: '参照名３',
          select_ref2: '参照名５',
        },
        c: {
          text: 'Text Value',
          select: '選択肢２',
          select_ref: '参照名５',
          select_ref2: '参照名４',
        },
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
      table_data: [
      ]
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
  form_value1: 'タブと並列の値１',
  form_value2: 'タブと並列の値ふたつめ',
};
