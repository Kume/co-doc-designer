import UIDefinitionConfigObject from '../UIDefinitionConfigObject';
import { TextUIDefinitionConfigObject } from '../TextUIDefinition';
import { ContentListUIDefinitionConfigObject } from '../ContentListUIDefinition';
import { SelectUIDefinitionConfigObject } from '../SelectUIDefinition';

export const sampleUIConfig: UIDefinitionConfigObject = {
  type: 'tab',
  key: '',
  title: '',
  contents: [
    <ContentListUIDefinitionConfigObject> {
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
          {
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
          <SelectUIDefinitionConfigObject> {
            type: 'select',
            key: 'category',
            title: 'カテゴリー',
            options: {
              path: 'functions.*.name'
            }
          },
          {
            type: 'textarea',
            key: 'description',
            title: '説明'
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
                type: 'text',
                key: 'type',
                title: '型',
                options: [
                  'varchar',
                  'int',
                  'smallint',
                  'text',
                  'longtext'
                ],
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
          <TextUIDefinitionConfigObject> {
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
        <SelectUIDefinitionConfigObject> {
          type: 'select',
          key: 'category',
          title: 'カテゴリー',
          options: {
            path: 'functions.*.name'
          }
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
    },
    {
      type: 'table',
      key: 'words',
      title: '用語集',
      contents: [
        {
          type: 'text',
          key: 'category',
          title: 'カテゴリー'
        },
      ]
    },
    <ContentListUIDefinitionConfigObject> {
      type: 'contentList',
      key: 'functions',
      title: '機能',
      dataType: 'map',
      listIndexKey: 'name',
      content: {
        type: 'text',
        key: 'test',
        title: 'test'
      },
      addFormContent: {
        type: 'text',
        key: 'test',
        title: 'test'
      },
      addFormDefaultValue: {}
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
          type: 'int',
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
          name: 'assignee_user_id',
          label: '担当者ID',
          type: 'int',
          length: 11,
        },
        {
          name: 'create_user_id',
          label: '作成者ID',
          type: 'int',
          length: 11,
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
          type: 'int',
          length: 11,
          nullable: false,
          autoIncrement: true
        },
        {
          name: 'name',
          label: '名前',
          type: 'varchar',
          length: 255,
          nullable: false
        },
        {
          name: 'code',
          label: 'コード',
          type: 'varchar',
          length: 255,
          nullable: false
        },
        {
          name: 'email',
          label: 'メールアドレス',
          type: 'varchar',
          length: 255,
          nullable: false
        }
      ]
    }
  },
  messages: [
    {
      category: 'common',
      key: 'system-error',
      message: '原因不明のエラーが発生しました。システム管理者にお問い合わせください。'
    },
    {
      category: 'common',
      key: 'network-offline',
      message: 'インターネットに接続できません。'
    }
  ],
  functions: {
    common: {
      name: '共通機能',
      pages: {}
    },
    user: {
      name: 'ユーザー管理機能',
      pages: {
        create_user_form: {
          type: 'create_form',
          inputs: [
            {

            }
          ]
        }
      }
    },
    task: {
      name: 'タスク管理機能',
      pages: {

      }
    }
  }
};
