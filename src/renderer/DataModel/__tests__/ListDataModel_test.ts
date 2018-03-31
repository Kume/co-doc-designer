import MapDataModel from '../MapDataModel';
import { IntegerDataModel, StringDataModel } from '../ScalarDataModel';
import ListDataModel from '../ListDataModel';
import DataPath from '../DataPath';

describe('Test for valueForKey', () => {
  it('Can get value', () => {
    const model = new ListDataModel(['a', 2]);
    expect(model.list.get(0)).toEqual(new StringDataModel('a'));
  });

  it('Can construct with object', () => {
    const model = new ListDataModel(['a', 2, {b: 5}]);
    expect(model.list.get(2)).toBeInstanceOf(MapDataModel);
  });
});

describe('Test for getValue', () => {
  it('Can get value', () => {
    const model = new ListDataModel(['a', 2]);
    const path = new DataPath([1]);
    expect(model.getValue(path)).toEqual(new IntegerDataModel(2));
  });
});

describe('Test for setValue', () => {
  it('Can set for index', () => {
    const model = new ListDataModel(['a', 2]);
    const updatedModel = model.setValue(new DataPath([0]), new StringDataModel('b')) as ListDataModel;
    expect(updatedModel.list.get(0)).toEqual(new StringDataModel('b'));
  });

  it('Do not affect to other element', () => {
    const model = new ListDataModel(['a', 2]);
    const updatedModel = model.setValue(new DataPath([0]), new StringDataModel('b')) as ListDataModel;
    expect(updatedModel.list.get(1)).toEqual(new IntegerDataModel(2));
  });
});