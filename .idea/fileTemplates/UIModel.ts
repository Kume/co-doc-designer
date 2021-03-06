#set($name = $NAME.replace("UIModel", ""))
#set($smallName = $name.toLowerCase())
import { Record } from 'immutable';
import UIModel, { ActionDispatch, UIModelProps, UIModelPropsDefault } from './UIModel';
import DataPath from '../DataModel/DataPath';
import EditContext from './EditContext';
import DataModelBase from '../DataModel/DataModelBase';
import ${name}UIDefinition from '../UIDefinition/${name}UIDefinition';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { UIModelFactory } from './UIModelFactory';
import UIModelState from './UIModelState';

interface ${name}UIModelState extends UIModelState {

}

const ${NAME}Record = Record({
  ...UIModelPropsDefault
});

export default class ${NAME} extends ${NAME}Record implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: ${name}UIDefinition;
  public readonly editContext: EditContext;
  public readonly dataPath: DataPath;
  
  //#region private static function for props
  private static castState(state: UIModelState | undefined): ${name}UIModelState | undefined {
    if (state && state.type === '${smallName}') {
      return state as ${name}UIModelState;
    }
    return undefined;
  }
  //#endregion

  public constructor(props: UIModelProps, lastState: UIModelState | undefined) {
    super({
      ...props
    });
  }
  
  //#region manipulation
  public input(dispatch: ActionDispatch, value: any): void {
  
  }
  //#endregion

  //#region implementation for UIModel
  public updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined): this {
    return this.set('data', data) as this;
  }

  public updateEditContext(editContext: EditContext, lastState: UIModelState | undefined): this {
    return this.set('editContext', editContext) as this;
  }
  
  public getState(lastState: UIModelState | undefined): ${name}UIModelState | undefined {
    let isChanged = false;
    const last${name}State = ${NAME}.castState(lastState);
    
    if (isChanged) {
      return {
        type: '$smallName'
      };
    } else {
      return last${name}State;
    }
  }
  //#endregion
}