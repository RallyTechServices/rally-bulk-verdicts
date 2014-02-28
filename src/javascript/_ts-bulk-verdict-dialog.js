Ext.define('Rally.technicalservices.VerdictDialog',{
    extend: 'Rally.ui.dialog.Dialog',
    alias: 'widget.tsverdictdialog',
    autoShow: true,
    cls: 'bulk-edit-dialog',
    title: 'Set Verdict...',
    width: 350,
    config: {
        /**
         * @cfg {[Rally.data.Model]} records (required)
         * The records to bulk edit
         */
        records: null
    },
    initComponent: function() {
        this.callParent(arguments);

        this.addEvents(
            /**
             * @param Rally.technicalservices.VerdictDialog this the dialog
             * @param {String} build the build
             * @param {String} verdict the new verdict
             */
            'verdictSelected'
        );
        
        this.add(this._getDirections());
        
        this.addDocked({
            xtype: 'toolbar',
            dock: 'bottom',
            padding: '0 0 10 0',
            layout: {
                type: 'hbox',
                pack: 'center'
            },
            ui: 'footer',
            items: [
                {
                    xtype: 'rallybutton',
                    itemId: 'applyButton',
                    text: 'Apply',
                    cls: 'primary small',
                    disabled: true,
                    handler: function() {
                        var build = Ext.String.trim( this.down('#buildField').getValue() ) ;
                        var verdict = this.down('#verdictField').getValue();
                        this.fireEvent('verdictSelected', this, build, verdict);
                        this.close();
                    },
                    scope: this
                },
                {
                    xtype: 'rallybutton',
                    text: 'Cancel',
                    cls: 'secondary small',
                    handler: function() {
                        this.close();
                    },
                    scope: this
                }
            ]
        });
        
        this.add(this._getForm());
    },

    _getForm: function() {
        return {
            xtype: 'container',
            itemId: 'form-container',
            cls: 'form-container',
            layout: { type:'hbox' },
            items: [
                {
                    xtype: 'rallytextfield',
                    itemId: 'buildField',
                    emptyText: 'Choose Build...',
                    listeners: {
                        change: this._onFieldSelect,
                        scope: this
                    }
                },
                {
                    xtype: 'component',
                    cls: 'text',
                    html: '   '
                },
                {
                    xtype: 'rallyfieldvaluecombobox',
                    itemId: 'verdictField',
                    model: 'TestCaseResult',
                    emptyText: 'Choose Verdict...',
                    field: 'Verdict',
                    listeners: {
                        select: this._onFieldSelect,
                        scope: this
                    }
                }
            ]
        }
    },
    
    _getDirections: function() {
        return {
            xtype: 'component',
            cls: 'directions',
            renderTpl: Ext.create('Ext.XTemplate',
                'For the <tpl>{[values.recordCount]}</tpl> checked ',
                '<tpl if="recordCount === 1">item<tpl else>items</tpl> set the build and verdict to:'
            ),
            renderData: {
                recordCount: this.records.length
            }
        };
    },
    
    _onFieldSelect: function() {
        var build = Ext.String.trim( this.down('#buildField').getValue() ) ;
        var verdict = this.down('#verdictField').getValue();
        
        if ( build && verdict ) {
            this.down('#applyButton').setDisabled(false);
        } else {
            this.down('#applyButton').setDisabled(true);
        }
    },
    
    afterRender: function() {
        this.callParent(arguments);
        Ext.defer(function() {
            this.down('#buildField').focus();
        }, 150, this);
    }
    
});