import ObjectDataStorage from '../ObjectDataStorage';

describe('Test for saveAsync', () => {
  it('Save with single path', async () => {
    const storage = new ObjectDataStorage();
    await storage.saveAsync(['test_path'], 'test_content');
    expect(storage.data).toEqual({test_path: 'test_content'});
  });
});