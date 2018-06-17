import FormUIModel2 from '../FormUIModel2';
import FormUIDefinition, { FormUIDefinitionConfigObject } from '../../UIDefinition/FormUIDefinition';
import { UIModel2Props } from '../UIModel2';
import MapDataModel from '../../DataModel/MapDataModel';
import DataPath from '../../DataModel/Path/DataPath';
import DataModelBase from '../../DataModel/DataModelBase';
import { StringDataModel } from '../../DataModel/ScalarDataModel';
import { SetDataAction } from '../../DataModel/DataAction';
import TextUIModel2 from '../TextUIModel2';
import { UIDefinitionFactory } from '../../UIDefinition/UIDefinitionFactory';

require('../UIModel2Factory');

const basicDefinition: FormUIDefinitionConfigObject = <FormUIDefinitionConfigObject> {
  type: 'form',
  key: '',
  title: 'test',
  contents: [
    { type: 'text', key: 'a', title: 'A' },
    { type: 'text', key: 'b', title: 'B' },
  ]
};
function createBasicProps(data: DataModelBase): UIModel2Props {
  return new UIModel2Props({
    data,
    path: DataPath.empty,
    editContext: undefined,
    state: undefined
  });
}
const basicProps = createBasicProps(MapDataModel.create({ a: 'foo', b: 'bar' }));
const basicModel = new FormUIModel2(UIDefinitionFactory.create(basicDefinition) as FormUIDefinition, basicProps);

describe('Unit tests for FormUIModel2', () => {
  it ('Can get children', () => {
    expect(basicModel.children.size).toBe(2);
    const firstChild = basicModel.children.get('a');
    expect(firstChild).toBeInstanceOf(TextUIModel2);
    expect(firstChild!.props.data!.toJsonObject()).toBe('foo');
  });
  it('Can update children', () => {
    const updateAction = <SetDataAction> { type: 'Set', data: StringDataModel.create('***')};
    const updatedData = basicModel.props.data!.applyAction(DataPath.parse('a'), updateAction);
    const updatedProps = createBasicProps(updatedData);
    const updatedModel = new FormUIModel2(basicModel.definition, updatedProps, basicModel);
    expect((<TextUIModel2> updatedModel.children.get('a')).text).toBe('***');
    expect(updatedModel.children.get('b')).toBe(basicModel.children.get('b'));
  });
});