/* global c3 */
import Ember from 'ember';

export default Ember.Component.extend({
    
    // Define boolean variables that specify which subsets (if any) of abstractcreativeworks we're specifically looking at
    tPub: false, // Publication
    tPre: false, // Preprint
    tCre: false, // Creativework
    tPro: false, // Project
    
    timeseriesList: Ember.computed('aggregations', function() { // Format our timeseries data
        let d = this.get('aggregations.articles_over_time.buckets');
        let firstRow = ['x'];
        let secondRow = ['Articles'];
        d.forEach(function(entry) {
            firstRow.push(entry.key_as_string);
            secondRow.push(entry.doc_count);
        });
        return [firstRow, secondRow];
    }),

    dataChanged: Ember.observer('aggregations', function() { // Initiate a chart update if the TS data changes
        let data = this.get('timeseriesList');
        this.updateTS(data);
    }),

    updateTS(data, interval) { // Update our TS chart when data/subsets change
        let columns = data; 
        let title = '';
        let ts = this.get('ts');
        if (!ts) {
            this.initTS(title, columns, interval);
        } else {
            ts.load({
                columns,
                unload: true
            });   
        }
    },
    
    pushTS(xCol) { // Add a specific subset of abstractcreativeworks to the TS chart
        let ts = this.get('ts');
        ts.load({
            columns: [xCol]
        });
    },
    
    popTS(xCol) { // Remove a specific subset of abstractcreativeworks from the TS chart
        let ts = this.get('ts');
        ts.unload([xCol]);
    },

    initTS(title, columns, interval) { // Draw the TS chart the first time its rendered
        let element = this.$(`.ts`).get(0);
        let ts = c3.generate({
            bindto: element,
            data: {
                x: 'x',
                columns: columns
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%d-%m-%Y' // Format the tick labels on our chart
                    }
                }
            },
             tooltip: { // Format the tooltips on our chart
                format: { // We want to return a nice-looking tooltip whose content is determined by (or at least consistent with) sour TS intervals
                    title: function (d) {
                        return d.toString().substring(4,15); // This isn't perfect, but it's at least more verbose than before
                    }
                }
            },
            size: { height: 600 }
        });
        this.set('ts', ts);
    },
    
    init() { // Init should be used ONLY for setting component proprties. When we want to work on the component DOM element, we use didInsertElement hook
        this._super(...arguments);
    },
    
    didInsertElement() { // When this component has been inserted into the DOM
        let data = this.get('timeseriesList');
        let interval = this.get('interval');
        this.updateTS(data, interval); 
    },
    
    // If the user wants to isolate preprints:
    tPreChanged: Ember.observer('tPre', function() {
        let otherSubsets = (this.get('tPub') || this.get('tCre') || this.get('tPro')); // check if we already are displaying article subsets on the chart
        if(this.get('tPre')) { // if the user checked the box
            this.filterTS('preprint',otherSubsets); 
        }
        else { // if the user unchecked the box
            if(!otherSubsets) { // if this is the only data on the chart right now and we're removing it
                let data = this.get('timeseriesList'); // reload the original chart
                this.updateTS(data);   
            }
            else {
                this.popTS('preprint');
            }
        }
    }),
    
    // If the user wants to isolate publications:
    tPubChanged: Ember.observer('tPub', function() {
        let otherSubsets = (this.get('tPre') || this.get('tCre') || this.get('tPro'));
        if(this.get('tPub')) { // if the user checked the box
            this.filterTS('publication',otherSubsets); 
        }
        else { // if the user unchecked the box
            if(!otherSubsets) {
                let data = this.get('timeseriesList');
                this.updateTS(data);   
            }
            else {
                this.popTS('publication');
            }
        }
    }),
    
    // If the user wants to isolate creativeworks:
    tCreChanged: Ember.observer('tCre', function() {
        let otherSubsets = (this.get('tPre') || this.get('tPub') || this.get('tPro'));
        if(this.get('tCre')) { // if the user checked the box
            this.filterTS('creativework',otherSubsets); 
        }
        else { // if the user unchecked the box
            if(!otherSubsets) {
                let data = this.get('timeseriesList');
                this.updateTS(data);   
            }
            else {
                this.popTS('creativework');
            }
        }
    }),
    
    // If the user wants to isolate projects:
    tProChanged: Ember.observer('tPro', function() {
        let otherSubsets = (this.get('tPre') || this.get('tPub') || this.get('tCre'));
        if(this.get('tPro')) { // if the user checked the box
            this.filterTS('project',otherSubsets); 
        }
        else { // if the user unchecked the box
            if(!otherSubsets) {
                let data = this.get('timeseriesList');
                this.updateTS(data);   
            }
            else {
                this.popTS('project');
            }
        }
    }),
    
    // Isolate specific subsets of abstractcreativeworks
    filterTS(typeString,o) {
        let d = this.get('aggregations.articles_over_time.buckets');
        let firstRow = ['x'];
        let secondRow = [typeString];
        d.forEach(function(entry) {
            firstRow.push(entry.key_as_string);
            let hasPubBucket = false;
            entry.arttype.buckets.forEach(function(b) {
               if(b.key === typeString) {
                   hasPubBucket = true;
                   secondRow.push(b.doc_count);
               }
            });
            if(!hasPubBucket) {
               secondRow.push(0);
            }
        });
        if(o) {
            this.pushTS(secondRow);
        }
        else {
            let data = [firstRow, secondRow];
            this.updateTS(data);
        }
    }
    
});
