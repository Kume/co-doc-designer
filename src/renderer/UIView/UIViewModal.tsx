import * as React from "react";
import { UIViewBaseState } from "./UIViewBase";
import DataModelBase, { CollectionIndex } from "../DataModel/DataModelBase";
import UIViewFactory from "./UIViewFactory";
import DataPath from "../DataModel/DataPath";
import EditContext from "./EditContext";
import UIModelBase from "../UIModel/UIModelBase";
import ScalarDataModel, { ScalarDataModelType } from "../DataModel/ScalarDataModel";

interface OnComplete {
  (key: CollectionIndex | undefined, data: DataModelBase): void;
}

interface Props {
  model: UIModelBase;
  data: DataModelBase;
  onComolete: OnComplete
}

interface State extends UIViewBaseState {
  data: DataModelBase;
  key: ScalarDataModel | undefined;
  editContext: EditContext;
}

export default class UIViewModal extends React.Component<Props, State> {
  public constructor (props: Props, context?: any) {
    super(props, context);
    this.state = {
      data: this.props.data,
      key: new ScalarDataModel(''),
      editContext: new EditContext()
    };
    this.onComolete = this.onComolete.bind(this);
  }

  private onComolete(): void {
    this.props.onComolete(this.state.key, this.state.data);
  }

  public render() : React.ReactNode {
    const model = this.props.model;
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
            indexInParent={this.state.key}
            onUpdate={(path: DataPath, value: DataModelBase) => {
              console.log('onUpdate on modal', path.elements.toJS(), value);
              if (path.pointsKey && path.elements.size === 0) {
                if (value instanceof ScalarDataModel && value.type === ScalarDataModelType.String) {
                  this.setState({key: value});
                } else {
                  throw new Error('Cannot set value as key')
                }
              } else {
                this.setState({data: data.setValue(path, value)});
              }
            }}
            onSetEditContext={(context: EditContext) => {
              this.setState({editContext: context});
            }}
            editContext={this.state.editContext}
          />
          <input type="button" value="Add" onClick={this.onComolete} />
        </div>
      );
    }
  }
}