import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';
import DataPath from '../DataModel/Path/DataPath';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { is, Iterable, List, Map as ImmutableMap } from 'immutable';
import { UIModelUpdateDataAction, UIModelUpdateStateAction } from './UIModel2Actions';
import { UIModel2State } from './types';
import DataPathElement from '../DataModel/Path/DataPathElement';

export const stateKey = Symbol('stateKey');

export interface UIModelStateNode
  extends ImmutableMap<CollectionIndex | symbol, UIModelStateNode | UIModel2State | undefined> {
  get(key: string | number | symbol): UIModelStateNode | undefined;
  get(key: symbol): UIModel2State | undefined;
  setIn(path: any[], value: any): UIModelStateNode;
  setIn(path: Iterable<any, any>, value: any): UIModelStateNode;
}

export type ModelPath = List<CollectionIndex | symbol>;

export interface UIModel2PropsObject {
  data: DataModelBase | undefined;
  dataPath: DataPath;
  modelPath: ModelPath;
  focusedPath: DataPath | undefined;
  stateNode: UIModelStateNode | undefined;
  key?: CollectionIndex;
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
  readonly modelPath: ModelPath;
  readonly focusedPath: DataPath | undefined;
  readonly stateNode: UIModelStateNode | undefined;
  readonly key: CollectionIndex | undefined;

  public static createSimple(optionalProps: OptionalUIModel2PropsObject): UIModel2Props {
    const stateNode = optionalProps.state
      ? (<UIModelStateNode> ImmutableMap()).set(stateKey, optionalProps.state) as UIModelStateNode
      : optionalProps.stateNode;
    return new UIModel2Props({
      data: optionalProps.data || undefined,
      dataPath: optionalProps.dataPath || DataPath.empty,
      modelPath: optionalProps.modelPath || List(),
      focusedPath: optionalProps.focusedPath,
      stateNode,
      key: optionalProps.key
    });
  }

  constructor(props: UIModel2PropsObject) {
    this.data = props.data;
    this.dataPath = props.dataPath;
    this.modelPath = props.modelPath;
    this.focusedPath = props.focusedPath;
    this.stateNode = props.stateNode;
    this.key = props.key;
  }

  public fastEquals(another: UIModel2Props): boolean {
    return this.data === another.data
      && is(this.dataPath, another.dataPath)
      && is(this.modelPath, another.modelPath)
      && is(this.focusedPath, another.focusedPath)
      && is(this.stateNode, another.stateNode)
      && this.key === another.key;
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
  protected static _factory: (def: UIDefinitionBase, props: UIModel2Props, oldModel?: UIModel2<any>) => UIModel2<any>;

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

export type UIModelChildren<I> = Map<I, UIModel2<any>>;
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
    newProps: UIModel2Props | undefined,
    definition: UIDefinitionBase,
    oldChild: UIModel2 | undefined
  ): UIModel2 {
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

  public constructor(definition: D, props: UIModel2Props, oldModel?: MultiContentUIModel<D, I>) {
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
  protected abstract childPropsAt(index: I): UIModel2Props | undefined;
  protected abstract childDefinitionAt(index: I): UIDefinitionBase;
  protected abstract dataPathToChildIndex(element: DataPathElement): I | undefined;
}
