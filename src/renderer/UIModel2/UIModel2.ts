import DataModelBase from '../DataModel/DataModelBase';
import DataPath from '../DataModel/Path/DataPath';
import EditContext from '../UIModel/EditContext';
import UIModelState from '../UIModel/UIModelState';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';

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

export default abstract class UIModel2<D extends UIDefinitionBase> {
  protected readonly _definition: D;
  readonly props: UIModel2Props;

  protected constructor(definition: D, props: UIModel2Props) {
    this._definition = definition;
    this.props = props;
  }

  public abstract update(props: UIModel2Props): UIModel2<D>;
}
