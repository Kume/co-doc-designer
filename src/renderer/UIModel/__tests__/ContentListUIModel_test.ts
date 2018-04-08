import { TextUIDefinitionConfigObject } from "../../UIDefinition/TextUIDefinition";
import { UIDefinitionFactory } from "../../UIDefinition/UIDefinitionFactory";
import { ContentListUIDefinitionConfigObject } from "../../UIDefinition/ContentListUIDefinition";
import DataModelFactory from "../../DataModel/DataModelFactory";
import { UIModelManager } from "../UIModelManager";
import ContentListUIModel from "../ContentListUIModel";
import EditContext from "../../UIView/EditContext";
import TextUIModel from "../TextUIModel";
import DataPath from "../../DataModel/DataPath";

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
const simpleModel = new ContentListUIModel(simpleProps);

describe('Test for ContentListUIModel', () => {
  describe('Test ContentListUIModel.constructor', () => {
    it('Simple construct', () => {
      const child = simpleModel.childModel as TextUIModel;
      expect(child).toBeInstanceOf(TextUIModel);
      expect(child.text).toBe('first');
    })
  });

  describe('Test ContentListUIModel.updateProps', () => {
    it('Simple update props', () => {
      const nextState = simpleModel.updateProps({
        ...simpleProps,
        data: simpleData.setValue(new DataPath([0]), DataModelFactory.create('changed'))
      }) as ContentListUIModel;
      const child = nextState.childModel as TextUIModel;
      expect(child.text).toBe('changed');
    });
  });

  describe('Test ContentListUIModel.selectIndex', () => {
    it('select second element', () => {
      const manager = new UIModelManager();
      manager.initialize(simpleData, simpleUIDefinition);
      (manager.model as ContentListUIModel).selectIndex(manager.dispatch, 1);
      const child = (manager.model as ContentListUIModel).childModel as TextUIModel;
      expect(child.text).toBe('second');
    })
  });
});