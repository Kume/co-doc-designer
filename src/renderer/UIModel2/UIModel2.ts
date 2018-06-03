import DataModelBase from '../DataModel/DataModelBase';
import DataPath from '../DataModel/DataPath';
import EditContext from '../UIModel/EditContext';
import UIModelState from '../UIModel/UIModelState';

export interface UIModel2PropsObject {
  data: DataModelBase | undefined;
  path: DataPath;
  editContext: EditContext | undefined;
  state: UIModelState | undefined;
}

export class UIModel2Props {
  readonly data: DataModelBase | undefined;
  readonly path: DataPath;
  readonly editContext: EditContext | undefined;
  readonly state: UIModelState | undefined;

  constructor(props: UIModel2PropsObject) {
    this.data = props.data;
    this.path = props.path;
    this.editContext = props.editContext;
    this.state = props.state;
  }
}

export default abstract class UIModel2 {
  public abstract update(): UIModel2;
}
