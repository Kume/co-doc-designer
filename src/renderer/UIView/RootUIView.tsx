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
}

export default class RootUIView extends React.Component<Props, State> {
  constructor(props: Props, context?: any) {
    super(props, context);
    this.state = {
      model: undefined,
      data: undefined,
      editContext: new EditContext()
    };
  }

  componentDidMount() {
    const model = UIModelFactory.create(sampleUIConfig);
    const dataModel = DataModelFactory.createDataModel(sampleDataForUIConfig);

    this.setState({
      model: model,
      data: dataModel
    });
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
        <CurrentComponent
          model={model}
          data={this.state.data}
          onUpdate={(path: DataPath, value: DataModelBase) => {
            console.log('onUpdate', path.elements.toJS(), value);
            this.setState({data: data.setValue(path, value)});
          }}
          onSetEditContext={(context: EditContext) => {
            this.setState({editContext: context});
          }}
          editContext={this.state.editContext}
        />
      );
    }
  }
}