import DataPath from "../DataModel/DataPath";
import DataModelBase from "../DataModel/DataModelBase";
import UIDefinitionBase from "../UIDefinition/UIDefinitionBase";
import UIModel from "./UIModel";
import { ActionType, ChangeEditContextAction, SetValueAction, UIModelAction } from "./UIModelAction";
import { UIModelFactory } from "./UIModelFactory";
import EditContext from "../UIView/EditContext";

interface NotifyStateModelChanged {
  (model: UIModel): void;
}

export class UIModelManager {
  private _data: DataModelBase;
  private _definition: UIDefinitionBase;
  private _model: UIModel;
  private _editContext: EditContext = EditContext.empty;
  public notifyModelChanged?: NotifyStateModelChanged;

  public constructor() {
    this.dispatch = this.dispatch.bind(this);
  }

  public initialize(data: DataModelBase, definition: UIDefinitionBase) {
    this._model = UIModelFactory.create({
      definition,
      data,
      editContext: EditContext.empty,
      dataPath: DataPath.empty
    });
    this._data = data;
    this._definition = definition;
    this._editContext = EditContext.empty;
  }

  public dispatch(action: UIModelAction) {
    switch (action.type) {
      case ActionType.SetValue:
        const setValueAction = action as SetValueAction;
        this.setValue(setValueAction.path, setValueAction.data);
        break;
      case ActionType.ChangeEditContext:
        const changeEditContextAction = action as ChangeEditContextAction;
        this.changeEditContext(changeEditContextAction.editContext);
        break;
    }
  }

  public setValue(path: DataPath, data: DataModelBase) {
    try {
      const newData = this._data.setValue(path, data);
      this._model = this._model.updateData(newData);
      this._data = newData;
      this.notifyModelChanged && this.notifyModelChanged(this._model);
    } catch (error) {
      console.log('error', error);
      // TODO Error Handling
    }
  }

  public changeEditContext(editContext: EditContext): void {
    try {
      this._model = this._model.updateEditContext(editContext);
      this._editContext = editContext;
      this.notifyModelChanged && this.notifyModelChanged(this._model);
    } catch (error) {
      console.log('error', error);
      // TODO Error Handling
    }
  }

  get model(): UIModel {
    return this._model;
  }

  get definition(): UIDefinitionBase {
    return this._definition;
  }

  get data(): DataModelBase {
    return this._data;
  }
}