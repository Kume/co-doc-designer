import * as React from 'react';
import UIViewFactory from './UIViewFactory';
import DataModelFactory from '../DataModel/DataModelFactory';
import { UIDefinitionFactory } from '../UIDefinition/UIDefinitionFactory';
import UIModel from "../UIModel/UIModel";
import { UIModelManager } from "../UIModel/UIModelManager";
import { ContentListUIDefinitionConfigObject } from "../UIDefinition/ContentListUIDefinition";

const simpleData = DataModelFactory.create({ list: [{name: 'A', type: 'a'}, {name: 'B', type: 'b'}], single: 'singleValue' });
const simpleUIDefinition = UIDefinitionFactory.create({
  type: 'tab',
  key: '',
  title: '',
  contents: [
    {
      type: 'contentList',
      key: 'list',
      title: 'ContentList',
      listIndexKey: 'name',
      content: {
        type: 'form',
        title: '',
        key: '',
        contents: [
          {
            type: 'text',
            key: 'name',
            title: '名前'
          },
          {
            type: 'text',
            key: 'type',
            title: 'タイプ'
          }
        ]
      },
      addFormContent: {
        type: 'text',
        title: '',
        key: '',
        emptyToNull: false
      },
      addFormDefaultValue: ''
    } as ContentListUIDefinitionConfigObject,
    {
      type: 'text',
      title: 'Single',
      key: 'single',
    }
  ]
});

interface Props {}
interface State {
  model: UIModel | undefined;
  modalModel: UIModel | undefined;
}

export default class RootUIView extends React.Component<Props, State> {
  private _manager: UIModelManager = new UIModelManager();

  constructor(props: Props, context?: any) {
    super(props, context);
    this._manager.initialize(simpleData, simpleUIDefinition);
    this._manager.notifyModelChanged = () => {
      this.setState({model: this._manager.model})
    };
    this._manager.notifyModalModelChanged = () => {
      this.setState({modalModel: this._manager.modalModel})
    };
    this.state = {
      model: this._manager.model,
      modalModel: undefined
    };
  }

  get manager(): UIModelManager {
    return this._manager;
  }

  public render(): React.ReactNode {
    const { model, modalModel } = this.state;
    if (model === undefined) {
      return <div />;
    } else {
      const CurrentComponent = UIViewFactory.createUIView(model);
      const ModalContentComponent = modalModel && UIViewFactory.createUIView(modalModel);
      return (
        <div>
          <CurrentComponent
            model={model}
            dispatch={this._manager.dispatch}
          />
          {ModalContentComponent && (
            <div className="ui-root--modal-background" onClick={() => this._manager.closeModal()}>
              <div className="ui-root-modal-content" onClick={(e) => e.stopPropagation()}>
                <ModalContentComponent model={modalModel!} dispatch={this._manager.dispatchForModal} />
                <input type="button" onClick={() => this._manager.onModalSubmit(this._manager.modalData!)} value="submit"/>
              </div>
            </div>
          )}
        </div>
      );
    }
  }
}