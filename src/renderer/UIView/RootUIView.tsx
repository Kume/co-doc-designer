import * as React from 'react';
import UIViewFactory from './UIViewFactory';
import DataModelFactory from '../DataModel/DataModelFactory';
import { UIDefinitionFactory } from '../UIDefinition/UIDefinitionFactory';
import UIModel from "../UIModel/UIModel";
import { UIModelManager } from "../UIModel/UIModelManager";
import { ContentListUIDefinitionConfigObject } from "../UIDefinition/ContentListUIDefinition";

const simpleData = DataModelFactory.create(['first', 'second']);
const simpleUIDefinition = UIDefinitionFactory.create({
  type: 'contentList',
  key: '',
  title: '',
  content: {
    type: 'text',
    title: '',
    key: '',
    emptyToNull: false
  },
  addFormContent: {
    type: 'text',
    title: '',
    key: '',
    emptyToNull: false
  },
  addFormDefaultValue: 'test'
} as ContentListUIDefinitionConfigObject);

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