import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';
import DataPath from '../DataModel/Path/DataPath';
import EditContext from '../UIModel/EditContext';
import UIModelState from '../UIModel/UIModelState';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { is } from 'immutable';

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

  public fastEquals(another: UIModel2Props): boolean {
    return this.data === another.data
      && is(this.path, another.path)
      && is(this.editContext, another.editContext)
      && this.state === another.state;
  }
}

export default abstract class UIModel2<D extends UIDefinitionBase> {
  public readonly definition: D;
  readonly props: UIModel2Props;

  public constructor(definition: D, props: UIModel2Props) {
    this.definition = definition;
    this.props = props;
  }
}

export type UIModelChildren = Map<CollectionIndex, UIModel2<any>>;
export abstract class MultiContentUIModel<D extends UIDefinitionBase> extends UIModel2<D> {
  protected static _factory: (def: UIDefinitionBase, props: UIModel2Props) => UIModel2<any>;
  public readonly children: UIModelChildren;

  public static registerFactory(factory: (def: UIDefinitionBase, props: UIModel2Props) => UIModel2<any>): void {
    if (this._factory) { throw new Error('Factory is already registered.'); }
    this._factory = factory;
  }

  public static newChildren<D extends UIDefinitionBase>(
    newModel: MultiContentUIModel<D>, oldModel?: MultiContentUIModel<D>): UIModelChildren {
    const indexes = newModel.childIndexes();
    const children: UIModelChildren = new Map();
    if (indexes.length > 0) {
      for (const index of indexes) {
        const oldChild = oldModel && oldModel.children.get(index);
        let newChild = oldChild;
        const newDefinition = newModel.childDefinitionAt(index);
        const newProps = newModel.childPropsAt(index);
        if (oldChild) {
          if (oldChild.definition !== newDefinition) {
            newChild = this._factory(newDefinition, newProps);
          } else if (!oldChild.props.fastEquals(newProps)) {
            newChild = this._factory(newDefinition, newProps);
          }
        } else {
          newChild = this._factory(newDefinition, newProps);
        }
        children.set(index, newChild!);
      }
    }
    return children;
  }

  public constructor(definition: D, props: UIModel2Props, oldModel?: MultiContentUIModel<D>) {
    super(definition, props);
    this.children = MultiContentUIModel.newChildren(this, oldModel);
  }

  protected abstract childIndexes(): CollectionIndex[];
  protected abstract childPropsAt(index: CollectionIndex): UIModel2Props;
  protected abstract childDefinitionAt(index: CollectionIndex): UIDefinitionBase;
}
