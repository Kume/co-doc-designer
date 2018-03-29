import ScalarDataModel, { ScalarDataModelType } from '../ScalarDataModel';

describe('Test for constructor', () => {
  it('Constructor for number', () => {
    const model = new ScalarDataModel(3);
    expect(model.type).toBe(ScalarDataModelType.Number);
    expect(model.value).toBe(3);
  });

  it('Constructor for string', () => {
    const model = new ScalarDataModel('test');
    expect(model.type).toBe(ScalarDataModelType.String);
    expect(model.value).toBe('test');
  });

  it('Constructor for null', () => {
    const model = new ScalarDataModel(null);
    expect(model.type).toBe(ScalarDataModelType.Null);
    expect(model.value).toBe(null);
  });
});
