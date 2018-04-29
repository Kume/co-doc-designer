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

  private static children(props: UIModelProps): List<UIModel> {
    const definition = props.definition as FormUIDefinition;
    return List(definition.contents.map(content => {
      return UIModelFactory.create(FormUIModel.childProps(content!, props));
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
        editContext = editContext.shift();
      }
    }
    return undefined;
  }

  constructor(props: UIModelProps) {
    super({
      ...props,
      children: FormUIModel.children(props)
    });
  }

  public get propsObject(): UIModelProps {
    return {
      definition: this.definition,
      dataPath: this.dataPath,
      data: this.data,
      editContext: this.editContext
    };
  }

  public updateData(data: DataModelBase | undefined): this {
    const mapData = data instanceof MapDataModel ? data : undefined;
    return this.set('data', data).set('children', List(this.children.map(child => {
      const childNewData = mapData ? mapData.valueForKey('') : undefined;
      if (DataModelUtil.equals(childNewData, child!.data)) {
        return child;
      } else {
        return child!.updateData(childNewData);
      }
    }))) as this;
  }

  public updateEditContext(editContext: EditContext): this {
    return this.set('editContext', editContext).set('children', List(this.children.map(child => {
      const childDefinition = child!.definition;
      const childNewEditContext = FormUIModel.editContextForChild(childDefinition, editContext);
      if (EditContext.equals(child!.editContext, childNewEditContext)) {
        return child;
      } else {
        return child!.updateEditContext(editContext);
      }
    }))) as this;
  }
}