import MapDataModel from '../MapDataModel';
import { IntegerDataModel } from '../ScalarDataModel';
import ListDataModel from '../ListDataModel';
import DataPath from '../DataPath';

describe('Test for valueForKey', () => {
  it('Can get value', () => {
    const model = new MapDataModel({a: 2});
    expect(model.valueForKey('a')).toEqual(new IntegerDataModel(2));
  });

  it('Return undefined for non-existent key', () => {
    const model = new MapDataModel({a: 2});
    expect(model.valueForKey('b')).toBeUndefined();
  });

  it('Can construct with array', () => {
    const model = new MapDataModel({a: 2, b: ['b', 5]});
    expect(model.valueForKey('b')).toBeInstanceOf(ListDataModel);
  });
});

describe('Test for getValue', () => {
  it('Can get value', () => {
    const model = new MapDataModel({a: 2});
    const path = new DataPath(['a']);
    expect(model.getValue(path)).toEqual(new IntegerDataModel(2));
  });

  it('Can get value deeply', () => {
    const model = new MapDataModel({a: 2, b: ['b', {c: 9}]});
    const path = new DataPath(['b', 1, 'c']);
    expect(model.getValue(path)).toEqual(new IntegerDataModel(9));
  });
});

describe('Test for setValue', () => {
  it('Can set value for key', () => {
    const model = new MapDataModel({a: 2});
    const path = new DataPath('a');
    const updatedModel = model.setValue(path, new IntegerDataModel(5)) as MapDataModel;
    expect(updatedModel.valueForKey('a')).toEqual(new IntegerDataModel(5));
  });

  it('Can set value for key deeply', () => {
    const model = new MapDataModel({a: {b: {c: 9}}});
    const path = new DataPath(['a', 'b']);
    const updatedModel = model.setValue(path, new IntegerDataModel(5));
    expect(updatedModel).toEqual(new MapDataModel({a: {b: 5}}));
  });

  it('Can set value for key deeply with ListDataModel', () => {
    const model = new MapDataModel({a: [{b: 2}]});
    const path = new DataPath(['a', 0, 'b']);
    const updatedModel = model.setValue(path, new IntegerDataModel(5));
    expect(updatedModel).toEqual(new MapDataModel({a: [{b: 5}]}));
  });
});