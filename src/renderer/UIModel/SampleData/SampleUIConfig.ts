import UIModelConfigObject from '../UIModelConfigObject';
import { TextUIModelConfigObject } from '../TextUIModel';
import { ContentListUIModelConfigObject } from '../ContentListUIModel';

export const sampleUIConfig: UIModelConfigObject = {
  type: 'tab',
  key: '',
  title: '',
  contents: [
    <ContentListUIModelConfigObject> {
      type: 'contentList',
      key: 'tables',
      title: 'テーブル設計',
      dataType: 'map',
      listIndexKey: '$key',
      content: {
        type: 'form',
        key: '',
        title: '',
        contents: [
          <TextUIModelConfigObject> {
            type: 'text',
            key: '$key',
            title: '物理名',
            emptyToNull: false
          },
          {
            type: 'text',
            key: 'label',
            title: '論理名'
          },
          {
            type: 'table',
            key: 'columns',
            title: 'カラム',
            contents: [
              {
                type: 'text',
                key: 'name',
                title: '物理名'
              },
              {
                type: 'text',
                key: 'label',
                title: '論理名'
              },
              {
                type: 'checkbox',
                key: 'nullable',
                title: 'Null許可'
              }
            ]
          }
        ]
      },
      addFormContent: {
        type: 'form',
        key: '',
        title: '',
        contents: [
          <TextUIModelConfigObject> {
            type: 'text',
            key: '$key',
            title: '物理名',
            emptyToNull: false
          },
          {
            type: 'text',
            key: 'label',
            title: '論理名'
          }
        ]
      },
      addFormDefaultValue: {}
    },
    {
      type: 'table',
      key: 'messages',
      title: 'メッセージ',
      contents: [
        {
          type: 'text',
          key: 'category',
          title: 'カテゴリー'
        },
        {
          type: 'text',
          key: 'key',
          title: 'キー'
        },
        {
          type: 'text',
          key: 'message',
          title: 'メッセージ'
        }
      ]
    }
  ]
};

export const sampleDataForUIConfig = {
  tables: {
    tasks: {
      label: 'タスク',
      columns: [
        {
          name: 'id',
          label: 'ID',
          type: 'integer',
          length: 11,
          nullable: false,
          autoIncrement: true
        },
        {
          name: 'title',
          label: 'タイトル',
          type: 'varchar',
          length: 255,
          nullable: false
        },
        {
          name: 'content',
          label: '内容',
          type: 'longtext',
          length: 255,
          nullable: false
        },
        {
          name: 'create_user_id',
          label: '作成者ID',
          type: 'integer',
          nullable: false
        }
      ]
    },
    users: {
      label: 'ユーザー',
      columns: [
        {
          name: 'id',
          label: 'ID',
          type: 'integer',
          length: 11,
          nullable: false,
          autoIncrement: true
        },
        {
          name: 'last_name',
          label: '姓',
          type: 'varchar',
          length: 255,
          nullable: false
        }
      ]
    }
  },
  messages: [
    {
      category: '共通',
      key: 'system-error',
      message: '原因不明のエラーが発生しました。システム管理者にお問い合わせください。'
    },
    {
      category: '共通',
      key: 'network-offline',
      message: 'インターネットに接続できません。'
    }
  ]
};
