import { SingleContentUIModel, stateKey, UIModelProps } from './UIModel';
import ContentListUIDefinition from '../UIDefinition/ContentListUIDefinition';
import { Record } from 'immutable';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import DataModelBase, { CollectionDataModel, CollectionIndex } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import ListDataModel from '../DataModel/ListDataModel';
import {
  UIModelAction,
  UIModelFocusAction,
  UIModelUpdateDataAction,
  UIModelUpdateStateAction
} from './UIModelActions';
import ScalarDataModel from '../DataModel/ScalarDataModel';
import DataPath from '../DataModel/Path/DataPath';
import CollectionDataModelUtil, { CollectionDataModelType } from '../DataModel/CollectionDataModelUtil';
import { InsertDataAction } from '../DataModel/DataAction';
import DataPathElement from '../DataModel/Path/DataPathElement';

export interface ContentListIndex {
  index: number;
  isInvalid: boolean;
  isSelected: boolean;
  title: string;
  path: DataPath;
  description?: string;
}

interface ContentListUIModelStateProperty {
  selectedIndex: number | null;
}

const defaultValue: ContentListUIModelStateProperty = {
  selectedIndex: null
};

export class ContentListUIModelState extends Record(defaultValue) {
  public readonly selectedIndex: number | null;
}

export default class ContentListUIModel extends SingleContentUIModel<ContentListUIDefinition> {
  private _dataPath?: DataPath;

  public adjustState(): UIModelUpdateStateAction[] {
    const focusedPath = this.props.focusedPath;
    if (focusedPath && focusedPath.isNotEmptyPath()) {
      const firstElement = focusedPath.firstElement;
      if (firstElement.canBeListIndex) {
        const focusIndex = focusedPath.firstElement.asListIndex;
        const state = this.state;
        if (!state || state.selectedIndex !== focusIndex) {
          return [...super.adjustState(), {
            type: 'UpdateState',
            state: (this.state || new ContentListUIModelState()).set('selectedIndex', focusIndex),
            path: this.props.modelPath
          }];
        }
      }
    }
    return super.adjustState();
  }

  public moveUp(): UIModelAction[] {
    const from = this.selectedIndex!;
    return [
      UIModelAction.Creators.moveData(this.dataPath, from, from - 1),
      <UIModelFocusAction> { type: 'Focus', path: this.dataPath.push(from - 1) }
    ];
  }

  public get canMoveUp(): boolean {
    const { selectedIndex } = this;
    return selectedIndex !== undefined && selectedIndex > 0;
  }

  public moveDown(): UIModelAction[] {
    const from = this.selectedIndex!;
    return [
      UIModelAction.Creators.moveData(this.dataPath, from, from + 2),
      <UIModelFocusAction> { type: 'Focus', path: this.dataPath.push(from + 1) }
    ];
  }

  public get canMoveDown(): boolean {
    const { collectionData, selectedIndex } = this;
    return !!collectionData && selectedIndex !== undefined && selectedIndex < collectionData.allDataSize - 1;
  }

  public add(): UIModelAction[] {
    const nextIndex = this.selectedIndex === undefined ? 0 : this.selectedIndex + 1;
    return [
      <UIModelUpdateDataAction> {
        type: 'UpdateData',
        path: this.dataPath,
        dataAction: <InsertDataAction> {
          targetIndex: this.selectedIndex,
          isAfter: true,
          data: MapDataModel.create([]),
          type: 'Insert'
        }
      },
      <UIModelFocusAction> { type: 'Focus', path: this.dataPath.push(nextIndex) }
    ];
  }

  public delete(): UIModelAction[] {
    if (this.selectedIndex === undefined) {
      return [];
    } else {
      return [UIModelAction.Creators.deleteData(this.dataPath, this.selectedIndex)];
    }
  }

  public get indexes(): ContentListIndex[] {
    if (this.collectionData) {
      return this.collectionData.mapAllData(
        (item: DataModelBase, index: number): ContentListIndex => {
          let isInvalid: boolean = false;
          const isSelected = index === this.selectedIndex;
          const path = this.dataPath.push(index);
          const listIndexKey = this.definition.listIndexKey;
          if (listIndexKey === undefined) {
            return { index, title: item.toString(), isSelected, isInvalid, path };
          }
          if (listIndexKey.isKey) {
            const selectedKey = this.selectedKey(index);
            const title = selectedKey !== undefined ? selectedKey.toString() : '';
            return { index, title, isSelected, isInvalid, path };
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

  protected get childProps(): UIModelProps | undefined {
    const selectedIndex = this.selectedIndex;
    if (selectedIndex === undefined) { return undefined; }

    const { dataPath, props: { stateNode, modelPath, focusedPath } } = this;
    return new UIModelProps({
      stateNode: stateNode && stateNode.get(0), // とりあえず、選択されたデータによらず状態を保存しておく
      data: this.selectedData(selectedIndex),
      modelPath: modelPath.push(selectedIndex),
      dataPath: dataPath.push(selectedIndex),
      focusedPath: focusedPath && focusedPath.shift(),
      key: this.selectedKey(selectedIndex)
    });
  }

  private get state(): ContentListUIModelState | undefined {
    return this.props.stateNode && this.props.stateNode.get(stateKey) as ContentListUIModelState | undefined;
  }

  private get selectedIndex(): number | undefined {
    const { collectionData } = this;
    if (!collectionData) { return undefined; }
    const listSize = collectionData.allDataSize;
    const { focusedPath } = this.props;
    let index: number | undefined;
    if (focusedPath && focusedPath.isNotEmptyPath()) {
      const { firstElement } = focusedPath;
      if (firstElement.canBeMapKey && collectionData instanceof MapDataModel) {
        index = collectionData.indexForKey(firstElement.asMapKey);
      } else if (firstElement.isListIndex) {
        index = focusedPath.firstElement.asListIndex;
      }
    }
    if (index !== undefined && index >= 0 && index < listSize) { return index; }
    const state = this.state;
    index = state && state.selectedIndex ? state.selectedIndex : 0;
    return index < listSize ? index : undefined;
  }

  private selectedData(selectedIndex: number): DataModelBase | undefined {
    const { data } = this.props;
    if (this.definition.dataType === CollectionDataModelType.Map && data instanceof MapDataModel) {
      return data.valueForListIndex(selectedIndex);
    } else if (this.definition.dataType === CollectionDataModelType.List && data instanceof ListDataModel) {
      return data.getValueForIndex(selectedIndex);
    }
    return undefined;
  }

  private selectedKey(selectedIndex: number): CollectionIndex | undefined {
    if (this.definition.dataType === CollectionDataModelType.List) { return selectedIndex; }
    if (this.props.data instanceof MapDataModel) {
      return this.props.data.keyForIndex(selectedIndex);
    } else {
      return undefined;
    }
  }

  private get dataPath(): DataPath {
    if (!this._dataPath) {
      const { dataPath } = this.props;
      if (dataPath.isNotEmptyPath()) {
        const { lastElement } = dataPath;
        this._dataPath = dataPath.pop().push(this.makeDataPathElementWithMetadata(lastElement));
      } else {
        this._dataPath = dataPath;
      }
    }
    return this._dataPath;
  }

  private makeDataPathElementWithMetadata(sourceElement: DataPathElement): DataPathElement {
    return sourceElement.setMetadata(sourceElement.metadata.set('defaultData', this.definition.defaultData));
  }
}