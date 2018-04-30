import { Record } from 'immutable';
import DataModelBase, { CollectionDataModel, CollectionIndex } from '../DataModel/DataModelBase';
import { applyMixins } from '../../common/util';
import ContentListUIDefinition from '../UIDefinition/ContentListUIDefinition';
import MapDataModel from '../DataModel/MapDataModel';
import DataPath from '../DataModel/DataPath';
import ScalarDataModel from '../DataModel/ScalarDataModel';
import UIModel, { ActionDispatch, UIModelProps, UIModelPropsDefault } from './UIModel';
import EditContext from './EditContext';
import CollectionDataModelUtil, { CollectionDataModelType } from '../DataModel/CollectionDataModelUtil';
import { UIModelFactory } from './UIModelFactory';
import DataModelUtil from '../DataModel/DataModelUtil';
import {
  createChangeEditContextAction, createCloseModalAction, createOpenModalAction,
  createSetValueAction
} from './UIModelAction';
import ListDataModel from '../DataModel/ListDataModel';
import UIModelState from './UIModelState';

export interface ContentListIndex {
  index: CollectionIndex;
  isInvalid: boolean;
  isSelected: boolean;
  title: string;
  description?: string;
}

interface ContentListUIModelState extends UIModelState {
  child: UIModelState | undefined;
  selectedIndex: CollectionIndex | undefined;
}

const ContentListUIModelRecord = Record({
  ...UIModelPropsDefault,
  childModel: undefined,
  selectedIndex: undefined
});

export default class ContentListUIModel extends ContentListUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: ContentListUIDefinition;
  public readonly editContext: EditContext;
  public readonly childModel: UIModel | undefined;
  public readonly dataPath: DataPath;
  public readonly selectedIndex: CollectionIndex | undefined;

  //#region private static function for props
  private static childProps(props: UIModelProps, lastState: UIModelState | undefined): UIModelProps | undefined {
    const collectionData = CollectionDataModelUtil.asCollectionDataModel(props.data);
    const index = this.selectedIndex(
      props.definition as ContentListUIDefinition, props.editContext, collectionData, lastState);
    if (index === undefined) {
      return undefined;
    }
    const definition = props.definition as ContentListUIDefinition;
    return {
      editContext: props.editContext && props.editContext.shift(),
      dataPath: props.dataPath.push(index),
      data: CollectionDataModelUtil.getValueForIndex(collectionData, index),
      definition: definition.content
    };
  }

  private static childModel(props: UIModelProps, lastState: UIModelState | undefined): UIModel | undefined {
    const childProps = ContentListUIModel.childProps(props, lastState);
    const contentListLastState = this.castState(lastState);
    return childProps && UIModelFactory.create(childProps, contentListLastState && contentListLastState.child);
  }

  private static castState(state: UIModelState | undefined): ContentListUIModelState | undefined {
    if (state && state.type === 'contentList') {
      return state as ContentListUIModelState;
    }
    return undefined;
  }

  private static selectedIndex(
    definition: ContentListUIDefinition,
    editContext: EditContext | undefined,
    data: CollectionDataModel | undefined,
    lastState: UIModelState | undefined
  ): CollectionIndex | undefined {
    if (!data || data.dataIsEmpty) {
      return undefined;
    }
    switch (definition.dataType) {
      case CollectionDataModelType.Map:
        const mapData = data instanceof MapDataModel ? data : undefined;
        return this.selectedIndexForMapData(editContext, mapData, lastState);
      case CollectionDataModelType.List:
        const listData = data instanceof ListDataModel ? data : undefined;
        return this.selectedIndexForListData(editContext, listData, lastState);
      default:
        throw new Error();
    }
  }

  private static selectedIndexForMapData(
    editContest: EditContext | undefined,
    data: MapDataModel | undefined,
    lastState: UIModelState | undefined
  ): CollectionIndex | undefined {
    if (!data || data.dataIsEmpty) {
      return undefined;
    }
    if (editContest && !editContest.pathIsEmpty && editContest.firstPathElement.canBeMapKey) {
      const mapKey = editContest.firstPathElement.asMapKey;
      return data.isValidKey(mapKey) ? mapKey : undefined;
    } else {
      const contentListLastState = this.castState(lastState);
      if (contentListLastState && contentListLastState.selectedIndex) {
        return contentListLastState.selectedIndex;
      } else {
        return data.firstKey;
      }
    }
  }

  private static selectedIndexForListData(
    editContest: EditContext | undefined,
    data: ListDataModel | undefined,
    lastState: UIModelState | undefined
  ): CollectionIndex | undefined {
    if (!data || data.dataIsEmpty) {
      return undefined;
    }
    if (editContest && !editContest.pathIsEmpty && editContest.firstPathElement.canBeListIndex) {
      const listIndex = editContest.firstPathElement.asListIndex;
      return data.isValidIndex(listIndex) ? listIndex : undefined;
    } else {
      const contentListLastState = this.castState(lastState);
      if (contentListLastState && contentListLastState.selectedIndex) {
        return contentListLastState.selectedIndex;
      } else {
        return 0;
      }
    }
  }
  //#endregion

  constructor(props: UIModelProps, lastState: UIModelState | undefined) {
    super({
      ...props,
      childModel: ContentListUIModel.childModel(props, lastState),
      selectedIndex: ContentListUIModel.selectedIndex(
        props.definition as ContentListUIDefinition,
        props.editContext,
        CollectionDataModelUtil.asCollectionDataModel(props.data),
        lastState)
    });
  }

  //#region Public Getter
  public get _data(): CollectionDataModel | undefined {
    return CollectionDataModelUtil.asCollectionDataModel(this.data);
  }

  public get propsObject(): UIModelProps {
    return {
      definition: this.definition,
      dataPath: this.dataPath,
      data: this.data,
      editContext: this.editContext
    };
  }

  public get indexes(): Array<ContentListIndex> {
    if (this._data) {
      return this._data.mapDataWithIndex<ContentListIndex>(
        (item: DataModelBase, index: CollectionIndex): ContentListIndex => {
          let isInvalid: boolean = false;
          const isSelected = index === this.selectedIndex;
          const listIndexKey = this.definition.listIndexKey;
          if (listIndexKey === undefined) {
            return {index, title: item.toString(), isSelected, isInvalid};
          }
          if (listIndexKey.isKey) {
            return {index, title: index.toString(), isSelected, isInvalid};
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
          return {index, title, isSelected, isInvalid};
        }
      );
    } else {
      return [];
    }
  }

  public get addFormModelProps(): UIModelProps {
    return {
      data: this.definition.addFormDefaultValue,
      dataPath: this.dataPath,
      definition: this.definition.addFormContent,
      editContext: EditContext.empty
    };
  }
  //#endregion

  //#region Manipulation
  public selectIndex(dispatch: ActionDispatch, index: CollectionIndex): void {
    dispatch(createChangeEditContextAction(new EditContext({ path: this.dataPath.push(index) })));
  }

  public moveUp(dispatch: ActionDispatch): void {
    const moved = this._data!.moveUpForCollectionIndex(this.selectedIndex!);
    dispatch(createSetValueAction(this.dataPath, moved));
    if (moved !== this._data && !this.editContext.pathIsEmpty) {
      if (typeof this.selectedIndex === 'number') {
        dispatch(createChangeEditContextAction(new EditContext({path: this.dataPath}).push(this.selectedIndex - 1)));
      }
    }
  }

  public moveDown(dispatch: ActionDispatch): void {
    const moved = this._data!.moveDownForCollectionIndex(this.selectedIndex!);
    dispatch(createSetValueAction(this.dataPath, moved));
    if (moved !== this._data && !this.editContext.pathIsEmpty) {
      if (typeof this.selectedIndex === 'number') {
        dispatch(createChangeEditContextAction(new EditContext({path: this.dataPath}).push(this.selectedIndex + 1)));
      }
    }
  }

  public openAddForm(dispatch: ActionDispatch): void {
    dispatch(createOpenModalAction(this.addFormModelProps, (data) => {
      const currentData = this._data || this.definition.defaultCollection;
      if (currentData instanceof MapDataModel) {
        // TODO
      } else if (currentData instanceof ListDataModel) {
        dispatch(createSetValueAction(this.dataPath, currentData.push(data)));
        dispatch(createCloseModalAction());
      }
    }));
  }
  //#endregion

  updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined): UIModel {
    if (DataModelUtil.equals(this.data, data)) {
      return this;
    } else {
      const newModel = this.set('data', data) as this;
      const childModel = ContentListUIModel.childModel({...(this.propsObject), data}, lastState);
      return newModel.set('childModel', childModel) as this;
    }
  }

  updateEditContext(editContext: EditContext, lastState: UIModelState | undefined): UIModel {
    if (this.editContext.equals(editContext)) {
      return this;
    } else {
      const childModel = ContentListUIModel.childModel({...(this.propsObject), editContext}, lastState);
      const selectedIndex = ContentListUIModel.selectedIndex(
        this.definition, editContext, CollectionDataModelUtil.asCollectionDataModel(this.data), lastState);
      return this.withMutations(mutator => mutator
        .set('editContext', editContext)
        .set('childModel', childModel)
        .set('selectedIndex', selectedIndex)) as this;
    }
  }

  getState(lastState: UIModelState | undefined): ContentListUIModelState | undefined {
    const contentListLastState = ContentListUIModel.castState(lastState);
    let isChanged = false;
    let child = undefined;
    if (contentListLastState) {
      if (contentListLastState.selectedIndex !== this.selectedIndex || child !== contentListLastState.child) {
        child = this.childModel && this.childModel.getState(contentListLastState.child);
        isChanged = true;
      }
    } else {
      child = this.childModel && this.childModel.getState(undefined);
      isChanged = true;
    }

    if (isChanged) {
      return {type: 'contentList', selectedIndex: this.selectedIndex, child};
    } else {
      return contentListLastState;
    }
  }
}

applyMixins(ContentListUIModel, [ContentListUIModelRecord]);
