import DataModelFactory from '../DataModelFactory';
import { DeleteDataAction, InsertDataAction, SetDataAction } from '../DataAction';
import { StringDataModel } from '../ScalarDataModel';
import DataPath from '../Path/DataPath';

describe('Integration tests for DataModel', () => {
  describe('Integration tests for applyAction of DataModels for insert action', () => {
    const insertData = StringDataModel.create('***');

    it('Can insert deeply for ListDataModel', () => {
      const model = DataModelFactory.create([{}, {a: 1, b: ['c', 'd']}, []]);
      const inserted = model.applyAction(
        DataPath.parse('1.b'),
        <InsertDataAction> {type: 'Insert', targetIndex: 1, data: insertData});
      expect(inserted.toJsonObject()).toEqual([{}, {a: 1, b: ['c', '***', 'd']}, []]);
    });

    it('Can insert deeply for MapDataModel', () => {
      const model = DataModelFactory.create({a: 1, b: [{}, {d: 11, e: 17}, {}], c: 7});
      const inserted = model.applyAction(
        DataPath.parse('b.1'),
        <InsertDataAction> {type: 'Insert', targetIndex: 'e', data: insertData, key: 'i'});
      expect(inserted.toJsonObject()).toEqual({a: 1, b: [{}, {d: 11, i: '***', e: 17}, {}], c: 7});
    });
  });

  describe('Integration tests for applyAction of DataModels for delete action', () => {
    it('Can delete deeply for ListDataModel', () => {
      const model = DataModelFactory.create([{}, {a: 1, b: ['c', 'd', 'e']}, []]);
      const inserted = model.applyAction(
        DataPath.parse('1.b'),
        <DeleteDataAction> {type: 'Delete', targetIndex: 1});
      expect(inserted.toJsonObject()).toEqual([{}, {a: 1, b: ['c', 'e']}, []]);
    });

    it('Can delete deeply for MapDataModel', () => {
      const model = DataModelFactory.create({a: 1, b: [{}, {d: 11, e: 17, f: 99}, {}], c: 7});
      const inserted = model.applyAction(
        DataPath.parse('b.1'),
        <DeleteDataAction> {type: 'Delete', targetIndex: 'e'});
      expect(inserted.toJsonObject()).toEqual({a: 1, b: [{}, {d: 11, f: 99}, {}], c: 7});
    });
  });

  describe('Integration tests for applyAction of DataModels for set action', () => {
    const setData = StringDataModel.create('***');

    it('Can set deeply for ListDataModel', () => {
      const model = DataModelFactory.create([{}, {a: 1, b: ['c', 'd', 'e']}, []]);
      const deleted = model.applyAction(
        DataPath.parse('1.b.1'),
        <SetDataAction> {type: 'Set', data: setData});
      expect(deleted.toJsonObject()).toEqual([{}, {a: 1, b: ['c', '***', 'e']}, []]);
    });

    it('Can set deeply for MapDataModel', () => {
      const model = DataModelFactory.create({a: 1, b: [{}, {d: 11, e: 17, f: 99}, {}], c: 7});
      const updated = model.applyAction(
        DataPath.parse('b.1.e'),
        <SetDataAction> {type: 'Set', data: setData});
      expect(updated.toJsonObject()).toEqual({a: 1, b: [{}, {d: 11, e: '***', f: 99}, {}], c: 7});
    });
  });
});