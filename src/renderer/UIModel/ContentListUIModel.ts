import { Record } from "immutable";
import DataModelBase, { CollectionDataModel, CollectionIndex } from "../DataModel/DataModelBase";
import { applyMixins } from "../../common/util";
import ContentListUIDefinition from "../UIDefinition/ContentListUIDefinition";
import MapDataModel from "../DataModel/MapDataModel";
import DataPath from "../DataModel/DataPath";
import ScalarDataModel from "../DataModel/ScalarDataModel";
import UIModel, { ActionDispatch, UIModelProps, UIModelPropsDefault } from "./UIModel";
import EditContext from "../UIView/EditContext";
import CollectionDataModelUtil from "../DataModel/CollectionDataModelUtil";
import { UIModelFactory } from "./UIModelFactory";
import DataModelUtil from "../DataModel/DataModelUtil";
import {
  createChangeEditContextAction, createCloseModalAction, createOpenModalAction,
  createSetValueAction
} from "./UIModelAction";
import ListDataModel from "../DataModel/ListDataModel";

export interface ContentListIndex {
  index: CollectionIndex;
  isInvalid: boolean;
  isSelected: boolean;
  title: string;
  description?: string;
}

const ContentListUIModelRecord = Record({
  ...UIModelPropsDefault,
  childModel: undefined,
  selectedData: undefined,
});

export default class ContentListUIModel extends ContentListUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: ContentListUIDefinition;
  public readonly editContext: EditContext;
  public readonly childModel: UIModel | undefined;
  public readonly dataPath: DataPath;
  public readonly selectedData: DataModelBase | undefined;

  constructor(props: UIModelProps) {
    super({
      ...props,
      childModel: ContentListUIModel.childModel(props),
      selectedData: ContentListUIModel.selectedData(props)
    });
  }

  private static selectedData(props: UIModelProps): DataModelBase | undefined {
    const collectionData = CollectionDataModelUtil.asCollectionDataModel(props.data);
    const index = props.editContext.currentIndexForData(collectionData);
    if (index === undefined) { return undefined; }
    return collectionData && collectionData.getValue(new DataPath(index));
  }

  private static childProps(props: UIModelProps, lastSelectedData?: DataModelBase): UIModelProps | undefined {
    const collectionData = CollectionDataModelUtil.asCollectionDataModel(props.data);
    const index = props.editContext.currentIndexForData(collectionData, lastSelectedData);
    if (index === undefined) {
      return undefined;
    }
    const definition = props.definition as ContentListUIDefinition;
    return {
      editContext: props.editContext.shift(),
      dataPath: props.dataPath.push(index),
      data: CollectionDataModelUtil.getValueForIndex(collectionData, index),
      definition: definition.content
    };
  }

  private static childModel(props: UIModelProps, lastSelectedData?: DataModelBase): UIModel | undefined {
    const childProps = ContentListUIModel.childProps(props, lastSelectedData);
    return childProps && UIModelFactory.create(childProps);
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
    }
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

  public get selectedIndex(): CollectionIndex | undefined {
    return this.editContext.currentIndexForData(this._data, this.selectedData);
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
    dispatch(createChangeEditContextAction(new EditContext({ path: this.dataPath.push(index) })))
  }

  public moveUp(dispatch: ActionDispatch): void {
    dispatch(createSetValueAction(this.dataPath, this._data!.moveUpForCollectionIndex(this.selectedIndex!)));
  }

  public moveDown(dispatch: ActionDispatch): void {
    dispatch(createSetValueAction(this.dataPath, this._data!.moveDownForCollectionIndex(this.selectedIndex!)));
  }

  public openAddForm(dispatch: ActionDispatch): void {
    dispatch(createOpenModalAction(this.addFormModelProps, (data) => {
      const currentData = this._data || this.definition.defaultCollection;
      if (currentData instanceof MapDataModel) {

      } else if (currentData instanceof ListDataModel) {
        dispatch(createSetValueAction(this.dataPath, currentData.push(data)));
        dispatch(createCloseModalAction());
      }
    }));
  }
  //#endregion

  public updateProps(props: UIModelProps): UIModel {
    let newModel = this;
    if (!this.editContext.equals(props.editContext)) {
      newModel = newModel.set('editContext', props.editContext) as this;
    }
    if (!DataModelUtil.equals(this.data, props.data)) {
      newModel = newModel.set('data', props.data) as this;
    }
    const childProps = ContentListUIModel.childProps(props);
    const childModel = childProps && UIModelFactory.create(childProps);
    newModel = newModel.set('childModel', childModel) as this;
    return newModel;
  }

  updateData(data: DataModelBase): UIModel {
    if (DataModelUtil.equals(this.data, data)) {
      return this;
    } else {
      const newModel = this.set('data', data) as this;
      const childModel = ContentListUIModel.childModel({...(this.propsObject), data}, this.selectedData);
      return newModel.set('childModel', childModel) as this;
    }
  }

  updateEditContext(editContext: EditContext): UIModel {
    if (this.editContext.equals(editContext)) {
      return this;
    } else {
      const newModel = this.set('editContext', editContext) as this;
      const childModel = ContentListUIModel.childModel({...(this.propsObject), editContext}, this.selectedData);
      return newModel.set('childModel', childModel) as this;
    }
  }
}

applyMixins(ContentListUIModel, [ContentListUIModelRecord]);
