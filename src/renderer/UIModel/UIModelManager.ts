import DataPath from "../DataModel/DataPath";
import DataModelBase from "../DataModel/DataModelBase";
import UIDefinitionBase from "../UIDefinition/UIDefinitionBase";
import UIModel, { UIModelProps } from "./UIModel";
import {
  ActionType, ChangeEditContextAction, NotifyDataFunction, OpenModalAction, SetValueAction,
  UIModelAction
} from "./UIModelAction";
import { UIModelFactory } from "./UIModelFactory";
import EditContext from "./EditContext";

interface Function {
  (): void;
}

export class UIModelManager {
  private _data: DataModelBase;
  private _definition: UIDefinitionBase;
  private _model: UIModel;
  private _editContext: EditContext = EditContext.empty;
  private _modalData: DataModelBase | undefined;
  private _modalModel: UIModel | undefined;
  private _modalEditContext: EditContext = EditContext.empty;
  private _onModalSubmit: NotifyDataFunction;
  public notifyModelChanged?: Function;
  public notifyModalModelChanged?: Function;

  public constructor() {
    this.dispatch = this.dispatch.bind(this);
    this.dispatchForModal = this.dispatchForModal.bind(this);
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
      case ActionType.OpenModal:
        const openModalAction = action as OpenModalAction;
        this.openModal(openModalAction.modelProps, openModalAction.onSubmit);
        break;
      case ActionType.CloseModal:
        this.closeModal();
        break;
    }
  }

  public dispatchForModal(action: UIModelAction) {
    switch (action.type) {
      case ActionType.SetValue:
        const setValueAction = action as SetValueAction;
        this.setValueForModal(setValueAction.path, setValueAction.data);
        break;
      case ActionType.ChangeEditContext:
        const changeEditContextAction = action as ChangeEditContextAction;
        this.changeEditContext(changeEditContextAction.editContext);
        break;
      case ActionType.OpenModal:
        throw new Error('Cannot open modal on modal.');
      case ActionType.CloseModal:
        this.closeModal();
        break;
    }
  }

  public setValue(path: DataPath, data: DataModelBase) {
    try {
      const newData = this._data.setValue(path, data);
      this._model = this._model.updateData(newData);
      this._data = newData;
      this.notifyModelChanged && this.notifyModelChanged();
    } catch (error) {
      console.log('error', error);
      // TODO Error Handling
    }
  }

  public changeEditContext(editContext: EditContext): void {
    try {
      this._model = this._model.updateEditContext(editContext);
      this._editContext = editContext;
      this.notifyModelChanged && this.notifyModelChanged();
    } catch (error) {
      console.log('error', error);
      // TODO Error Handling
    }
  }

  public openModal(modelProps: UIModelProps, onSubmit: NotifyDataFunction): void {
    try {
      this._modalModel = UIModelFactory.create(modelProps);
      this._modalData = modelProps.data;
      this._onModalSubmit = onSubmit;
      this.notifyModalModelChanged && this.notifyModalModelChanged();
    } catch (error) {
      console.log('error', error);
      // TODO Error Handling
    }
  }

  public closeModal(): void {
    this._modalModel = undefined;
    this.notifyModalModelChanged && this.notifyModalModelChanged();
  }

  public setValueForModal(path: DataPath, data: DataModelBase) {
    try {
      const newData = this._modalData!.setValue(path, data);
      this._modalModel = this._modalModel!.updateData(newData);
      this._modalData = newData;
      this.notifyModalModelChanged && this.notifyModalModelChanged();
    } catch (error) {
      console.log('error', error);
      // TODO Error Handling
    }
  }

  get model(): UIModel {
    return this._model;
  }

  get modalModel(): UIModel | undefined {
    return this._modalModel;
  }

  get definition(): UIDefinitionBase {
    return this._definition;
  }

  get data(): DataModelBase {
    return this._data;
  }

  get onModalSubmit(): NotifyDataFunction {
    return this._onModalSubmit;
  }

  get modalData(): DataModelBase | undefined {
    return this._modalData;
  }
}