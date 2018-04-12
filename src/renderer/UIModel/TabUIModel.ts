import { Record } from "immutable";
import UIModel, { ActionDispatch, UIModelProps, UIModelPropsDefault } from "./UIModel";
import DataPath from "../DataModel/DataPath";
import DataModelBase from "../DataModel/DataModelBase";
import EditContext from "./EditContext";
import TabUIDefinition from "../UIDefinition/TabUIDefinition";
import MapDataModel from "../DataModel/MapDataModel";
import UIDefinitionBase from "../UIDefinition/UIDefinitionBase";
import { UIModelFactory } from "./UIModelFactory";
import { createChangeEditContextAction } from "./UIModelAction";
import DataModelUtil from "../DataModel/DataModelUtil";

export interface TabUIModelTab {
  title: string;
  key: string;
  isSelected: boolean;
}

const TabUIModelRecord = Record({
  ...UIModelPropsDefault,
  childModel: undefined
});

export default class TabUIModel extends TabUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: TabUIDefinition;
  public readonly editContext: EditContext;
  public readonly childModel: UIModel;
  public readonly dataPath: DataPath;
  public readonly selectedData: DataModelBase | undefined;

  constructor(props: UIModelProps) {
    super({
      ...props,
      childModel: TabUIModel.childModel(props)
    });
  }

  //#region private static function for props
  private static selectedData(props: UIModelProps): DataModelBase | undefined {
    if (props.data instanceof MapDataModel) {
      const content = this.selectedContent(props.definition as TabUIDefinition, props.editContext);
      return props.data.valueForKey(content.key.asMapKey)
    }
    return undefined;
  }

  private static selectedContent(definition: TabUIDefinition, editContext: EditContext): UIDefinitionBase {
    if (editContext.pathIsEmpty) {
      return definition.contents.first();
    } else {
      const contextPathElement = editContext.path.elements.first();
      if (!contextPathElement.canBeMapKey) { throw new Error('Invalid edit context') }
      const contextKey = contextPathElement.asMapKey;
      for (const content of definition.contents.toArray()) {
        if (content.key.canBeMapKey && content.key.asMapKey === contextKey) {
          return content;
        }
      }
      throw new Error('There is no matched content.');
    }
  }

  private static childModel(props: UIModelProps): UIModel {
    const selectedContent = this.selectedContent(props.definition as TabUIDefinition, props.editContext);
    const selectedData = this.selectedData(props);
    const childProps: UIModelProps = {
      editContext: props.editContext.shift(),
      definition: selectedContent,
      data: selectedData,
      dataPath: props.dataPath.push(selectedContent.key)
    };
    return UIModelFactory.create(childProps);
  }
  //#endregion

  public get propsObject(): UIModelProps {
    return {
      definition: this.definition,
      dataPath: this.dataPath,
      data: this.data,
      editContext: this.editContext
    }
  }

  public get tabs(): Array<TabUIModelTab> {
    return this.definition.contents.toArray().map(content => {
      return {
        title: content.title,
        key: content.key.asMapKey,
        isSelected: content === TabUIModel.selectedContent(this.definition, this.editContext)
      };
    });
  }

  //#region manipulation
  public selectTab(dispatch: ActionDispatch, tabKey: string): void {
    dispatch(createChangeEditContextAction(new EditContext(this.dataPath).push(tabKey)))
  }
  //#endregion

  updateData(data: DataModelBase | undefined): UIModel {
    let newModel = this.set('data', data) as this;
    const selectedData = TabUIModel.selectedData({...this.propsObject, data});
    if (!DataModelUtil.equals(selectedData, this.childModel.data)) {
      newModel = newModel.set('childModel', this.childModel.updateData(selectedData)) as this;
    }
    return newModel;
  }

  updateEditContext(editContext: EditContext): this {
    let newModel = this.set('editContext', editContext) as this;
    const selectedContent = TabUIModel.selectedContent(this.definition, editContext);
    const currentContent = TabUIModel.selectedContent(this.definition, this.editContext);
    if (selectedContent !== currentContent) {
      newModel = newModel.set('childModel', TabUIModel.childModel({...this.propsObject, editContext})) as this;
    } else {
      newModel = newModel.set('childModel', this.childModel.updateEditContext(editContext.shift())) as this;
    }
    return newModel;
  }
}
