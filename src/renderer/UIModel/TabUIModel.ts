import { SingleContentUIModel, stateKey, UIModelProps } from './UIModel';
import TabUIDefinition from '../UIDefinition/TabUIDefinition';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import MapDataModel from '../DataModel/MapDataModel';
import { List, Record } from 'immutable';
import DataPathElement from '../DataModel/Path/DataPathElement';
import { UIModelAction, UIModelUpdateDataAction, UIModelUpdateStateAction } from './UIModelActions';
import DataPath from '../DataModel/Path/DataPath';
import DataModelBase from '../DataModel/DataModelBase';

interface TabUIModelStateProperty {
  selectedTab: string | undefined;
}

const stateDefaultValue: TabUIModelStateProperty = {
  selectedTab: undefined
};

export class TabUIModelState extends Record(stateDefaultValue) {
  public readonly selectedTab: string | undefined;
}

interface Tab {
  key: string;
  label: string;
  path: DataPath;
  isSelected: boolean;
}

export default class TabUIModel extends SingleContentUIModel<TabUIDefinition> {
  private _dataPath?: DataPath;

  public adjustState(): UIModelUpdateStateAction[] {
    const focusedPath = this.props.focusedPath;
    if (focusedPath && focusedPath.isNotEmptyPath()) {
      const firstElement = focusedPath.firstElement;
      if (firstElement.canBeMapKey && firstElement.asMapKey !== this.defaultTab) {
        const focusTab = focusedPath.firstElement.asMapKey;
        const state = this.state;
        if (!state || state.selectedTab !== focusTab) {
          return super.adjustState().concat(this.selectTab(focusTab));
        }
      }
    }
    return super.adjustState();
  }

  public get selectedTab(): string {
    const { focusedPath } = this.props;
    let key: string | undefined;
    if (focusedPath && focusedPath.isNotEmptyPath()) {
      const { firstElement } = focusedPath;
      if (firstElement.canBeMapKey) {
        key = firstElement.asMapKey;
      } else if (firstElement.isListIndex) {
        const { mapData } = this;
        if (mapData && mapData.keyForIndex(firstElement.asListIndex)) {
          key = mapData.keyForIndex(firstElement.asListIndex)!;
        }
      }
    }
    if (key && this.isValidKey(key)) { return key; }
    const state = this.state;
    if (state && state.selectedTab && this.isValidKey(state.selectedTab)) {
      return state.selectedTab;
    }
    return this.defaultTab;
  }

  public get tabs(): Tab[] {
    const selectedTab = this.selectedTab;
    return this.definition.contents.map(content => ({
      key: content.key!.asMapKey,
      label: content.label,
      path: this.dataPath.push(content.key!),
      isSelected: content.key!.asMapKey === selectedTab
    })).toArray();
  }

  public constructDefaultValue(data: DataModelBase | undefined, dataPath: DataPath): UIModelUpdateDataAction[] {
    const childResult = dataPath.isEmptyPath || !this.child
      ? []
      : this.child.constructDefaultValue(data && data.getValue(new DataPath(this.selectedTab)), dataPath.shift());
    if (data instanceof MapDataModel) {
      return childResult;
    } else {
      return [UIModelAction.Creators.setData(this.dataPath, new MapDataModel({})), ...childResult];
    }
  }

  private selectTab(tab: string): UIModelUpdateStateAction[] {
    const state = this.state;
    const nextState = state ? state.set('selectedTab', tab) : new TabUIModelState({ selectedTab: tab });
    return [<UIModelUpdateStateAction> {
      type: 'UpdateState',
      path: this.props.modelPath,
      state: nextState
    }];
  }

  private isValidKey(key: string): boolean {
    return this.definition.contents.some(content => content!.key!.asMapKey === key);
  }

  private get defaultTab(): string {
    return this.definition.contents.first()!.key!.asMapKey;
  }

  private get mapData(): MapDataModel | undefined {
    return this.props.data instanceof MapDataModel ? this.props.data : undefined;
  }

  protected get childDefinition(): UIDefinitionBase {
    return this.childDefinitionForKey(this.selectedTab)!;
  }

  private childDefinitionForKey(key: string | DataPathElement): UIDefinitionBase | undefined {
    if (typeof key === 'string') {
      return this.definition.contents.find(content => content.keyString === key);
    } else {
      return this.definition.contents.find(content => content.key!.equals(key));
    }
  }

  private get state(): TabUIModelState | undefined {
    return this.props.stateNode && this.props.stateNode.get(stateKey) as TabUIModelState | undefined;
  }

  protected get childProps(): UIModelProps {
    const { dataPath, props: { stateNode, modelPath, focusedPath, data } } = this;
    const selectedTab = this.selectedTab;
    if (this.childDefinition.keyFlatten) {
      return new UIModelProps({
        stateNode: stateNode && stateNode.get(selectedTab),
        data,
        modelPath: modelPath.push(selectedTab),
        dataPath,
        focusedPath
      });
    } else {
      return new UIModelProps({
        stateNode: stateNode && stateNode.get(selectedTab),
        data: this.mapData && this.mapData.valueForKey(selectedTab as string),
        modelPath: modelPath.push(selectedTab),
        dataPath: dataPath.push(selectedTab),
        focusedPath: focusedPath && focusedPath.shift()
      });
    }
  }

  private get dataPath(): DataPath {
    if (!this._dataPath) {
      const { dataPath } = this.props;
      if (dataPath.isNotEmptyPath()) {
        const { lastElement } = dataPath;
        // Add metadata
        this._dataPath = dataPath.pop().push(this.makeDataPathElementWithMetadata(lastElement));
      } else {
        this._dataPath = dataPath;
      }
    }
    return this._dataPath;
  }

  private makeDataPathElementWithMetadata(sourceElement: DataPathElement): DataPathElement {
    let keyOrder: List<string> = sourceElement.metadata.get('keyOrder') || List();
    const newKeyOrder = keyOrder.concat(this.definition.keyOrder) as List<string>;
    return sourceElement.setMetadata(sourceElement.metadata
      .set('keyOrder', newKeyOrder)
      .set('defaultData', this.definition.defaultData));
  }
}