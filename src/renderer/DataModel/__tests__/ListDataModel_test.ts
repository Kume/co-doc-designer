import MapDataModel from '../MapDataModel';
import { IntegerDataModel, StringDataModel } from '../ScalarDataModel';
import ListDataModel from '../ListDataModel';
import DataPath from '../DataPath';
import DataModelFactory from "../DataModelFactory";

describe('Unit tests for ListDataModel', () => {
  describe('Unit tests for ListDataModel.valueForKey', () => {
    it('Can get value', () => {
      const model = new ListDataModel(['a', 2]);
      expect(model.list.get(0)).toEqual(new StringDataModel('a'));
    });

    it('Can construct with object', () => {
      const model = new ListDataModel(['a', 2, {b: 5}]);
      expect(model.list.get(2)).toBeInstanceOf(MapDataModel);
    });
  });

  describe('Unit tests for ListDataModel.getValue', () => {
    it('Can get value', () => {
      const model = new ListDataModel(['a', 2]);
      const path = new DataPath([1]);
      expect(model.getValue(path)).toEqual(new IntegerDataModel(2));
    });
  });

  describe('Unit tests for ListDataModel.setValue', () => {
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

  describe('Unit tests for ListDataModel.moveUp and ListDataModel.moveDown', () => {
    it('Can move up', () => {
      const model = DataModelFactory.create(['first', 'second']) as ListDataModel;
      const moved = model.moveUp(1);
      expect(moved.getValueForIndex(0)).toEqual(new StringDataModel('second'));
      expect(moved.getValueForIndex(1)).toEqual(new StringDataModel('first'));
    });

    it('Can move down', () => {
      const model = DataModelFactory.create(['first', 'second']) as ListDataModel;
      const moved = model.moveDown(0);
      expect(moved.getValueForIndex(0)).toEqual(new StringDataModel('second'));
      expect(moved.getValueForIndex(1)).toEqual(new StringDataModel('first'));
    });
  });
});