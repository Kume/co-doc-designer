import ObjectDataStorage from '../ObjectDataStorage';
import DataMapper, { DataMapperConfig } from '../DataMapper';
import DataModelFactory from '../DataModelFactory';

describe('Unit Test for DataMapper', () => {
  describe('Common save and load test', () => {
    interface TestData {
      mapperConfig: DataMapperConfig;
      data: any;
      file: any;
    }
    const testData = new Map<string, TestData>([
      ['single file', {
        mapperConfig: {children: []},
        data: {a: 2},
        file: {'index.yml': 'a: 2\n'}
      }],
      ['Anther file with single type', {
        mapperConfig: {
          children: [
            {type: 'single', fileName: 'sub.yml', path: 'b', directory: ''}
          ]
        },
        data: {a: 2, b: {c: 9}},
        file: {
          'index.yml': 'a: 2\nb: sub.yml\n',
          'sub.yml': 'c: 9\n'
        }
      }],
      ['Multi file with map type', {
        mapperConfig: {
          children: [
            {type: 'map', path: 'z', directory: 'sub'}
          ]
        },
        data: {z: {a: 2, b: 5, c: 9}},
        file: {
          'index.yml': 'z:\n  a: sub/a.yml\n  b: sub/b.yml\n  c: sub/c.yml\n',
          'sub/a.yml': '2\n',
          'sub/b.yml': '5\n',
          'sub/c.yml': '9\n'
        }
      }],
      ['Single type under map type', {
        mapperConfig: {
          children: [
            {type: 'map', path: 'z', directory: 'sub', children: [
                {type: 'single', path: 'd', directory: '', fileName: 'subsub.yml'}
              ]}
          ]
        },
        data: {z: {a: 2, c: {d: 20, e: 97}}},
        file: {
          'index.yml': 'z:\n  a: sub/a.yml\n  c: sub/c.yml\n',
          'sub/a.yml': '2\n',
          'sub/c.yml': 'd: c/subsub.yml\ne: 97\n',
          'sub/c/subsub.yml': '20\n'
        }
      }],
      ['Map type under single type', {
        mapperConfig: {
          children: [
            {type: 'single', path: 'a', directory: '', fileName: 'sub.yml', children: [
                {type: 'map', path: 'c', directory: 'subdir'}
              ]}
          ]
        },
        data: {a: {c: {d: 20, e: 97}}, b: 5},
        file: {
          'index.yml': 'a: sub.yml\nb: 5\n',
          'sub.yml': 'c:\n  d: subdir/d.yml\n  e: subdir/e.yml\n',
          'subdir/d.yml': '20\n',
          'subdir/e.yml': '97\n',
        }
      }],
    ]);

    testData.forEach((testDatum: TestData, key: string) => {
      it(`Save with [${key}]`, async () => {
        const storage = new ObjectDataStorage();
        const mapper = DataMapper.build(testDatum.mapperConfig, storage);
        const data = DataModelFactory.createDataModel(testDatum.data);
        await mapper.saveAsync(data);
        expect(storage.data).toEqual(testDatum.file);
      });

      it(`Load with [${key}]`, async () => {
        const storage = new ObjectDataStorage();
        for (const filePath of Object.keys(testDatum.file)) {
          await storage.saveAsync(filePath.split('/'), testDatum.file[filePath]);
        }
        const mapper = DataMapper.build(testDatum.mapperConfig, storage);
        const loaded = await mapper.loadAsync();
        expect(loaded).toEqual(DataModelFactory.createDataModel(testDatum.data));
      });
    });
  });
});