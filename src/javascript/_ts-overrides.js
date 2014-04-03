Ext.override(Rally.ui.menu.bulk.RecordMenu,{
    items: [
        {xtype: 'rallyrecordmenuitembulkedit'},
        {xtype: 'tsbulkverdict'}
    ]
});

//Ext.override(Rally.ui.grid.CheckboxModel,{
//    getHeaderConfig: function() {
//        return Ext.apply(this.callParent(arguments), { cls: this.self.headerCheckboxCls });
//    }
//});


    Ext.override(Rally.ui.grid.ColumnBuilder, {
        _disabledEditorColumnsAsNeeded: function(columns) {
            if (this.disabledEditorColumns && this.disabledEditorColumns.length > 0) {
                _.each(columns, function(column) {
//                    Fix for IE 8
//                    if (this.disabledEditorColumns.indexOf(column.dataIndex) > -1) {
                    if (Ext.Array.indexOf(this.disabledEditorColumns,column.dataIndex) > -1) {
                        column.editor = undefined;
                        column.tdCls = column.tdCls.replace('editable', '');
                    }
                }, this);
            }
            return columns;
        }
    });