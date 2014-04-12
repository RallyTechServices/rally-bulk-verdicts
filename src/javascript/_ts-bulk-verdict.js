Ext.define('Rally.technicalservices.bulkverdict', {
    extend: 'Rally.ui.menu.bulk.MenuItem',
    alias: 'widget.tsbulkverdict',

    config: {
        text: 'Set Verdict...',
        handler: function() {
            this._onVerdictClicked();
        },
        predicate: function(records) {
            return _.every(records, function(record) {
                return record.self.isArtifact();
            });
        }
    },
    
    _onVerdictClicked: function() {
        Ext.create('Rally.technicalservices.VerdictDialog', {
            records: this.records,
            listeners: {
                verdictSelected: this._setVerdicts,
                scope: this
            }
        });
    },

    _setVerdicts: function(dialog, build, verdict) {
        if (this.onBeforeAction(this.records) === false) {
            return;
        }

        var me = this,
            records = me.records,
            successfulRecords = [];

        var promises = [];
        _.each(records, function (testcase) {
            // marshal into a sequence so we don't 
            // get a concurrency conflict
            var f = function() {
                return me._addResult(testcase,build,verdict);
            };
            promises.push(f);
        });
        Deft.Chain.sequence(promises).then({
            success: function(records) {
              successfulRecords = Ext.Array.flatten(records);
            },
            failure: function(error) {
              alert(error);
            }
        }).always(function() {
            Ext.callback(me.onActionComplete, null, [successfulRecords, []]);
        });
        
    },
    
    _addResult: function(testcase,build,verdict) {
        var deferred = Ext.create('Deft.Deferred');
        var today = Rally.util.DateTime.toIsoString(new Date());

        var tcr_data = {
            Build: build,
            Verdict: verdict,
            TestCase: testcase.get("_ref"),
            Date: today
        };
        
        if ( testcase.get('_source_container') && testcase.get('_source_container').get('_type') == 'testset' ) {
            tcr_data.TestSet = "/testset/" + testcase.get('_source_container').get('ObjectID');
        }
        
        Rally.data.ModelFactory.getModel({
            type:'TestCaseResult',
            success: function(model) {
                var tcr = Ext.create(model,tcr_data);
                tcr.save({
                    callback: function(result,operation){
                        if ( operation.wasSuccessful() ) {
                            testcase.set('LastVerdict', verdict);
                            testcase.set('LastRun',new Date());
                            deferred.resolve([result]);
                        } else {
                            deferred.reject("Problem saving: " + testcase.get('FormattedID') + "<br/> (" +
                                    operation.error.errors[0] + ")");
                        }
                    }
                });
            }
        });
        return deferred;
        
    }

});