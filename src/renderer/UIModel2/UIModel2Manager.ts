import { UIModelAction, UIModelUpdateDataAction, UIModelUpdateStateAction } from './UIModel2Actions';
import { default as UIModel2, ModelPath, stateKey, UIModel2Props, UIModelStateNode } from './UIModel2';
import DataModelBase, { CollectionIndex, DataCollectionElement } from '../DataModel/DataModelBase';
import { List, Map } from 'immutable';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { UIModel2Factory } from './UIModel2Factory';
import DataPath from '../DataModel/Path/DataPath';
import { DataAction } from '../DataModel/DataAction';

interface GroupedActions {
  updateDataActions: UIModelUpdateDataAction[];
  updateStateActions: UIModelUpdateStateAction[];
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

export default class UIModel2Manager {
  public notifyModelChanged: () => void | Promise<void>;
  public notifyModalModelChanged: () => void | Promise<void>;

  private _rootStateNode?: UIModelStateNode;
  private _rootUIModel: UIModel2<any>;
  private _modalUIModel: UIModel2<any>;
  private _dataModel: DataModelBase | undefined;
  private _rootUIDefinition: UIDefinitionBase;
  private _focusedPath: DataPath | undefined;

  private static groupActions(actions: UIModelAction[]): GroupedActions {
    const updateDataActions: UIModelUpdateDataAction[] = [];
    const updateStateActions: UIModelUpdateStateAction[] = [];
    for (const action of actions) {
      if (UIModelAction.isUpdateDataAction(action)) {
        updateDataActions.push(action);
      } else if (UIModelAction.isUpdateStateAction(action)) {
        updateStateActions.push(action);
      }
    }
    return { updateDataActions, updateStateActions };
  }

  constructor(definition: UIDefinitionBase, data?: DataModelBase) {
    this.applyActions = this.applyActions.bind(this);
    this.collectValue = this.collectValue.bind(this);
    this.focus = this.focus.bind(this);
    this._rootUIDefinition = definition;
    this._dataModel = data;
    this._rootUIModel = UIModel2Factory.create(definition, UIModel2Props.createSimple({ data }));
  }

  public applyActions(actions: UIModelAction[]): void {
    const groupedActions = UIModel2Manager.groupActions(actions);
    for (const action of groupedActions.updateDataActions) {
      this.applyUpdateDataAction(action);
    }
    this.applyUpdateStateActions(groupedActions.updateStateActions);
    this._rootUIModel = UIModel2Factory.create(this._rootUIDefinition, this.propsForRootModel, this._rootUIModel);
    console.log('applyActions', this.dataModel && this.dataModel.toJsonObject(), actions);
    if (this.notifyModelChanged) { this.notifyModelChanged(); }
  }

  public focus(path: DataPath): void {
    this._focusedPath = path;
    this._rootUIModel = UIModel2Factory.create(this._rootUIDefinition, this.propsForRootModel, this._rootUIModel);
    this.applyUpdateStateActions(this._rootUIModel.adjustState());
    console.log('focus', path.toString(), this._rootStateNode);
    if (this.notifyModelChanged) { this.notifyModelChanged(); }
  }

  public collectValue(targetPath: DataPath, basePath: DataPath): DataCollectionElement[] {
    return this._dataModel ? this._dataModel.collectValue(targetPath) : [];
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

  get rootUIModel(): UIModel2<any> {
    return this._rootUIModel;
  }

  get modalUIModel(): UIModel2<any> {
    return this._modalUIModel;
  }

  private applyUpdateDataAction(action: UIModelUpdateDataAction): void {
    for (const constructDefaultAction of this._rootUIModel.constructDefaultValue(action.path)) {
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

  private get propsForRootModel(): UIModel2Props {
    return new UIModel2Props({
      data: this._dataModel,
      stateNode: this._rootStateNode,
      modelPath: List(),
      focusedPath: this._focusedPath,
      dataPath: DataPath.empty
    });
  }
}