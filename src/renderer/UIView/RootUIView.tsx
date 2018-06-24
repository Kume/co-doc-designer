import * as React from 'react';
import UIViewFactory from './UIViewFactory';
import DataModelFactory from '../DataModel/DataModelFactory';
import { UIDefinitionFactory } from '../UIDefinition/UIDefinitionFactory';
import { sampleDataForUIConfig, sampleUIConfig } from '../UIDefinition/SampleData/SampleUIConfig';
import UIModel2Manager from '../UIModel2/UIModel2Manager';
import UIModel2 from '../UIModel2/UIModel2';
import { FormUIDefinitionConfigObject } from '../UIDefinition/FormUIDefinition';

const basicDefinition: FormUIDefinitionConfigObject = {
  type: 'tab',
  key: '',
  title: 'test',
  contents: [
    {
      type: 'form',
      key: 'a',
      title: 'Tab A',
      contents: [
        { type: 'text', key: 'a1', title: 'A1' },
        { type: 'text', key: 'a2', title: 'A2' },
      ]
    },
    {
      type: 'form',
      key: 'b',
      title: 'Tab B',
      contents: [
        { type: 'text', key: 'b1', title: 'B1' },
        { type: 'text', key: 'b2', title: 'B2' },
        { type: 'text', key: 'b3', title: 'B3' },
        { type: 'checkbox', key: 'b4', title: 'B4 チェック' },
        { type: 'select', key: 'b5', title: 'B5 セレクト', options: { path: 'b.*' } } as any,
      ]
    }
  ]
};
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
    const definition = UIDefinitionFactory.create(basicDefinition);
    this._manager = new UIModel2Manager(definition);
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
            applyAction={this._manager.applyActions}
            collectValue={this._manager.collectValue}
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