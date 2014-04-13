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

/**
 * Override the checkbox model to stop the page from moving
 * around when a checkbox is checked in IE
 * 
 */
Ext.override(Ext.selection.CheckboxModel, {
    onRowMouseDown: function(view, record, item, index, e) {
        //view.el.focus();
        var me = this,
            checker = e.getTarget('.' + Ext.baseCSSPrefix + 'grid-row-checker'),
            mode;
            
        if (!me.allowRightMouseSelection(e)) {
            return;
        }

        // checkOnly set, but we didn't click on a checker.
        if (me.checkOnly && !checker) {
            return;
        }

        if (checker) {
            mode = me.getSelectionMode();
            // dont change the mode if its single otherwise
            // we would get multiple selection
            if (mode !== 'SINGLE') {
                me.setSelectionMode('SIMPLE');
            }
            me.selectWithEvent(record, e);
            me.setSelectionMode(mode);
        } else {
            me.selectWithEvent(record, e);
        }
    }
});
