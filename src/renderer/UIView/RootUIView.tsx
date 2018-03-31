import * as React from 'react';
import UIModelBase from '../UIModel/UIModelBase';
import UIViewFactory from './UIViewFactory';
import DataModelBase from '../DataModel/DataModelBase';
import DataPath from '../DataModel/DataPath';
import DataModelFactory from '../DataModel/DataModelFactory';
import EditContext from './EditContext';
import { UIModelFactory } from '../UIModel/UIModelFactory';
import { sampleDataForUIConfig, sampleUIConfig } from '../UIModel/SampleData/SampleUIConfig';

interface Props {}
interface State {
  model: UIModelBase | undefined;
  data: DataModelBase | undefined;
  editContext: EditContext;
  modalContent: React.ReactNode | undefined;
}

export default class RootUIView extends React.Component<Props, State> {
  constructor(props: Props, context?: any) {
    super(props, context);
    this.state = {
      model: UIModelFactory.create(sampleUIConfig),
      data: DataModelFactory.createDataModel(sampleDataForUIConfig),
      editContext: new EditContext(),
      modalContent: undefined
    };
  }

  public setData (model: any, data: any): void {
    this.setState({model, data})
  }

  public render(): React.ReactNode {
    const model = this.state.model;
    const data = this.state.data;
    if (model === undefined || data === undefined) {
      return <div />;
    } else {
      const factory = new UIViewFactory();
      const CurrentComponent = factory.createUIView(model);
      return (
        <div>
          <CurrentComponent
            model={model}
            data={this.state.data}
            onUpdate={(path: DataPath, value: DataModelBase) => {
              console.log('onUpdate', path.toJS(), value);
              const newData = data.setValue(path, value);
              this.setState({data: newData});
              console.log('newdata', newData.toJsonObject());
            }}
            onSetEditContext={(context: EditContext) => {
              this.setState({editContext: context});
            }}
            editContext={this.state.editContext}
            openModal={modalContent => this.setState({modalContent})}
            closeModal={() => this.setState({modalContent: undefined})}
          />
          {this.state.modalContent && (
            <div className="ui-root--modal-background" onClick={() => this.setState({modalContent: undefined})}>
              <div className="ui-root-modal-content" onClick={(e) => e.stopPropagation()}>
                {this.state.modalContent}
              </div>
            </div>
          )}
        </div>
      );
    }
  }
}