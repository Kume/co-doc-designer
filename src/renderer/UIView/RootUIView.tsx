import * as React from 'react';
import UIViewFactory from './UIViewFactory';
import DataModelFactory from '../DataModel/DataModelFactory';
import { UIDefinitionFactory } from '../UIDefinition/UIDefinitionFactory';
import { sampleDataForUIConfig, sampleUIConfig } from '../UIDefinition/SampleData/SampleUIConfig';
import UIModelManager from '../UIModel/UIModelManager';
import UIModel from '../UIModel/UIModel';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import DataModelBase from '../DataModel/DataModelBase';

interface Props {
  // definition: UIDefinitionBase;
}

interface State {
  model: UIModel | undefined;
  modalModel: UIModel | undefined;
}

export default class RootUIView extends React.Component<Props, State> {
  private _manager: UIModelManager;

  constructor(props: Props, context?: any) {
    super(props, context);
    const definition = UIDefinitionFactory.create(sampleUIConfig);
    this._manager = new UIModelManager(definition, DataModelFactory.create(sampleDataForUIConfig));
    this._manager.notifyModelChanged = () => {
      this.setState({model: this._manager.rootUIModel});
    };
    this._manager.notifyModalModelChanged = () => {
      this.setState({modalModel: this._manager.modalUIModel});
    };
    this.state = {
      model: this._manager.rootUIModel,
      modalModel: undefined
    };
  }

  public load(definition: UIDefinitionBase, data: DataModelBase): void {
    this._manager = new UIModelManager(definition, data);
    this._manager.notifyModelChanged = () => {
      this.setState({model: this._manager.rootUIModel});
    };
    this._manager.notifyModalModelChanged = () => {
      this.setState({modalModel: this._manager.modalUIModel});
    };
    this.setState({ model: this._manager.rootUIModel });
  }

  get manager(): UIModelManager {
    return this._manager;
  }

  public render(): React.ReactNode {
    const { model } = this.state;
    if (model === undefined) {
      return <div />;
    } else {
      const CurrentComponent = UIViewFactory.createUIView(model);
      // const ModalContentComponent = modalModel && UIViewFactory.createUIView(modalModel);
      return (
        <div>
          <CurrentComponent
            model={model}
            applyAction={this._manager.applyActions}
            collectValue={this._manager.collectValue}
            focus={this._manager.focus}
          />
          {/*{ModalContentComponent && (*/}
            {/*<div className="ui-root--modal-background" onClick={() => this._manager.closeModal()}>*/}
              {/*<div className="ui-root-modal-content" onClick={(e) => e.stopPropagation()}>*/}
                {/*<ModalContentComponent*/}
                  {/*model={modalModel!}*/}
                  {/*dispatch={this._manager.dispatchForModal}*/}
                  {/*collectValue={this._manager.collectValue}*/}
                {/*/>*/}
                {/*<input*/}
                  {/*type="button"*/}
                  {/*onClick={() => this._manager.onModalSubmit(this._manager.modalData!)}*/}
                  {/*value="submit"*/}
                {/*/>*/}
              {/*</div>*/}
            {/*</div>*/}
          {/*)}*/}
        </div>
      );
    }
  }
}