/**
 * Do On - Super light weight event driven containers.
 *
 * @version 0.0.1
 * @author Christian Blanquera <cblanquera@openovate.com>
 * @website https://github.com/cblanquera/doon
 * @license MIT
 */
jQuery.fn.extend({
	doon: function() {
		return this.each(function() {
			jQuery('*[data-do]', this).add(this)
			.each(function() {
				var trigger = $(this);

				var action = trigger.attr('data-do');
				
				if(!action || trigger.data('doon')) {
					return;
				}
				
				trigger.data('doon', true);
				
				var event = trigger.attr('data-on');
	
				//trigger init
				jQuery(window).trigger(action+'-init', [this]);
	
				if(!event) {
					return;
				}
	
				jQuery.each(event.split('|'), function(i, event) {
					trigger.on(event, function(e) {
						//mod the custom event type
						e.type = action+'-'+event;
						//pass it along
						$(window).trigger(e, [this]);
					});
				});
			});
		});
	}
});
