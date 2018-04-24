#set($name = $NAME.replace("UIModel", ""))
import { Record } from "immutable";
import UIModel, { UIModelProps, UIModelPropsDefault } from "./UIModel";
import DataPath from "../DataModel/DataPath";
import EditContext from "./EditContext";
import DataModelBase from "../DataModel/DataModelBase";
import ${name}UIDefinition from "../UIDefinition/${name}UIDefinition";
import UIDefinitionBase from "../UIDefinition/UIDefinitionBase";
import { UIModelFactory } from "./UIModelFactory";

const ${NAME}Record = Record({
  ...UIModelPropsDefault
});

export default class ${NAME} extends ${NAME}Record implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: ${name}UIDefinition;
  public readonly editContext: EditContext;
  public readonly dataPath: DataPath;

  constructor(props: UIModelProps) {
    super({
      ...props
    });
  }

  public get propsObject(): UIModelProps {
    return {
      definition: this.definition,
      dataPath: this.dataPath,
      data: this.data,
      editContext: this.editContext
    }
  }

  updateData(data: DataModelBase | undefined): this {
    return this.set('data', data) as this;
  }

  updateEditContext(editContext: EditContext): this {
    return this.set('editContext', editContext) as this;
  }
}