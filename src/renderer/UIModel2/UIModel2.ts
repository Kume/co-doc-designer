import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';
import DataPath from '../DataModel/Path/DataPath';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { is, Iterable, List, Map as ImmutableMap } from 'immutable';
import { UIModelUpdateDataAction, UIModelUpdateStateAction } from './UIModel2Actions';
import { UIModel2State } from './types';

export const stateKey = Symbol('stateKey');

export interface UIModelStateNode
  extends ImmutableMap<CollectionIndex | symbol, UIModelStateNode | UIModel2State | undefined> {
  get(key: string | number): UIModelStateNode | undefined;
  get(key: symbol): UIModel2State | undefined;
  setIn(path: any[], value: any): UIModelStateNode;
  setIn(path: Iterable<any, any>, value: any): UIModelStateNode;
}

export interface UIModel2PropsObject {
  data: DataModelBase | undefined;
  dataPath: DataPath;
  modelPath: List<CollectionIndex>;
  focusedPath: DataPath | undefined;
  stateNode: UIModelStateNode | undefined;
}

interface OptionalUIModel2PropsObjectBase extends UIModel2PropsObject {
  state: UIModel2State;
}

type OptionalUIModel2PropsObject = {
  [P in keyof OptionalUIModel2PropsObjectBase]?: OptionalUIModel2PropsObjectBase[P]
};

export class UIModel2Props {
  readonly data: DataModelBase | undefined;
  readonly dataPath: DataPath;
  readonly modelPath: List<CollectionIndex>;
  readonly focusedPath: DataPath | undefined;
  readonly stateNode: UIModelStateNode | undefined;

  public static createSimple(optionalProps: OptionalUIModel2PropsObject): UIModel2Props {
    const stateNode = optionalProps.state
      ? (<UIModelStateNode> ImmutableMap()).set(stateKey, optionalProps.state) as UIModelStateNode
      : optionalProps.stateNode;
    return new UIModel2Props({
      data: optionalProps.data || undefined,
      dataPath: optionalProps.dataPath || DataPath.empty,
      modelPath: optionalProps.modelPath || List(),
      focusedPath: optionalProps.focusedPath,
      stateNode
    });
  }

  constructor(props: UIModel2PropsObject) {
    this.data = props.data;
    this.dataPath = props.dataPath;
    this.modelPath = props.modelPath;
    this.focusedPath = props.focusedPath;
    this.stateNode = props.stateNode;
  }

  public fastEquals(another: UIModel2Props): boolean {
    return this.data === another.data
      && is(this.dataPath, another.dataPath)
      && is(this.modelPath, another.modelPath)
      && is(this.focusedPath, another.focusedPath)
      && is(this.stateNode, another.stateNode);
  }
}

export default abstract class UIModel2<D extends UIDefinitionBase = any> {
  public readonly definition: D;
  readonly props: UIModel2Props;

  public constructor(definition: D, props: UIModel2Props) {
    this.definition = definition;
    this.props = props;
  }

  public adjustState(): UIModelUpdateStateAction[] {
    return [];
  }

  public constructDefaultValue(dataPath: DataPath): UIModelUpdateDataAction[] {
    return [];
  }
}

export abstract class ContentUIModel<D extends UIDefinitionBase> extends UIModel2<D> {
  protected static _factory: (def: UIDefinitionBase, props: UIModel2Props) => UIModel2<any>;

  public static registerFactory(factory: (def: UIDefinitionBase, props: UIModel2Props) => UIModel2<any>): void {
    if (this._factory) { throw new Error('Factory is already registered.'); }
    this._factory = factory;
  }
}

export abstract class SingleContentUIModel<D extends UIDefinitionBase> extends ContentUIModel<D> {
  public readonly child: UIModel2<any>;

  public static newChild<D extends UIDefinitionBase>(
    newModel: SingleContentUIModel<D>,
    oldModel?: SingleContentUIModel<D>
  ): UIModel2<any> {
    const newProps = newModel.childProps;
    const newDefinition = newModel.childDefinition;
    if (oldModel) {
      if (oldModel.child.definition !== newDefinition || !oldModel.child.props.fastEquals(newProps)) {
        return this._factory(newDefinition, newProps);
      } else {
        return oldModel.child;
      }
    } else {
      return this._factory(newDefinition, newProps);
    }
  }

  public constructor(definition: D, props: UIModel2Props, oldModel?: SingleContentUIModel<D>) {
    super(definition, props);
    this.child = SingleContentUIModel.newChild(this, oldModel);
  }

  public adjustState(): UIModelUpdateStateAction[] {
    return this.child.adjustState();
  }

  protected abstract get childProps(): UIModel2Props;
  protected abstract get childDefinition(): UIDefinitionBase;
}

export type UIModelChildren = Map<CollectionIndex, UIModel2<any>>;
export abstract class MultiContentUIModel<D extends UIDefinitionBase> extends ContentUIModel<D> {
  public readonly children: UIModelChildren;

  public static newChildren<D extends UIDefinitionBase>(
    newModel: MultiContentUIModel<D>,
    oldModel?: MultiContentUIModel<D>
  ): UIModelChildren {
    const indexes = newModel.childIndexes();
    const children: UIModelChildren = new Map();
    if (indexes.length > 0) {
      for (const index of indexes) {
        const oldChild = oldModel && oldModel.children.get(index);
        let newChild = oldChild;
        const newDefinition = newModel.childDefinitionAt(index);
        const newProps = newModel.childPropsAt(index);
        if (oldChild) {
          if (oldChild.definition !== newDefinition || !oldChild.props.fastEquals(newProps)) {
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

  public adjustState(): UIModelUpdateStateAction[] {
    let actions: UIModelUpdateStateAction[] = [];
    this.children.forEach(child => {
      actions = actions.concat(child!.adjustState());
    });
    return actions;
  }

  protected abstract childIndexes(): CollectionIndex[];
  protected abstract childPropsAt(index: CollectionIndex): UIModel2Props;
  protected abstract childDefinitionAt(index: CollectionIndex): UIDefinitionBase;
}
