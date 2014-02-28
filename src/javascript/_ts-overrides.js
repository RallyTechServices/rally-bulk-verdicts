Ext.override(Rally.ui.menu.bulk.RecordMenu,{
    items: [
        {xtype: 'rallyrecordmenuitembulkedit'},
        {xtype: 'tsbulkverdict'}
    ]
});

Ext.override(Rally.ui.grid.CheckboxModel,{
    getHeaderConfig: function() {
        return Ext.apply(this.callParent(arguments), { cls: this.self.headerCheckboxCls });
    }
});