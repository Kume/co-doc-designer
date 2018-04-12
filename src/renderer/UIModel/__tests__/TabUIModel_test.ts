import { UIDefinitionFactory } from "../../UIDefinition/UIDefinitionFactory";
import DataModelFactory from "../../DataModel/DataModelFactory";
import DataPath from "../../DataModel/DataPath";
import EditContext from "../EditContext";
import TabUIModel from "../TabUIModel";
import TextUIModel from "../TextUIModel";
import { UIModelManager } from "../UIModelManager";

const simpleUIDefinition = UIDefinitionFactory.create({
  type: 'tab',
  key: '',
  title: '',
  contents: [
    {
      type: 'text',
      key: 'first_tab',
      title: 'FirstTab'
    },
    {
      type: 'text',
      key: 'second_tab',
      title: 'SecondTab'
    },
  ]
});
const simpleData = DataModelFactory.create({
  first_tab: 'first',
  second_tab: 'second'
});
const simpleProps = {
  data: simpleData,
  definition: simpleUIDefinition,
  editContext: new EditContext(),
  dataPath: new DataPath([])
};

describe('Unit tests for TabUIModel', () => {
  describe('Unit tests for ContentListUIModel.constructor', () => {
    it('Can construct', () => {
      const model = new TabUIModel(simpleProps);
      expect(model.tabs[0].key).toBe('first_tab');
      expect(model.tabs[0].title).toBe('FirstTab');
      expect(model.tabs[0].isSelected).toBe(true);
      expect(model.tabs[1].key).toBe('second_tab');
      expect(model.tabs[1].title).toBe('SecondTab');
      expect(model.tabs[1].isSelected).toBe(false);
      expect(model.childModel).toBeInstanceOf(TextUIModel);
      expect((model.childModel as TextUIModel).text).toBe('first');
    });

    it('Child is functioning', () => {
      const manager = new UIModelManager();
      manager.initialize(simpleData, simpleUIDefinition);
      let childModel = (manager.model as TabUIModel).childModel as TextUIModel;
      childModel.inputText(manager.dispatch, 'changed');
      childModel = (manager.model as TabUIModel).childModel as TextUIModel;
      expect(childModel.text).toBe('changed');
    })
  });

  describe('Unit tests for ContentListUIModel.selectTab', () => {
    it('Can select tab', () => {
      const manager = new UIModelManager();
      manager.initialize(simpleData, simpleUIDefinition);
      (manager.model as TabUIModel).selectTab(manager.dispatch, 'second_tab');
      const resultModel = manager.model as TabUIModel;
      expect(resultModel.childModel).toBeInstanceOf(TextUIModel);
      expect((resultModel.childModel as TextUIModel).text).toBe('second');
    });
  })
});