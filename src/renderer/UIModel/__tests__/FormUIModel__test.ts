import FormUIModel from '../FormUIModel';
import FormUIDefinition from '../../UIDefinition/FormUIDefinition';
import { UIModelProps } from '../UIModel';
import MapDataModel from '../../DataModel/MapDataModel';
import DataPath from '../../DataModel/Path/DataPath';
import DataModelBase from '../../DataModel/DataModelBase';
import { StringDataModel } from '../../DataModel/ScalarDataModel';
import { SetDataAction } from '../../DataModel/DataAction';
import TextUIModel from '../TextUIModel';
import { UIDefinitionFactory } from '../../UIDefinition/UIDefinitionFactory';
import { List } from 'immutable';
import { FormUIDefinitionConfig } from '../../UIDefinition/UIDefinitionConfig';

require('../UIModelFactory');

const basicDefinition: FormUIDefinitionConfig = <FormUIDefinitionConfig> {
  type: 'form',
  key: '',
  label: 'test',
  contents: [
    { type: 'text', key: 'a', label: 'A' },
    { type: 'text', key: 'b', label: 'B' },
  ]
};
function createBasicProps(data: DataModelBase): UIModelProps {
  return new UIModelProps({
    data,
    dataPath: DataPath.empty,
    modelPath: List(),
    focusedPath: undefined,
    stateNode: undefined
  });
}
const basicProps = createBasicProps(MapDataModel.create({ a: 'foo', b: 'bar' }));
const basicModel = new FormUIModel(UIDefinitionFactory.create(basicDefinition) as FormUIDefinition, basicProps);

describe('Unit tests for FormUIModel', () => {
  it ('Can get children', () => {
    expect(basicModel.children.size).toBe(2);
    const firstChild = basicModel.children.get('a');
    expect(firstChild).toBeInstanceOf(TextUIModel);
    expect(firstChild!.props.data!.toJsonObject()).toBe('foo');
  });
  it('Can update children', () => {
    const updateAction = <SetDataAction> { type: 'Set', data: StringDataModel.create('***')};
    const updatedData = basicModel.props.data!.applyAction(DataPath.parse('a'), updateAction);
    const updatedProps = createBasicProps(updatedData);
    const updatedModel = new FormUIModel(basicModel.definition, updatedProps, basicModel);
    expect((<TextUIModel> updatedModel.children.get('a')).text).toBe('***');
    expect(updatedModel.children.get('b')).toBe(basicModel.children.get('b'));
  });
});