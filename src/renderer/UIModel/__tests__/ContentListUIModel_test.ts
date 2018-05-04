import { TextUIDefinitionConfigObject } from '../../UIDefinition/TextUIDefinition';
import { UIDefinitionFactory } from '../../UIDefinition/UIDefinitionFactory';
import { ContentListUIDefinitionConfigObject } from '../../UIDefinition/ContentListUIDefinition';
import DataModelFactory from '../../DataModel/DataModelFactory';
import { UIModelManager } from '../UIModelManager';
import ContentListUIModel from '../ContentListUIModel';
import EditContext from '../EditContext';
import TextUIModel from '../TextUIModel';
import DataPath from '../../DataModel/DataPath';
import { StringDataModel } from '../../DataModel/ScalarDataModel';

const simpleUIDefinition = UIDefinitionFactory.create(<ContentListUIDefinitionConfigObject> {
  type: 'contentList',
  key: '',
  title: '',
  listIndexKey: '$key',
  content: <TextUIDefinitionConfigObject> {
    type: 'text',
    title: '',
    key: '',
    emptyToNull: false
  },
  addFormContent: <TextUIDefinitionConfigObject> {
    type: 'text',
    title: '',
    key: '',
    emptyToNull: false
  },
  addFormDefaultValue: 'test'
});
const simpleData = DataModelFactory.create(['first', 'second']);
const simpleProps = {
  data: simpleData,
  definition: simpleUIDefinition,
  editContext: new EditContext(),
  dataPath: new DataPath([])
};
const simpleModel = new ContentListUIModel(simpleProps, undefined);

describe('Test for ContentListUIModel', () => {
  describe('Test ContentListUIModel.constructor', () => {
    it('Simple construct', () => {
      const child = simpleModel.childModel as TextUIModel;
      expect(child).toBeInstanceOf(TextUIModel);
      expect(child.text).toBe('first');
    });
  });

  describe('Test ContentListUIModel.selectIndex', () => {
    it('select second element', () => {
      const manager = new UIModelManager();
      manager.initialize(simpleData, simpleUIDefinition);
      (manager.model as ContentListUIModel).selectIndex(manager.dispatch, 1);
      const child = (manager.model as ContentListUIModel).childModel as TextUIModel;
      expect(child.text).toBe('second');
    });
  });

  describe('Unit tests for ContentListUIModel.moveUp and ContentListUIModel.moveDown', () => {
    it('Can move up', () => {
      const manager = new UIModelManager();
      manager.initialize(simpleData, simpleUIDefinition);
      (manager.model as ContentListUIModel).selectIndex(manager.dispatch, 1);
      (manager.model as ContentListUIModel).moveUp(manager.dispatch);
      expect(manager.data.getValue(new DataPath(0))).toEqual(new StringDataModel('second'));
      expect(manager.data.getValue(new DataPath(1))).toEqual(new StringDataModel('first'));
    });

    it('Can move down', () => {
      const manager = new UIModelManager();
      manager.initialize(simpleData, simpleUIDefinition);
      (manager.model as ContentListUIModel).moveDown(manager.dispatch);
      expect(manager.data.getValue(new DataPath(0))).toEqual(new StringDataModel('second'));
      expect(manager.data.getValue(new DataPath(1))).toEqual(new StringDataModel('first'));
    });

    it('Follow selected data after move', () => {
      const manager = new UIModelManager();
      manager.initialize(simpleData, simpleUIDefinition);
      (manager.model as ContentListUIModel).moveDown(manager.dispatch);
      const child = (manager.model as ContentListUIModel).childModel as TextUIModel;
      expect(child.text).toBe('first');
    });

    it('Follow selected data after select and move', () => {
      const manager = new UIModelManager();
      manager.initialize(simpleData, simpleUIDefinition);
      (manager.model as ContentListUIModel).selectIndex(manager.dispatch, 1); // Select "second"
      (manager.model as ContentListUIModel).moveUp(manager.dispatch); // Click moveUp
      const child = (manager.model as ContentListUIModel).childModel as TextUIModel;
      expect(child.text).toBe('second');
    });
  });
});