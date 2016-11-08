import Ember from 'ember';

const { getOwner } = Ember;

export default Ember.Component.extend({
    
    initGrid() {
        
        // Initialize our packery grid
        let grid = this.$('.grid');
        
        grid.packery({
            percentPosition: true,
            itemSelector: '.grid-item',
            gutter: 10,
        });
        
        // Grid elements are draggable
        grid.find('.grid-item').each( function( i, gridItem ) {
            var draggie = new Draggabilly( gridItem );
            // bind drag events to Packery
            grid.packery( 'bindDraggabillyEvents', draggie );
        });
        
        // Resize grid elements on click 
        // NOTE that in the future we want this to be encapsulated in some sort of button, etc.
        // Otherwise it happens any time you drag the element, which is really annoying
        // (Commenting out for now)
        /*grid.on( 'click', '.grid-item', function( event ) {
            var $item = $( event.currentTarget );
            // change size of item by toggling large class
            $item.toggleClass('grid-item--large');
            if ( $item.is('.grid-item--large') ) {
                // fit large item
                grid.packery( 'fit', event.currentTarget );
            } else {
                // back to small, shiftLayout back
                grid.packery('shiftLayout');
            }
        });*/
        
    },
    
    init() {
        this._super(...arguments);
    },
    
    didInsertElement() {
        this.initGrid();
    },
    
    sortableObjectListChanged: Ember.observer('sortableObjectList', function() {
        /* Note that when this happens, we want our newly added chart to be initialized as draggable
        Unfortunately, nothing I've tried to make this happen works :( */
        
        /* Just trying to test out appending Ember component templates to a Packery object here.
        This section has no relevance to actual dashboard functionality.*/
        let grid = this.$('.grid');
        let testitems = $('<div class="grid-item">Hello I am a test</div>');
        grid.append(testitems).packery( 'appended', testitems );
        var template = getOwner(this).lookup('component:place-holder');
        testitems.append(template);
        this.initGrid();
        
    }),
    
    actions: {
        
        removeChart: function(chart) {
            this.sendAction('removeChart',chart);
        },
        
        addChart: function(option) {
            this.sendAction('addChart',option);
        }
        
    }

    
});
