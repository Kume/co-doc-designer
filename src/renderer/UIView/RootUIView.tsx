import * as React from 'react';
import UIViewFactory from './UIViewFactory';
import DataModelFactory from '../DataModel/DataModelFactory';
import { UIDefinitionFactory } from '../UIDefinition/UIDefinitionFactory';
import UIModel from '../UIModel/UIModel';
import { UIModelManager } from '../UIModel/UIModelManager';
import { sampleDataForUIConfig, sampleUIConfig } from '../UIDefinition/SampleData/SampleUIConfig';
import DataModelBase from '../DataModel/DataModelBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';

interface Props {}
interface State {
  model: UIModel | undefined;
  modalModel: UIModel | undefined;
}

export default class RootUIView extends React.Component<Props, State> {
  private _manager: UIModelManager = new UIModelManager();

  constructor(props: Props, context?: any) {
    super(props, context);
    this._manager.initialize(
      DataModelFactory.create(sampleDataForUIConfig),
      UIDefinitionFactory.create(sampleUIConfig));
    this._manager.notifyModelChanged = () => {
      this.setState({model: this._manager.model});
    };
    this._manager.notifyModalModelChanged = () => {
      this.setState({modalModel: this._manager.modalModel});
    };
    this.state = {
      model: this._manager.model,
      modalModel: undefined
    };
  }

  get manager(): UIModelManager {
    return this._manager;
  }

  public load(definition: UIDefinitionBase, data: DataModelBase) {
    this._manager.initialize(DataModelFactory.create(data), definition);
    this.setState({model: this._manager.model, modalModel: undefined});
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
            collectValue={this._manager.collectValue}
          />
          {ModalContentComponent && (
            <div className="ui-root--modal-background" onClick={() => this._manager.closeModal()}>
              <div className="ui-root-modal-content" onClick={(e) => e.stopPropagation()}>
                <ModalContentComponent
                  model={modalModel!}
                  dispatch={this._manager.dispatchForModal}
                  collectValue={this._manager.collectValue}
                />
                <input
                  type="button"
                  onClick={() => this._manager.onModalSubmit(this._manager.modalData!)}
                  value="submit"
                />
              </div>
            </div>
          )}
        </div>
      );
    }
  }
}