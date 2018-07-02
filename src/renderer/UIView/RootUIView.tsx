import * as React from 'react';
import UIViewFactory from './UIViewFactory';
import DataModelFactory from '../DataModel/DataModelFactory';
import { UIDefinitionFactory } from '../UIDefinition/UIDefinitionFactory';
import { sampleDataForUIConfig, sampleUIConfig } from '../UIDefinition/SampleData/SampleUIConfig';
import UIModel2Manager from '../UIModel2/UIModel2Manager';
import UIModel2 from '../UIModel2/UIModel2';

interface Props {
  // definition: UIDefinitionBase;
}

interface State {
  model: UIModel2 | undefined;
  modalModel: UIModel2 | undefined;
}

export default class RootUIView extends React.Component<Props, State> {
  private _manager: UIModel2Manager;

  constructor(props: Props, context?: any) {
    super(props, context);
    const definition = UIDefinitionFactory.create(sampleUIConfig);
    this._manager = new UIModel2Manager(definition, DataModelFactory.create(sampleDataForUIConfig));
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

  get manager(): UIModel2Manager {
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