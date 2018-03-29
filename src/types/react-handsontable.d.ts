declare module 'react-handsontable' {
  import * as React from 'react';
  import * as Handsontable from 'handsontable';

  namespace HotTable {
    interface Props extends Handsontable._Handsontable.DefaultSettings {
      root?: string;
      settings?: Handsontable._Handsontable.DefaultSettings;
    }
  }
  class HotTable extends React.Component<HotTable.Props, {}> { }
  export default HotTable;
}
