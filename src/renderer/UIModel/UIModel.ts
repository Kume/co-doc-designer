import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';
import DataPath from '../DataModel/Path/DataPath';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { is, Iterable, List, Map as ImmutableMap } from 'immutable';
import { UIModelUpdateDataAction, UIModelUpdateStateAction } from './UIModelActions';
import { UIModelState } from './types';
import DataPathElement from '../DataModel/Path/DataPathElement';

export const stateKey = Symbol('stateKey');

export interface UIModelStateNode
  extends ImmutableMap<CollectionIndex | symbol, UIModelStateNode | UIModelState | undefined> {
  get(key: string | number | symbol): UIModelStateNode | undefined;
  get(key: symbol): UIModelState | undefined;
  setIn(path: any[], value: any): UIModelStateNode;
  setIn(path: Iterable<any, any>, value: any): UIModelStateNode;
}

export type ModelPath = List<CollectionIndex | symbol>;

export interface UIModelPropsObject {
  data: DataModelBase | undefined;
  dataPath: DataPath;
  modelPath: ModelPath;
  focusedPath: DataPath | undefined;
  stateNode: UIModelStateNode | undefined;
  key?: CollectionIndex;
}

interface OptionalUIModelPropsObjectBase extends UIModelPropsObject {
  state: UIModelState;
}

type OptionalUIModelPropsObject = {
  [P in keyof OptionalUIModelPropsObjectBase]?: OptionalUIModelPropsObjectBase[P]
};

export class UIModelProps {
  readonly data: DataModelBase | undefined;
  readonly dataPath: DataPath;
  readonly modelPath: ModelPath;
  readonly focusedPath: DataPath | undefined;
  readonly stateNode: UIModelStateNode | undefined;
  readonly key: CollectionIndex | undefined;

  public static createSimple(optionalProps: OptionalUIModelPropsObject): UIModelProps {
    const stateNode = optionalProps.state
      ? (<UIModelStateNode> ImmutableMap()).set(stateKey, optionalProps.state) as UIModelStateNode
      : optionalProps.stateNode;
    return new UIModelProps({
      data: optionalProps.data || undefined,
      dataPath: optionalProps.dataPath || DataPath.empty,
      modelPath: optionalProps.modelPath || List(),
      focusedPath: optionalProps.focusedPath,
      stateNode,
      key: optionalProps.key
    });
  }

  constructor(props: UIModelPropsObject) {
    this.data = props.data;
    this.dataPath = props.dataPath;
    this.modelPath = props.modelPath;
    this.focusedPath = props.focusedPath;
    this.stateNode = props.stateNode;
    this.key = props.key;
  }

  public fastEquals(another: UIModelProps): boolean {
    return this.data === another.data
      && is(this.dataPath, another.dataPath)
      && is(this.modelPath, another.modelPath)
      && is(this.focusedPath, another.focusedPath)
      && is(this.stateNode, another.stateNode)
      && this.key === another.key;
  }
}

export default abstract class UIModel<D extends UIDefinitionBase = any> {
  public readonly definition: D;
  readonly props: UIModelProps;

  public constructor(definition: D, props: UIModelProps) {
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

export abstract class ContentUIModel<D extends UIDefinitionBase> extends UIModel<D> {
  protected static _factory: (def: UIDefinitionBase, props: UIModelProps, oldModel?: UIModel<any>) => UIModel<any>;

  public static registerFactory(factory: (def: UIDefinitionBase, props: UIModelProps) => UIModel<any>): void {
    if (this._factory) { throw new Error('Factory is already registered.'); }
    this._factory = factory;
  }
}

export abstract class SingleContentUIModel<D extends UIDefinitionBase> extends ContentUIModel<D> {
  public readonly child: UIModel<any> | undefined;

  public static newChild<D extends UIDefinitionBase>(
    newModel: SingleContentUIModel<D>,
    oldModel?: SingleContentUIModel<D>
  ): UIModel<any> | undefined {
    const newProps = newModel.childProps;
    const newDefinition = newModel.childDefinition;
    if (!newProps || !newDefinition) { return undefined; }
    if (oldModel && oldModel.child) {
      if (oldModel.child.definition !== newDefinition || !oldModel.child.props.fastEquals(newProps)) {
        return this._factory(newDefinition, newProps);
      } else {
        return oldModel.child;
      }
    } else {
      return this._factory(newDefinition, newProps);
    }
  }

  public constructor(definition: D, props: UIModelProps, oldModel?: SingleContentUIModel<D>) {
    super(definition, props);
    this.child = SingleContentUIModel.newChild(this, oldModel);
  }

  public adjustState(): UIModelUpdateStateAction[] {
    return this.child ? this.child.adjustState() : [];
  }

  protected abstract get childProps(): UIModelProps | undefined;
  protected abstract get childDefinition(): UIDefinitionBase | undefined;
}

export type UIModelChildren<I> = Map<I, UIModel<any>>;
export abstract class MultiContentUIModel<D extends UIDefinitionBase, I> extends ContentUIModel<D> {
  public readonly children: UIModelChildren<I>;

  public static newChildren<D extends UIDefinitionBase, I>(
    newModel: MultiContentUIModel<D, I>,
    oldModel?: MultiContentUIModel<D, I>
  ): UIModelChildren<I> {
    const indexes = newModel.childIndexes();
    const children: UIModelChildren<I> = new Map();
    if (indexes.length > 0) {
      for (const index of indexes) {
        const oldChild = oldModel && oldModel.children.get(index);
        const newDefinition = newModel.childDefinitionAt(index);
        const newProps = newModel.childPropsAt(index);
        children.set(index, newModel.createChildModel(newProps, newDefinition, oldChild));
      }
    }
    return children;
  }

  protected createChildModel(
    newProps: UIModelProps | undefined,
    definition: UIDefinitionBase,
    oldChild: UIModel | undefined
  ): UIModel {
    if (newProps) {
      if (oldChild) {
        if (oldChild.definition !== definition || !oldChild.props.fastEquals(newProps)) {
          return MultiContentUIModel._factory(definition, newProps, oldChild);
        }
      } else {
        return MultiContentUIModel._factory(definition, newProps);
      }
    } else {
      throw new Error();
    }
    return oldChild;
  }

  public constructor(definition: D, props: UIModelProps, oldModel?: MultiContentUIModel<D, I>) {
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

  protected constructChildDefaultValue(dataPath: DataPath): UIModelUpdateDataAction[] {
    if (!dataPath.isEmptyPath) {
      const childIndex = this.dataPathToChildIndex(dataPath.firstElement);
      if (childIndex !== undefined) {
        const child = this.children.get(childIndex);
        if (child) {
          return child.constructDefaultValue(dataPath.shift());
        }
      }
    }
    return [];
  }

  protected abstract childIndexes(): I[];
  protected abstract childPropsAt(index: I): UIModelProps | undefined;
  protected abstract childDefinitionAt(index: I): UIDefinitionBase;
  protected abstract dataPathToChildIndex(element: DataPathElement): I | undefined;
}
