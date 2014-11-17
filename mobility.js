/**
 * Mobility - Mobility is a super light weight HTML, 
 * CSS, and JS framework built on top of Bootstrap 
 * for developing mobile applications. 
 *
 * @version 0.0.1
 * @author Christian Blanquera <cblanquera@openovate.com>
 * @website https://github.com/cblanquera/mobility
 * @license MIT
 */
(function($) {
	$(window).on('go-back-click', function(e) {
		e.preventDefault();
		e.originalEvent.stop = true;
		
		var trigger = getTrigger('go-back-click', e.target);
		var target = getTarget(trigger);
		var data = { html: '' };
		
		if($(target).length && $(target).html()) {
			data.html = $(target).html();
		}
		
		$(window).trigger('get-mobility-data', [target, data]);
		
		$.mobility.swap(data.html, 'slide-right');
	}).on('go-forward-click', function(e) {
		e.preventDefault();
		e.originalEvent.stop = true;
		
		var trigger = getTrigger('go-back-click', e.target);
		var target = getTarget(trigger);
		var data = { html: '' };
		
		if($(target).length && $(target).html()) {
			data.html = $(target).html();
		}
		
		$(window).trigger('get-mobility-data', [target, data]);
		
		$.mobility.swap(data.html, 'slide-left');
	}).on('focus-input-group-init', function(e, trigger) {
		trigger = $(trigger);
		
		trigger.find('label').each(function() {
			$(this).click(function() {
				trigger.find('label input').each(function() {
					if(this.checked) {
						$(this).parents('label:first').addClass('active');
					} else {
						$(this).parents('label:first').removeClass('active');
					}
				});
			});
		})
		
	}).on('tab-switch-click', function(e) {
		e.preventDefault();
		e.originalEvent.stop = true;
		
		var trigger = getTrigger('tab-switch-click', e.target);
		var target = $(getTarget(trigger));
		
		trigger.siblings().each(function() {
			var target = $(this).removeClass('active').attr('href');
			$(target).addClass('hide');
		});
		
		trigger.addClass('active'); 
		target.removeClass('hide');
	}).on('modal-open-click', function(e) {
		e.preventDefault();
		e.originalEvent.stop = true;
		
		var trigger = getTrigger('modal-open-click', e.target);
		var target = $(getTarget(trigger));
		
		var slideEnd = function () {
			target
				.unbind('webkitTransitionEnd', slideEnd)
				.removeClass('sliding');
		};
		
		target
			.addClass('sliding-down')
			.removeClass('hide');
		
		target[0].offsetWidth; // force reflow
		
		target
			.removeClass('sliding-down')
			.on('webkitTransitionEnd', slideEnd)
			.addClass('sliding');
			
	}).on('modal-close-click', function(e) {
		e.preventDefault();
		e.originalEvent.stop = true;
		
		var trigger = getTrigger('modal-close-click', e.target);
		var target = $(getTarget(trigger));
		
		var slideEnd = function () {
			target
				.unbind('webkitTransitionEnd', slideEnd)
				.removeClass('sliding')
				.removeClass('sliding-down')
				.addClass('hide');
		};
		
		target[0].offsetWidth; // force reflow
		
		target
			.on('webkitTransitionEnd', slideEnd)
			.addClass('sliding')
			.addClass('sliding-down');
		
	}).on('popover-open-click', function(e) {
		e.preventDefault();
		e.originalEvent.stop = true;
		
		var trigger = getTrigger('popover-open-click', e.target);
		var target = $(getTarget(trigger));
		
		target.removeClass('hide');
	}).on('popover-close-click', function(e) {
		e.preventDefault();
		e.originalEvent.stop = true;
		
		var trigger = getTrigger('popover-close-click', e.target);
		var target = $(getTarget(trigger));
		
		target.addClass('hide');
	});
	
	var getTrigger = function(event, target) {
		var i, subject, events, trigger = null;
		
		target = $(target);
		
		if(target.attr('data-do') && target.attr('data-on')) {
			subject = target.attr('data-do')
			events 	= target.attr('data-on').split('|');
			
			events.unshift('init');
			
			for(i = 0; i < events.length; i++) {
				if((subject + '-' + events[i]) === event) {
					return target;
				}
			}
		}
		
		target.parents('[data-do]').each(function() {
			if(trigger) {
				return false;
			}
			
			subject = $(this).attr('data-do')
			events = $(this).attr('data-on').split('|');
			
			events.unshift('init');
			
			for(i = 0; i < events.length; i++) {
				if((subject + '-' + events[i]) === event) {
					trigger = $(this);
					return false;
				}
			}
		});
		
		return trigger || target;
	};
	
	var getTarget = function(trigger) {
		trigger = $(trigger);
		
		var target = trigger.attr('data-target');
		
		if(!target || !target.length) {
			target = trigger.attr('href');
		}
		
		return target;
	};
	
	$.extend({
		mobility: {
			swap: function(html, effect) {
				var section = $('<section class="screen current">').html(html);
				var current = $('section.screen.current');
				
				var slideEnd = function () {
					section
						.unbind('webkitTransitionEnd', slideEnd)
						.removeClass('sliding')
						.removeClass('sliding-up')
						.removeClass('sliding-right')
						.removeClass('sliding-down')
						.removeClass('sliding-left');
						
					current.remove();
				};
				
				var fadeEnd = function () {
					current.remove();
				};
				
				switch(effect) {
					case 'slide-left':
						$(document.body).append(section);
						
						section
							.doon()
							.addClass('sliding-right');
						
						section[0].offsetWidth; // force reflow
						
						section
							.removeClass('sliding-right')
							.on('webkitTransitionEnd', slideEnd)
							.addClass('sliding');
						
						current
							.addClass('sliding')
							.addClass('sliding-left');
						break;
						
					case 'slide-right':
						$(document.body).append(section);
						
						section
							.doon()
							.addClass('sliding-left');
						
						section[0].offsetWidth; // force reflow
							
						section
							.removeClass('sliding-left')
							.on('webkitTransitionEnd', slideEnd)
							.addClass('sliding');
						
						current
							.addClass('sliding')
							.addClass('sliding-right');
						break;
					
					case 'slide-up':
						$(document.body).append(section);
						
						section
							.doon()
							.addClass('sliding-down');
						
						section[0].offsetWidth; // force reflow
						
						section
							.removeClass('sliding-down')
							.on('webkitTransitionEnd', slideEnd)
							.addClass('sliding');
						
						current
							.addClass('sliding')
							.addClass('sliding-up');
						break;
						
					case 'slide-down':
						$(document.body).append(section);
						
						section
							.doon()
							.addClass('sliding-up');
						
						section[0].offsetWidth; // force reflow
							
						section
							.removeClass('sliding-up')
							.on('webkitTransitionEnd', slideEnd)
							.addClass('sliding');
						
						current
							.addClass('sliding')
							.addClass('sliding-down');
						break;
					
					case 'fade':
						$(document.body).prepend(section);
						
						section.doon();
						
						current
							.on('webkitTransitionEnd', fadeEnd)
							.addClass('fade');
							
						break;
					
					default:
						section.appendTo(document.body).doon();
						current.remove();
						break;
						
				}
			},
			
			start: function() {
				$(document.body).doon();		
			}
		}
	});
})(jQuery);