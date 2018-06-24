import { UIModelAction, UIModelUpdateDataAction, UIModelUpdateStateAction } from './UIModel2Actions';
import { default as UIModel2, stateKey, UIModel2Props, UIModelStateNode } from './UIModel2';
import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';
import { List, Map } from 'immutable';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { UIModel2Factory } from './UIModel2Factory';
import DataPath from '../DataModel/Path/DataPath';

interface GroupedActions {
  updateDataActions: UIModelUpdateDataAction[];
  updateStateActions: UIModelUpdateStateAction[];
}

function digStateNode(node: UIModelStateNode, path: List<CollectionIndex>): UIModelStateNode {
  let currentNode = node;
  const currentPath: CollectionIndex[] = [];
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
    this._rootUIDefinition = definition;
    this._dataModel = data;
    this._rootUIModel = UIModel2Factory.create(definition, UIModel2Props.createSimple({ data }));
  }

  public applyActions(actions: UIModelAction[]): void {
    const groupedActions = UIModel2Manager.groupActions(actions);
    for (const action of groupedActions.updateDataActions) {
      this._dataModel = this._dataModel!.applyAction(action.path, action.dataAction);
    }
    if (groupedActions.updateStateActions.length > 0) {
      let state = this._rootStateNode || Map() as UIModelStateNode;
      for (const action of groupedActions.updateStateActions) {
        state = digStateNode(state, action.path);
        state = state.setIn((<List<any>> action.path).push(stateKey), action.state);
      }
      this._rootStateNode = state;
    }
    const nextUIProps = new UIModel2Props({
      data: this._dataModel,
      stateNode: this._rootStateNode,
      modelPath: List(),
      focusedPath: this._focusedPath,
      dataPath: DataPath.empty
    });
    this._rootUIModel = UIModel2Factory.create(this._rootUIDefinition, nextUIProps, this._rootUIModel);
    if (this.notifyModelChanged) { this.notifyModelChanged(); }
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
}