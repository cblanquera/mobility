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
	}).on('notify-open-click', function(e) {
		e.preventDefault();
		
		if(e.originalEvent) {
			e.originalEvent.stop = true;
		}
		
		var trigger = getTrigger('notify-open-click', e.target);
		var message = trigger.attr('data-message');
		var type 	= trigger.attr('data-type');
		
		$.mobility.notify(message, type);
	}).on('notify-close-click', function(e) {
		e.preventDefault();
		
		if(e.originalEvent) {
			e.originalEvent.stop = true;
		}
		
		if($.mobility.busy) {
			return;
		}
		
		$.mobility.busy = true;
		
		var trigger = getTrigger('notify-close-click', e.target);
		var target = $(getTarget(trigger));
		
		var slideEnd = function () {
			target.remove();
			$.mobility.busy = false;
		};
		
		target[0].offsetWidth; // force reflow
		
		target
			.on('webkitTransitionEnd', slideEnd)
			.addClass('sliding')
			.addClass('sliding-up');
	}).on('paginate-init', function(e, message) {
		//make sure message is jQuery
		message = $(message);
		
		//the target will be the parent
		var target = message.parent();
		
		//set a variable to scroll callback
		//so we can unbind it later
		var paginate = function() {
			//if we are alreadty busy
			if($.mobility.busy) {
				//do nothing
				return;
			}
			
			//height = combined children - container
			var height = -(target.height());
			
			target.children().each(function() {
				height += $(this).outerHeight();
			});
			
			//if the scroll is not 75% of the way
			if(target.scrollTop() < (height * 0.75)) {
				//do nothing
				return;
			}
			
			//we are going to attempt to get data now
			//so we are busy
			$.mobility.busy = true;
			
			//allow API listeners
			$(window).trigger('mobility-paginate', [target, function(html) {
				//okay we are not busy anymore
				$.mobility.busy = false;
				
				//if no HTML
				if(!html) {
					//update message
					message.html(message.attr('data-noresults'));
					
					//stop listening to it
					target.unbind('scroll', paginate);
					
					//if u want to keep listening to it
					//simply set HTML to true
					return;
				}
				
				//there is HTML
				if(typeof html !== 'boolean') {
					//add loading message
					//and add the HTML
					message
					.html(message.attr('data-loading'))
					.prev()
					.append($(html)
					.css('opacity', 0)
					.animate({opacity: 1}));
				}
			}]);
		};
		
		target.scroll(paginate);
	}).on('refresh-pull-init', function(e, wizard) {
		//make sure the wizard is jQuery
		wizard = $(wizard);
		//set the initial message
		$('span.message', wizard).html(wizard.attr('data-pull'));
		//touching is false by default
		var touching = false; 
		//the target is the parent
		var target = wizard.parent();
		//rotates the icon
		var rotate = function(e) {
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
		};
		//determines when we should load
		var release = function(e) {
			if(target.scrollTop() != 0) {
				return;
			}
			
			if(touching) {
				$('span.message', wizard).html(wizard.attr('data-release'));
				$(window).one('touchend', load);
				return;
			}
			
			load();
		};
		//resets the pull configuration
		var retract = function() {
			if($('span.message', wizard).html() === wizard.attr('data-release')) {
				return;
			}
			
			if(target.scrollTop() < 180) {
				$.mobility.busy = true;
				
				target.css('-webkit-overflow-scrolling', 'auto');
				target.animate({scrollTop: 180}, 'fast', 'swing', function() {
					target.css('-webkit-overflow-scrolling', 'touch');
					$.mobility.busy = false;
				});
			}
		};
		//loads the next set
		var load = function() {
			//if we are busy
			if($.mobility.busy) {
				//do nothing
				return;
			}
			
			//set initial message
			$('span.message', wizard).html(wizard.attr('data-loading'));
			
			//okay lets get busy
			$.mobility.busy = true;
			//adjust the wizard height for effect
			wizard.animate({paddingTop: 0, height: 50}, 'fast', function() {
				//allow API listener
				$(window).trigger('mobility-refresh', [target, function(html) {
					//if HTML was returned
					if(html) {
						//prepend it in
						wizard.next()
							.prepend($(html)
							.css('opacity', 0)
							.animate({opacity: 1}));
					}
					
					//reset the wizard styles
					wizard
						.css('padding-top', '130px')
						.css('height', '180px');
					
					$('span.message', wizard).html(wizard.attr('data-pull'));
					$('i', wizard).css('transform', 'rotate(0deg)');
					
					//scroll quirk in iOS
					target.scrollTop(179);
					setTimeout(function() {
						target.scrollTop(180);
					}, 5);
					
					$.mobility.busy = false;
				}]);
			});
		};
		//initializes the pagination
		var initialize = function() {
			wizard.removeClass('hide');
			target.scrollTop(180)
				.on('scroll'		, rotate)
				.on('scroll'		, release)
				.on('touchend'		, retract)
				.on('touchstart'	, function() {
					touching = true;
				})
				.on('touchend', function() {
					touching = false;
				});
		};
		
		if($.mobility.busy) { 
			$(window).one('mobility-swap-complete', initialize);
		} else {
			initialize();
		}
	}).on('hero-init', function(e, container) {
		container = $(container);
		
		var initialize = function() {
			var index = 0;
			
			container.on('swipeleft', function(e) {
				e.preventDefault();
				
				var next = $('img', container).eq(++index);
				
				if(!next.length) {
					index--;
					return;
				}
				
				$('div.frame', container).css('transform', 
				'translate3d(-'+next.position().left+'px, 0, 0)');
				
				return false;
			}).on('swiperight', function(e) {
				e.preventDefault();
				var next = $('img', container).eq(--index);
				
				if(!next.length || index < 0) {
					index++;
					return;
				}
				
				$('div.frame', container).css('transform', 
				'translate3d(-'+next.position().left+'px, 0, 0)');
				
				return false;
			});
		};
		
		if($.mobility.busy) {
			$(window).on('mobility-swap-complete', initialize);
			return;
		}
		
		initialize();
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
	
	var notifyTpl = 
	'<div id="notify-{UID}" class="notify{TYPE}"><a data-do="notify-close" '
	+ 'data-on="click" href="#notify-{UID}"><i class="fa fa-times"></i></a><span '
	+ 'class="message">{MESSAGE}</span></div>';
	
	$.extend({
		mobility: {
			busy: false,
			uid: 0,
			notify: function(message, type) {
				if($('div.notify').length) {
					$('div.notify > a').click();
				}
				
				switch(type) {
					case 'info':
					case 'warning':
					case 'error':
					case 'success':
						type = ' notify-' + type;
						break;
					default:
						type = '';
						break;
				}
				
				var html = notifyTpl
					.replace('{UID}'	, ++this.uid)
					.replace('{UID}'	, this.uid)
					.replace('{MESSAGE}', message)
					.replace('{TYPE}'	, type);
				
				html = $(html).addClass('sliding-up');
				
				$('section.current').append(html);
				
				setTimeout(function() {
					html
						.doon()
						.removeClass('sliding-up')
						.addClass('sliding');
				}, 1);
				
				setTimeout(function() {
					html.children('a').click();
				}, 3000);
			},
			
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