import MapDataModel from '../MapDataModel';
import { IntegerDataModel, StringDataModel } from '../ScalarDataModel';
import ListDataModel from '../ListDataModel';
import DataPath from '../Path/DataPath';
import DataModelFactory from '../DataModelFactory';
import { InsertDataAction } from '../DataAction';

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

  describe('Unit tests for ListDataModel.collectValue', () => {
    it('Can collect single value', () => {
      const model = DataModelFactory.create(['first', 'second', 'third']) as ListDataModel;
      const path = DataPath.parse('1', []);
      const collected = model.collectValue(path);
      expect(collected.length).toBe(1);
      expect((<StringDataModel> collected[0].data).value).toBe('second');
    });

    it('Can collect with single wild card', () => {
      const model = DataModelFactory.create(['first', 'second', 'third']) as ListDataModel;
      const path = DataPath.parse('*', []);
      const collected = model.collectValue(path);
      expect(collected.length).toBe(3);
      expect((<StringDataModel> collected[1].data).value).toBe('second');
      expect((<StringDataModel> collected[2].data).value).toBe('third');
    });
  });

  describe('Unit tests for ListDataModel.applyInsertAction', () => {
    const insertData = new StringDataModel('***');
    (<{description: string, action: InsertDataAction, expect: string[]}[]> [
      {
        description: 'Can insert with target index',
        action: {type: 'Insert', data: insertData, targetIndex: 1},
        expect: ['first', '***', 'second', 'third']
      },
      {
        description: 'Can insert after with target index',
        action: {type: 'Insert', data: insertData, targetIndex: 1, isAfter: true},
        expect: ['first', 'second', '***', 'third']
      },
      {
        description: 'Can insert last with target index',
        action: {type: 'Insert', data: insertData, targetIndex: 3},
        expect: ['first', 'second', 'third', '***']
      },
      {
        description: 'Can insert first with target index',
        action: {type: 'Insert', data: insertData, targetIndex: 0},
        expect: ['***', 'first', 'second', 'third']
      },
      {
        description: 'Can insert last with target index with isAfter option',
        action: {type: 'Insert', data: insertData, targetIndex: 2, isAfter: true},
        expect: ['first', 'second', 'third', '***']
      },
      {
        description: 'Can insert to first without index',
        action: {type: 'Insert', data: insertData},
        expect: ['***', 'first', 'second', 'third']
      },
      {
        description: 'Can insert to last without index',
        action: {type: 'Insert', data: insertData, isAfter: true},
        expect: ['first', 'second', 'third', '***']
      }
    ]).map((item) => {
      it(item.description, () => {
        const model = new ListDataModel(['first', 'second', 'third']);
        const inserted = model.applyInsertAction(item.action);
        expect(inserted.toJsonObject()).toEqual(item.expect);
      });
    });
  });

  describe('Unit tests for ListDataModel.applyDeleteAction', () => {
    it('Can delete', () => {
      const model = new ListDataModel(['first', 'second', 'third']);
      const deleted = model.applyDeleteAction({type: 'Delete', targetIndex: 1});
      expect(deleted.toJsonObject()).toEqual(['first', 'third']);
    });
  });
});