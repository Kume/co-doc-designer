import { List, Record } from 'immutable';
import UIModel, { UIModelProps, UIModelPropsDefault } from './UIModel';
import DataPath from '../DataModel/DataPath';
import EditContext from './EditContext';
import DataModelBase from '../DataModel/DataModelBase';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { UIModelFactory } from './UIModelFactory';
import MapDataModel from '../DataModel/MapDataModel';
import DataModelUtil from '../DataModel/DataModelUtil';
import { StringDataModel } from '../DataModel/ScalarDataModel';
import UIModelState from './UIModelState';

interface FormUIModelState extends UIModelState {
  children: {[key: string]: UIModelState};
}

const childrenKeyKey = Symbol();

const FormUIModelRecord = Record({
  ...UIModelPropsDefault,
  children: List()
});

export default class FormUIModel extends FormUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: FormUIDefinition;
  public readonly editContext: EditContext;
  public readonly children: List<UIModel>;
  public readonly dataPath: DataPath;

  //#region private static function for props
  private static children(props: UIModelProps, lastState: FormUIModelState | undefined): List<UIModel> {
    const definition = props.definition as FormUIDefinition;
    return List(definition.contents.map(content => {
      return UIModelFactory.create(
        FormUIModel.childProps(content!, props),
        lastState && lastState.children[this.contentKey(content!)]);
    }));
  }

  private static childProps(definition: UIDefinitionBase, props: UIModelProps): UIModelProps {
    const data = props.data instanceof MapDataModel ? props.data : undefined;
    let childData: DataModelBase | undefined = undefined;
    if (data) {
      if (definition.key.isKey) {
        childData = new StringDataModel(props.dataPath.elements.last().toString());
      } else {
        childData = data.valueForKey(definition.key.asMapKey);
      }
    }
    return {
      dataPath: props.dataPath.push(definition.key),
      data: childData,
      definition,
      editContext: FormUIModel.editContextForChild(definition, props.editContext)
    };
  }

  private static editContextForChild(
    childDefinition: UIDefinitionBase,
    editContext: EditContext | undefined
  ): EditContext | undefined {
    if (editContext && !editContext.pathIsEmpty) {
      const firstPathElement = editContext.path.elements.first();
      if (firstPathElement.canBeMapKey && firstPathElement.asMapKey === childDefinition.key.asMapKey) {
        return editContext.shift();
      }
    }
    return undefined;
  }

  private static castState(state: UIModelState | undefined): FormUIModelState | undefined {
    if (state && state.type === 'form') {
      return state as FormUIModelState;
    }
    return undefined;
  }

  private static contentKey(content: UIDefinitionBase): string | symbol {
    const key = content.key;
    if (key.isKey) {
      return childrenKeyKey;
    } else if (key.canBeMapKey) {
      return key.asMapKey;
    } else {
      throw new Error();
    }
  }
  //#endregion

  constructor(props: UIModelProps, lastState: UIModelState | undefined) {
    super({
      ...props,
      children: FormUIModel.children(props, FormUIModel.castState(lastState))
    });
  }

  public updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined): this {
    const mapData = data instanceof MapDataModel ? data : undefined;
    const formLastState = FormUIModel.castState(lastState);
    return this.set('data', data).set('children', List(this.children.map(child => {
      const childNewData = mapData ? mapData.valueForKey('') : undefined;
      if (DataModelUtil.equals(childNewData, child!.data)) {
        return child;
      } else {
        return child!.updateData(childNewData, formLastState && formLastState[child!.definition.key.asMapKey]);
      }
    }))) as this;
  }

  public updateEditContext(editContext: EditContext, lastState: UIModelState | undefined): this {
    const formLastState = FormUIModel.castState(lastState);
    return this.set('editContext', editContext).set('children', List(this.children.map(child => {
      const childDefinition = child!.definition;
      const childNewEditContext = FormUIModel.editContextForChild(childDefinition, editContext);
      if (EditContext.equals(child!.editContext, childNewEditContext)) {
        return child;
      } else {
        return child!.updateEditContext(editContext, formLastState && formLastState[child!.definition.key.asMapKey]);
      }
    }))) as this;
  }

  public getState(lastState: UIModelState | undefined): FormUIModelState | undefined {
    const formLastState = FormUIModel.castState(lastState);
    const children: {[key: string]: UIModelState} = formLastState ? formLastState.children : {};
    let isChanged = false;
    if (formLastState) {
      this.children.forEach((child) => {
        const childKey = FormUIModel.contentKey(child!.definition);
        const lastChildState = formLastState.children[childKey];
        const nextChildState = child!.getState(lastChildState);
        if (lastChildState !== nextChildState) {
          if (nextChildState) {
            children[childKey] = nextChildState;
          } else {
            delete children[childKey];
          }
          isChanged = true;
        }
      });
    } else {
      this.children.forEach((child) => {
        const childKey = FormUIModel.contentKey(child!.definition);
        const nextChildState = child!.getState(undefined);
        if (nextChildState) {
          children[childKey] = nextChildState;
        } else {
          delete children[childKey];
        }
      });
      isChanged = true;
    }

    if (isChanged) {
      return {type: 'form', children};
    } else {
      return formLastState;
    }
  }
}