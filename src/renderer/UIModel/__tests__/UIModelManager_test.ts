import { UIDefinitionFactory } from '../../UIDefinition/UIDefinitionFactory';
import { TextUIDefinitionConfigObject } from '../../UIDefinition/TextUIDefinition';
import DataModelFactory from '../../DataModel/DataModelFactory';
import { UIModelManager } from '../UIModelManager';
import TextUIModel from '../TextUIModel';

const simpleUIDefinition = UIDefinitionFactory.create({
  type: 'text',
  title: '',
  key: '',
  emptyToNull: false
} as TextUIDefinitionConfigObject);

const simpleData = DataModelFactory.create('foo');

describe('Test for UIModelManager', () => {
  describe('Test UIModelManager.initialize', () => {
    it('Simple initialize', () => {
      const manager = new UIModelManager();
      manager.initialize(simpleData, simpleUIDefinition);
      const model = manager.model as TextUIModel;
      expect(model).toBeInstanceOf(TextUIModel);
      expect(model.text).toBe('foo');
    });
  });

  describe('Test UIModelManager.updateProps', () => {
    it('Simple initialize', () => {
      const manager = new UIModelManager();
      manager.initialize(simpleData, simpleUIDefinition);
      (manager.model as TextUIModel).inputText(manager.dispatch, 'bar');
      const model = manager.model as TextUIModel;
      expect(model).toBeInstanceOf(TextUIModel);
      expect(model.text).toBe('bar');
    });
  });
});