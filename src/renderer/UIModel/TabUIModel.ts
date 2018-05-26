import { Record } from 'immutable';
import UIModel, { ActionDispatch, UIModelProps, UIModelPropsDefault, UpdateUIModelParams } from './UIModel';
import DataPath from '../DataModel/DataPath';
import DataModelBase from '../DataModel/DataModelBase';
import EditContext from './EditContext';
import TabUIDefinition from '../UIDefinition/TabUIDefinition';
import MapDataModel from '../DataModel/MapDataModel';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { UIModelFactory } from './UIModelFactory';
import { createChangeEditContextAction } from './UIModelAction';
import DataModelUtil from '../DataModel/DataModelUtil';
import UIModelState from './UIModelState';

export interface TabUIModelTab {
  title: string;
  key: string;
  isSelected: boolean;
}

interface TabUIModelState extends UIModelState {
  children: {[key: string]: UIModelState};
  selectedTab: string | undefined;
}

const TabUIModelRecord = Record({
  ...UIModelPropsDefault,
  childModel: undefined,
  selectedTab: undefined
});

export default class TabUIModel extends TabUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: TabUIDefinition;
  public readonly editContext: EditContext;
  public readonly childModel: UIModel;
  public readonly dataPath: DataPath;
  public readonly selectedTab: string | undefined;

  //#region private static function for props
  private static dataForContent(data: DataModelBase | undefined, content: UIDefinitionBase): DataModelBase | undefined {
    if (data instanceof MapDataModel) {
      return data.valueForKey(content.key.asMapKey);
    }
    return undefined;
  }

  private static selectedContent(
    definition: TabUIDefinition,
    editContext: EditContext | undefined,
    lastState: TabUIModelState | undefined
  ): UIDefinitionBase {
    if (!editContext || editContext.pathIsEmpty) {
      if (lastState && lastState.selectedTab) {
        return TabUIModel.findContent(definition, lastState.selectedTab);
      } else {
        return definition.contents.first();
      }
    } else {
      const contextPathElement = editContext.path.elements.first();
      if (!contextPathElement.canBeMapKey) { throw new Error('Invalid edit context'); }
      return TabUIModel.findContent(definition, contextPathElement.asMapKey);
    }
  }

  private static findContent(definition: TabUIDefinition, key: string): UIDefinitionBase {
    for (const content of definition.contents.toArray()) {
      if (content.key.canBeMapKey && content.key.asMapKey === key) {
        return content;
      }
    }
    throw new Error();
  }

  private static childModel(
    selectedContent: UIDefinitionBase,
    editContext: EditContext | undefined,
    data: DataModelBase | undefined,
    dataPath: DataPath,
    lastState: TabUIModelState | undefined
  ): UIModel {
    const selectedData = this.dataForContent(data, selectedContent);
    const childProps: UIModelProps = {
      editContext: editContext && editContext.shift(),
      definition: selectedContent,
      data: selectedData,
      dataPath: dataPath.push(selectedContent.key)
    };
    return UIModelFactory.create(childProps, lastState && lastState.children[selectedContent.key.asMapKey]);
  }

  private static childStateForContent(
    state: TabUIModelState | undefined,
    content: UIDefinitionBase
  ): UIModelState | undefined {
    if (state) {
      return state.children[content.key.asMapKey];
    }
    return undefined;
  }

  private static castState(state: UIModelState | undefined): TabUIModelState | undefined {
    return state && state.type === 'tab' ? state as TabUIModelState : undefined;
  }
  //#endregion

  constructor(props: UIModelProps, lastState: UIModelState | undefined) {
    const tabState = TabUIModel.castState(lastState);
    const selectedContent = TabUIModel.selectedContent(
      props.definition as TabUIDefinition,
      props.editContext,
      tabState);
    super({
      ...props,
      childModel: TabUIModel.childModel(selectedContent, props.editContext, props.data, props.dataPath, tabState),
      selectedTab: selectedContent.key.asMapKey
    });
  }

  public get tabs(): Array<TabUIModelTab> {
    return this.definition.contents.toArray().map(content => {
      return {
        title: content.title,
        key: content.key.asMapKey,
        isSelected: content.key.asMapKey === this.selectedTab
      };
    });
  }

  //#region manipulation
  public selectTab(dispatch: ActionDispatch, tabKey: string): void {
    dispatch(createChangeEditContextAction(new EditContext(this.dataPath).push(tabKey)));
  }
  //#endregion

  //#region implementation for UIModel
  updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined): this {
    let newModel = this.set('data', data) as this;
    const tabLastState = TabUIModel.castState(lastState);
    const selectedContent = TabUIModel.selectedContent(this.definition, this.editContext, tabLastState);
    const selectedData = TabUIModel.dataForContent(data, selectedContent);
    if (!DataModelUtil.equals(selectedData, this.childModel.data)) {
      const lastTabState = TabUIModel.castState(lastState);
      const lastChildState = TabUIModel.childStateForContent(lastTabState, selectedContent);
      const updateChildParams = UpdateUIModelParams.updateData(selectedData, lastChildState);
      newModel = newModel.set('childModel', this.childModel.updateModel(updateChildParams)) as this;
    }
    return newModel;
  }

  updateEditContext(editContext: EditContext | undefined, lastState: UIModelState | undefined): this {
    let newModel = this.set('editContext', editContext) as this;
    const tabLastState = TabUIModel.castState(lastState);
    const selectedContent = TabUIModel.selectedContent(this.definition, editContext, tabLastState);
    const currentContent = TabUIModel.selectedContent(this.definition, this.editContext, tabLastState);
    const lastTabState = TabUIModel.castState(lastState);
    if (selectedContent !== currentContent) {
      const childModel = TabUIModel.childModel(selectedContent, editContext, this.data, this.dataPath, lastTabState);
      newModel = newModel.withMutations(mutator => mutator
        .set('childModel', childModel)
        .set('selectedTab', selectedContent.key.asMapKey)) as this;
    } else {
      const childState = TabUIModel.childStateForContent(lastTabState, selectedContent);
      const updateChildParams = UpdateUIModelParams.updateContext(editContext && editContext.shift(), childState);
      newModel = newModel.set('childModel', this.childModel.updateModel(updateChildParams)) as this;
    }
    return newModel;
  }

  updateModel(params: UpdateUIModelParams): UIModel {
    let newModel: this = params.dataPath ? this.set('dataPath', params.dataPath.value) as this : this;
    newModel = params.data ? this.updateData(params.data.value, params.lastState) : newModel;
    newModel = params.editContext ? this.updateEditContext(params.editContext.value, params.lastState) : newModel;
    return newModel;
  }

  getState(lastState: UIModelState | undefined): TabUIModelState | undefined {
    let isChanged: boolean = false;
    const lastTabState = TabUIModel.castState(lastState);
    const children: {[key: string]: UIModelState} = lastTabState ? {...lastTabState.children} : {};

    if (this.selectedTab) {
      const lastChildState = children[this.selectedTab];
      const childState = this.childModel.getState(lastChildState);
      if (childState) {
        if (children[this.selectedTab] !== childState) {
          children[this.selectedTab] = childState;
          isChanged = true;
        }
      } else {
        if (children[this.selectedTab]) {
          delete children[this.selectedTab];
          isChanged = true;
        }
      }
    }

    if (isChanged) {
      return {
        type: 'tab',
        children,
        selectedTab: this.selectedTab
      };
    } else {
      return lastTabState;
    }
  }
  //#endregion
}
