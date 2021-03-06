Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 5 },
    items: [
        {xtype:'container',itemId:'selector_box'},
        {xtype:'container',itemId:'display_box'},
        {xtype:'tsinfolink'}
    ],
    launch: function() {
        this.logger.log("Launch");
        this._addButton(this.down('#selector_box'));
    },
    _addButton: function(container) {
        this.logger.log("_addButton");
        container.add({
            xtype:'rallybutton',
            text: 'Choose Test Parent',
            disabled: false,
            scope: this,
            handler: function() {
                if ( this.dialog ) { this.dialog.destroy(); }
                this.dialog = Ext.create('Rally.technicalservices.TestCaseChooser',{
                    title:'Choose Parent of Test Cases',
                    parent_models: ["TestSet","TestFolder"],
                    multiple: 'SINGLE',
                    listeners: {
                        scope: this,
                        selectionMade: function(dialog, parents) {
                            this._getTestCases(parents);
                        }
                    }
                });
                this.dialog.show();
            } 
        });
    },
    _getTestCases: function(parents) {
        var me = this;
        this.logger.log("_getTestCases",parents);
        var promises = [];
        Ext.Array.each(parents, function(parent){
            promises.push(me._getCollectionFromParent(parent));
        });
        
        Deft.Promise.all(promises).then({
            scope: this,
            success: function(records) {
                this._makeGrid(Ext.Array.flatten(records));
            },
            failure: function(error) {
                alert(error);
            }
        });
    },
    _getCollectionFromParent: function(parent) {
        var deferred = Ext.create('Deft.Deferred');
        Rally.data.ModelFactory.getModel({
            type:parent.get('_type'),
            success:function(model){
                model.load(parent.get('ObjectID'),{
                    fetch:['TestCases'],
                    callback:function(result,operation){
                        result.getCollection('TestCases').load({
                            callback: function(cases,operation,success) {
                                Ext.Array.each(cases,function(tc){
                                    // pushing the parent into the tc so it's available
                                    // (in case it's a test set, so tcr related to both)
                                    tc.set('_source_container',parent);
                                });
                                deferred.resolve(cases);
                            }
                        });
                    }
                });
            }
        });
        return deferred;
    },
    _makeGrid: function(testcases) {
        this.logger.log('_makeGrid',testcases);
        this.down('#display_box').removeAll();
        
        var store = Ext.create('Rally.data.custom.Store',{
            data: testcases
        });
        
        /* fix for missing checkbox in header of table */
        var selectionModel = Ext.create('Rally.ui.selection.CheckboxModel', {
            allowDeselect: true
        });
        
        this.down('#display_box').add({
            xtype:'rallygrid',
            store: store,
            selModel: selectionModel,
            showRowActionsColumn: true,
            enableBulkEdit: true,
            pagingToolbarCfg: {
                store: store
            },
            columnCfgs: [
                {text:'id',dataIndex:'FormattedID'},
                {text:'Name',dataIndex:'Name' },
                {text:'Last Verdict',dataIndex: 'LastVerdict'},
                {text:'Last Run', dataIndex:'LastRun',renderer: Ext.util.Format.dateRenderer('Y-m-d') }
            ],
            listeners: {
                scope: this,
                render: function(grid) {
                    /* fix for missing checkbox in header of table */
                    grid.view.headerCt.child('gridcolumn[isCheckerHd]').addCls(Ext.baseCSSPrefix + 'column-header-checkbox');
                }
            }
        });
    }
});
