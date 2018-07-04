declare module 'react-handsontable' {
  import * as React from 'react';
  import * as Handsontable from 'handsontable';

  namespace HotTable {
    interface Props extends Handsontable.DefaultSettings {
      root?: string;
      settings?: Handsontable.DefaultSettings;
    }
  }
  class HotTable extends React.Component<HotTable.Props, {}> { }
  export default HotTable;
}
