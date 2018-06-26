import { SingleContentUIModel, stateKey, UIModel2Props } from './UIModel2';
import TabUIDefinition from '../UIDefinition/TabUIDefinition';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import MapDataModel from '../DataModel/MapDataModel';
import { Record } from 'immutable';
import DataPathElement from '../DataModel/Path/DataPathElement';
import { UIModelAction, UIModelUpdateDataAction, UIModelUpdateStateAction } from './UIModel2Actions';
import DataPath from '../DataModel/Path/DataPath';

const TabUIModelStateRecord = Record({
  selectedTab: undefined
});

export class TabUIModelState extends TabUIModelStateRecord {
  public readonly selectedTab: string | undefined;
}

interface Tab {
  key: string;
  label: string;
  path: DataPath;
  isSelected: boolean;
}

export default class TabUIModel2 extends SingleContentUIModel<TabUIDefinition> {
  public adjustState(): UIModelUpdateStateAction[] {
    const focusedPath = this.props.focusedPath;
    if (focusedPath && !focusedPath.isEmptyPath) {
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
    if (focusedPath && !focusedPath.isEmptyPath && focusedPath.firstElement.canBeMapKey) {
      return focusedPath.firstElement.asMapKey;
    }
    const state = this.state;
    if (state && state.selectedTab) {
      return state.selectedTab;
    }
    return this.defaultTab;
  }

  public get tabs(): Tab[] {
    const selectedTab = this.selectedTab;
    return this.definition.contents.map(content => ({
      key: content!.key.asMapKey,
      label: content!.title,
      path: this.props.dataPath.push(content!.key),
      isSelected: content!.key.asMapKey === selectedTab
    })).toArray();
  }

  public constructDefaultValue(dataPath: DataPath): UIModelUpdateDataAction[] {
    const childResult = dataPath.isEmptyPath ? [] : this.child.constructDefaultValue(dataPath.shift());
    if (this.props.data instanceof MapDataModel) {
      return childResult;
    } else {
      return [UIModelAction.Creators.setData(this.props.dataPath, new MapDataModel({})), ...childResult];
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

  private get defaultTab(): string {
    return this.definition.contents.first().key.asMapKey;
  }

  private get mapData(): MapDataModel | undefined {
    return this.props.data instanceof MapDataModel ? this.props.data : undefined;
  }

  protected get childDefinition(): UIDefinitionBase {
    return this.childDefinitionForKey(this.selectedTab);
  }

  private childDefinitionForKey(key: string | DataPathElement) {
    if (typeof key === 'string') {
      return this.definition.contents.find(content => content!.key.asMapKey === key);
    } else {
      return this.definition.contents.find(content => content!.key.equals(key));
    }
  }

  private get state(): TabUIModelState | undefined {
    return this.props.stateNode && this.props.stateNode.get(stateKey) as TabUIModelState | undefined;
  }

  protected get childProps(): UIModel2Props {
    const {stateNode, modelPath, dataPath, focusedPath} = this.props;
    const selectedTab = this.selectedTab;
    return new UIModel2Props({
      stateNode: stateNode && stateNode.get(selectedTab),
      data: this.mapData && this.mapData.valueForKey(selectedTab as string),
      modelPath: modelPath.push(selectedTab),
      dataPath: dataPath.push(selectedTab),
      focusedPath: focusedPath && focusedPath.shift()
    });
  }
}