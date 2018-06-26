import { SingleContentUIModel, stateKey, UIModel2Props } from './UIModel2';
import ContentListUIDefinition from '../UIDefinition/ContentListUIDefinition';
import { Record } from 'immutable';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import DataModelBase, { CollectionDataModel, CollectionIndex } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import ListDataModel from '../DataModel/ListDataModel';
import { UIModelUpdateStateAction } from './UIModel2Actions';
import { TabUIModelState } from './TabUIModel2';
import ScalarDataModel from '../DataModel/ScalarDataModel';
import DataPath from '../DataModel/Path/DataPath';
import CollectionDataModelUtil from '../DataModel/CollectionDataModelUtil';

export interface ContentListIndex {
  index: CollectionIndex;
  isInvalid: boolean;
  isSelected: boolean;
  title: string;
  path: DataPath;
  description?: string;
}

const ContentListUIModelStateRecord = Record({
  selectedIndex: undefined
});

export class ContentListUIModelState extends ContentListUIModelStateRecord {
  public readonly selectedIndex: number | undefined;
}

export default class ContentListUIModel2 extends SingleContentUIModel<ContentListUIDefinition> {
  public adjustState(): UIModelUpdateStateAction[] {
    const focusedPath = this.props.focusedPath;
    if (focusedPath && !focusedPath.isEmptyPath) {
      const firstElement = focusedPath.firstElement;
      if (firstElement.canBeListIndex && firstElement.asListIndex !== this.selectedIndex) {
        const focusIndex = focusedPath.firstElement.asListIndex;
        const state = this.state;
        if (!state || state.selectedIndex !== focusIndex) {
          return [...super.adjustState(), {
            type: 'UpdateState',
            state: (this.state || new TabUIModelState()).set('selectedIndex', focusIndex),
            path: this.props.modelPath
          }];
        }
      }
    }
    return super.adjustState();
  }

  public get indexes(): ContentListIndex[] {
    if (this.collectionData) {
      return this.collectionData.mapDataWithIndex<ContentListIndex>(
        (item: DataModelBase, index: CollectionIndex): ContentListIndex => {
          let isInvalid: boolean = false;
          const isSelected = index === this.selectedIndex;
          const path = this.props.dataPath.push(index);
          const listIndexKey = this.definition.listIndexKey;
          if (listIndexKey === undefined) {
            return { index, title: item.toString(), isSelected, isInvalid, path };
          }
          if (listIndexKey.isKey) {
            return { index, title: index.toString(), isSelected, isInvalid, path };
          }
          let title: string = '';
          if (!(item instanceof MapDataModel)) {
            throw new Error('Invalid data type');
          }
          const scalarItem = item.getValue(new DataPath([listIndexKey]));
          if (scalarItem instanceof ScalarDataModel) {
            title = scalarItem.value;
          } else {
            isInvalid = true;
          }
          return {index, title, isSelected, isInvalid, path };
        }
      );
    } else {
      return [];
    }
  }

  public get collectionData(): CollectionDataModel | undefined {
    return CollectionDataModelUtil.asCollectionDataModel(this.props.data);
  }

  protected get childDefinition(): UIDefinitionBase {
    return this.definition.content;
  }

  protected get childProps(): UIModel2Props {
    const { stateNode, modelPath, dataPath, focusedPath } = this.props;
    const selectedIndex = this.selectedIndex;
    return new UIModel2Props({
      stateNode: stateNode && stateNode.get(0), // とりあえず、選択されたデータによらず状態を保存しておく
      data: this.selectedData(selectedIndex),
      modelPath: modelPath.push(selectedIndex),
      dataPath: dataPath.push(selectedIndex),
      focusedPath: focusedPath && focusedPath.shift()
    });
  }

  private get state(): ContentListUIModelState | undefined {
    return this.props.stateNode && this.props.stateNode.get(stateKey) as ContentListUIModelState | undefined;
  }

  private get selectedIndex(): number {
    const { focusedPath } = this.props;
    if (focusedPath && !focusedPath.isEmptyPath && focusedPath.firstElement.canBeListIndex) {
      return focusedPath.firstElement.asListIndex;
    } else {
      return 0;
    }
  }

  private selectedData(selectedIndex?: number): DataModelBase | undefined {
    if (selectedIndex === undefined) {
      selectedIndex = this.selectedIndex;
    }
    const { data } = this.props;
    if (data instanceof MapDataModel) {
      return data.valueForListIndex(selectedIndex);
    } else if (data instanceof ListDataModel) {
      return data.getValueForIndex(selectedIndex);
    }
    return undefined;
  }
}