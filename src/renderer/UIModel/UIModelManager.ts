import {
  UIModelAction,
  UIModelFocusAction,
  UIModelUpdateDataAction,
  UIModelUpdateStateAction
} from './UIModelActions';
import UIModel, { ModelPath, stateKey, UIModelProps, UIModelStateNode } from './UIModel';
import DataModelBase, { CollectionIndex, DataCollectionElement } from '../DataModel/DataModelBase';
import { List, Map } from 'immutable';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { UIModelFactory } from './UIModelFactory';
import DataPath from '../DataModel/Path/DataPath';
import { DataAction } from '../DataModel/DataAction';
import DataPathElement from '../DataModel/Path/DataPathElement';
import { CollectValueHint } from './types';

interface GroupedActions {
  updateDataActions: UIModelUpdateDataAction[];
  updateStateActions: UIModelUpdateStateAction[];
  focusAction?: UIModelFocusAction;
}

function digStateNode(node: UIModelStateNode, path: ModelPath): UIModelStateNode {
  let currentNode = node;
  const currentPath: (CollectionIndex | symbol)[] = [];
  path.forEach(index => {
    currentPath.push(index!);
    if (!currentNode.get(index!)) {
      currentNode = Map() as UIModelStateNode;
      node = node.setIn(currentPath, currentNode);
    }
  });
  return node;
}

export default class UIModelManager {
  public notifyModelChanged: () => void | Promise<void>;
  public notifyModalModelChanged: () => void | Promise<void>;
  public notifyHistoryChanged: () => void | Promise<void>;

  private _rootStateNode?: UIModelStateNode;
  private _rootUIModel: UIModel<any>;
  private _modalUIModel: UIModel<any>;
  private _dataModel: DataModelBase | undefined;
  private readonly _rootUIDefinition: UIDefinitionBase;
  private _focusedPath: DataPath | undefined;
  private _backHistory: (DataPath | undefined)[] = [];
  private _forwardHistory: (DataPath | undefined)[] = [];

  private static groupActions(actions: UIModelAction[]): GroupedActions {
    const updateDataActions: UIModelUpdateDataAction[] = [];
    const updateStateActions: UIModelUpdateStateAction[] = [];
    let focusAction: UIModelFocusAction | undefined;
    for (const action of actions) {
      if (UIModelAction.isUpdateDataAction(action)) {
        updateDataActions.push(action);
      } else if (UIModelAction.isUpdateStateAction(action)) {
        updateStateActions.push(action);
      } else if (UIModelAction.isFocusAction(action)) {
        focusAction = action;
      }
    }
    return { updateDataActions, updateStateActions, focusAction };
  }

  constructor(definition: UIDefinitionBase, data?: DataModelBase) {
    this.applyActions = this.applyActions.bind(this);
    this.collectValue = this.collectValue.bind(this);
    this.focus = this.focus.bind(this);
    this._rootUIDefinition = definition;
    this._dataModel = data;
    this._rootUIModel = UIModelFactory.create(definition, UIModelProps.createSimple(this.propsForRootModel));
  }

  public applyActions(actions: UIModelAction[]): void {
    if (actions.length === 0) { return; }
    const groupedActions = UIModelManager.groupActions(actions);
    for (const action of groupedActions.updateDataActions) {
      this.applyUpdateDataAction(action);
    }
    this.applyUpdateStateActions(groupedActions.updateStateActions);
    this._rootUIModel = UIModelFactory.create(this._rootUIDefinition, this.propsForRootModel, this._rootUIModel);
    if (groupedActions.focusAction) {
      this.focus(groupedActions.focusAction.path);
    }
    // console.log('action applied', this._dataModel && this._dataModel!.toJsonObject(), actions);
    if (this.notifyModelChanged) { this.notifyModelChanged(); }
  }

  public focus(path: DataPath | undefined, ignoreHistory: boolean = false): void {
    if (!ignoreHistory) {
      this._backHistory.push(this._focusedPath);
      if (this._backHistory.length > 100) {
        this._backHistory.shift();
      }
      this._forwardHistory = [];
    }
    this._focusedPath = path;
    this._rootUIModel = UIModelFactory.create(this._rootUIDefinition, this.propsForRootModel, this._rootUIModel);
    const adjustStateActions = this._rootUIModel.adjustState();
    this.applyUpdateStateActions(adjustStateActions);
    if (adjustStateActions.length > 0) {
      this._rootUIModel = UIModelFactory.create(this._rootUIDefinition, this.propsForRootModel, this._rootUIModel);
    }
    if (this.notifyModelChanged) { this.notifyModelChanged(); }
    if (!ignoreHistory && this.notifyHistoryChanged) { this.notifyHistoryChanged(); }
  }

  public back(): void {
    const backHistoryLength = this._backHistory.length;
    if (backHistoryLength === 0) { return; }
    const backPath = this._backHistory.pop();
    this._forwardHistory.push(this._focusedPath);
    this.focus(backPath, true);
    if (this.notifyHistoryChanged) { this.notifyHistoryChanged(); }
  }

  public forward(): void {
    const forwaordHistoryLength = this._forwardHistory.length;
    if (forwaordHistoryLength === 0) { return; }
    const forwardPath = this._forwardHistory.pop()!;
    this._backHistory.push(this._focusedPath);
    this.focus(forwardPath, true);
    if (this.notifyHistoryChanged) { this.notifyHistoryChanged(); }
  }

  public collectValue(targetPath: DataPath, basePath: DataPath, hint?: CollectValueHint): DataCollectionElement[] {
    if (!this._dataModel) { return []; }
    const filledTargetPath = this.fillDataPathVariable(targetPath, basePath, hint);
    if (!filledTargetPath) { return []; }
    if (filledTargetPath.isAbsolute) {
      return this._dataModel.collectValue(filledTargetPath);
    } else {
      if (hint && hint.basePathData && filledTargetPath.isForward) {
        return hint.basePathData.collectValue(filledTargetPath);
      } else {
        return this._dataModel.collectValue(DataPath.join(basePath, filledTargetPath));
      }
    }
  }

  public fillDataPathVariable(path: DataPath, basePath: DataPath, hint?: CollectValueHint): DataPath | undefined {
    const variables = path.variableElements;
    if (variables.length === 0) { return path; }
    if (!this._dataModel) { return undefined; }
    for (const variable of variables) {
      const filled = this.fillDataPathVariable(variable.element.variablePath!, basePath);
      if (!filled) { return undefined; }
      const absolutePath = filled.isAbsolute ? filled : DataPath.join(basePath, filled);
      const value = this._dataModel.getValue(absolutePath); // TODO hintを使った最適化
      if (!value) { return undefined; }
      path = path.setAt(variable.index, DataPathElement.create(value.toString()));
    }
    return path;
  }

  get focusedPath(): DataPath | undefined {
    return this._focusedPath;
  }

  get rootUIDefinition(): UIDefinitionBase {
    return this._rootUIDefinition;
  }

  get dataModel(): DataModelBase | undefined {
    return this._dataModel;
  }

  get rootStateNode(): UIModelStateNode | undefined {
    return this._rootStateNode;
  }

  get rootUIModel(): UIModel<any> {
    return this._rootUIModel;
  }

  get modalUIModel(): UIModel<any> {
    return this._modalUIModel;
  }

  get canBack(): boolean {
    return this._backHistory.length > 0;
  }

  get canForward(): boolean {
    return this._forwardHistory.length > 0;
  }

  private applyUpdateDataAction(action: UIModelUpdateDataAction): void {
    for (const constructDefaultAction of this._rootUIModel.constructDefaultValue(this._dataModel, action.path)) {
      if (constructDefaultAction.path.isEmptyPath && DataAction.isSetDataAction(constructDefaultAction.dataAction)) {
        this._dataModel = constructDefaultAction.dataAction.data;
      } else {
        this._dataModel = this._dataModel!.applyAction(
          constructDefaultAction.path, constructDefaultAction.dataAction);
      }
    }
    this._dataModel = this._dataModel!.applyAction(action.path, action.dataAction);
  }

  private applyUpdateStateActions(actions: UIModelUpdateStateAction[]): void {
    if (actions.length > 0) {
      let state = this._rootStateNode || Map() as UIModelStateNode;
      for (const action of actions) {
        state = digStateNode(state, action.path);
        state = state.setIn((<List<any>> action.path).push(stateKey), action.state);
      }
      this._rootStateNode = state;
    }
  }

  private get propsForRootModel(): UIModelProps {
    return new UIModelProps({
      data: this._dataModel,
      stateNode: this._rootStateNode,
      modelPath: List(),
      focusedPath: this._focusedPath,
      dataPath: DataPath.absoluteEmpty
    });
  }
}