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
		
		try {
			if($(target).length && $(target).html()) {
				$.mobility.swap($(target).html(), 'slide-right');
			}
		} catch(e) {}
		
		$(window).trigger('mobility-request', [target, 'slide-right']);
	}).on('go-forward-click', function(e) {
		e.preventDefault();
		e.originalEvent.stop = true;
		
		var trigger = getTrigger('go-back-click', e.target);
		var target = getTarget(trigger);
		
		try {
			if($(target).length && $(target).html()) {
				$.mobility.swap($(target).html(), 'slide-left');
			}
		} catch(e) {}
		
		$(window).trigger('mobility-request', [target, 'slide-left']);
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
		
		if($.mobility.busy) {
			return;
		}
		
		$.mobility.busy = true;
		
		var trigger = getTrigger('modal-open-click', e.target);
		var target = $(getTarget(trigger));
		
		var slideEnd = function () {
			target
				.unbind('webkitTransitionEnd', slideEnd)
				.removeClass('sliding');
			
			$.mobility.busy = false;
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
		
		if($.mobility.busy) {
			return;
		}
		
		$.mobility.busy = true;
		
		var trigger = getTrigger('modal-close-click', e.target);
		var target = $(getTarget(trigger));
		
		var slideEnd = function () {
			target
				.unbind('webkitTransitionEnd', slideEnd)
				.removeClass('sliding')
				.removeClass('sliding-down')
				.addClass('hide');
			
			$.mobility.busy = false;
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
	}).on('refresh-pull-init', function(e, wizard) {
		wizard = $(wizard);
		
		$('span.message', wizard).html(wizard.attr('data-pull'));
		
		var busy = false, touching = false, last = 0, target = wizard.parent(), 
		
		rotate = function(e) {
			var scroll = target.scrollTop();
			
			if(scroll < 181) {
				var deg = 180 - scroll;
				
				if(deg > 180) {
					deg = 180;
				} else if(deg < 0) {
					deg = 0;
				}
				 
				$('i', wizard).css('transform', 'rotate('+ deg +'deg)');
			}
		},
		
		release = function(e) {
			if(target.scrollTop() != 0) {
				return;
			}
			
			if(touching) {
				$('span.message', wizard).html(wizard.attr('data-release'));
				$(window).one('touchend', load);
				return;
			}
			
			load();
		},
		
		load = function() {
			if(busy) {
				return;
			}
			
			$('span.message', wizard).html(wizard.attr('data-loading'));
			
			busy = true;
			wizard.animate({paddingTop: 0, height: 50}, 'fast', function() {
				$(window).trigger('mobility-refresh', [target, function(html) {
					if(html) {
						wizard
						.next()
						.prepend($(html)
						.css('opacity', 0)
						.animate({opacity: 1}));
					}
					
					wizard
						.css('padding-top', '130px')
						.css('height', '180px');
					
					$('span.message', wizard).html(wizard.attr('data-pull'));
					$('i', wizard).css('transform', 'rotate(0deg)');
					
					target.scrollTop(179);
					setTimeout(function() {
						target.scrollTop(180);
					}, 5);
					
					busy = false;
				}]);
			});
		};
		
		$(window).one('mobility-swap-complete', function() {
			wizard.removeClass('hide');
			target.scrollTop(180)
				.on('scroll', rotate)
				.on('scroll', release)
				.on('touchstart', function() {
					touching = true;
				})
				.on('touchend', function() {
					touching = false;
					
					if($('span.message', wizard).html() === wizard.attr('data-release')) {
						return;
					}
					
					if(target.scrollTop() < 180) {
						busy = true;
						
						target.css('-webkit-overflow-scrolling', 'auto');
						target.animate({scrollTop: 180}, 'fast', 'swing', function() {
							target.css('-webkit-overflow-scrolling', 'touch');
							busy = false;
						});
					}
				});
		});
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
			busy: false,
			swap: function(html, effect) {
				if($.mobility.busy) {
					return;
				}
				
				$.mobility.busy = true;
				
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
					
					$.mobility.busy = false;
					$(window).trigger('mobility-swap-complete');
				};
				
				var fadeEnd = function () {
					current.remove();
					
					$.mobility.busy = false;
					$(window).trigger('mobility-swap-complete');
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
						
						$.mobility.busy = false;
						$(window).trigger('mobility-swap-complete');
						break;
						
				}
			},
			
			start: function() {
				$(document.body).doon();		
			}
		}
	});
})(jQuery);