jQuery(function() {
//document.addEventListener('deviceready', function() { 
	var $ = jQuery;
	
	//public variables
	$.client 					= {};
	$.client.cdn 				= 'server/upload'; //ex. http://server.client.com
	$.client.server 			= 'server'; //ex. http://cdn.client.com
	
	$.client.chops				= $.chops().useHash();
	$.client.history			= [$.client.chops.getState()];
	$.client.intervals 			= [10, 20, 30, 40, 60], 
	$.client.nextInterval 		= -1, 
	$.client.currentTimeout		= null; 
	
	//private variables
	var fromMobility 	= false;
	var blankScreen 	= '<section class="loading body with-foot"></screen>';
	
	//TODO DUMMY PROPERTIES
	var i = 0;
	var j = 0;
	
	//start listening for events
	$.client.chops
		//request from chops
		.on('request', function(e, path, state) {
			if(fromMobility) {
				fromMobility = false;
				return;
			}
			
			state = state || $.client.chops.getState();
			$.client.chops.trigger('client-request', state);
		})
		
		//request from mobility
		.on('mobility-request', function(e, href, effect) {
			fromMobility = true;
			
			var request = function() {
				var state = $.client.chops.getState('#' + href);
			
				state.effect = effect;
				
				$.client.chops.trigger('client-request', state);
				
				fromMobility = false;
			};
			
			if(effect) {
				$(window).one('mobility-swap-complete', function() {
					$('section.screen.current').addClass('loading');
					request();
				});
				
				$.mobility.swap('', effect);
				return;
			}
			
			request();
		})
		
		//normalized requests
		.on('client-request', function(e, state) {
			//are we ready ?
			if(!$.client.ready) {
				return;
			}
			
			//stop timers
			if($.client.currentTimeout) {
				clearTimeout($.client.currentTimeout);
				$.client.currentTimeout = null;
			}
			
			//record history	
			if(state.path == '/back') {
				$.client.history.pop();
				state = $.client.history[$.client.history.length - 1] || $.client.chops.getState();
			} else if(!$.client.history[$.client.history.length - 1] 
			|| state.path !== $.client.history[$.client.history.length - 1].path 
			|| JSON.stringify(state.data) !== JSON.stringify($.client.history[$.client.history.length - 1].data)) {
				$.client.history.push(state);
			}
			
			//router
			switch(true) {
				case state.path === '/':
					jQuery('section.screen.current').addClass('loading');
					
					require('templates/home.html', function(html) {
						jQuery.mobility.swap(html);
						populate('hot');
						
						jQuery('#home-tabs a').click(function() {
							if(!$('div.list', $(this).attr('href')).html().trim().length) {
								populate($(this).attr('href').substr(1));
							}
						});
						
						jQuery('header a.search-trigger').click(function() {
							if(jQuery('h1.title input.search-field').hasClass('hide')) {
								jQuery('header h1.title a').addClass('hide');
								jQuery('h1.title input.search-field')
									.removeClass('hide')
									.animate({ width: '100%' });
								return;
							}
							
							jQuery('h1.title input.search-field')
								.addClass('hide')
								.css({ width: '0%' });
							
							jQuery('header h1 a').removeClass('hide');
						});
					});
					
					break;
				case state.path.indexOf('/detail') === 0:
					jQuery('section.screen.current').addClass('loading');
					
					require([
						'server'+state.path+'.js', 
						'templates/detail.html'], 
					function(response, template) {
						jQuery.mobility.swap(jQuery(Handlebars.compile(template)(response.results)));
						jQuery('header a.search-trigger').click(function() {
							if(jQuery('h1.title input.search-field').hasClass('hide')) {
								jQuery('header h1.title a').addClass('hide');
								jQuery('h1.title input.search-field')
									.removeClass('hide')
									.animate({ width: '100%' });
								return;
							}
							
							jQuery('h1.title input.search-field')
								.addClass('hide')
								.css({ width: '0%' });
							
							jQuery('header h1 a').removeClass('hide');
						});
					});
					
					break;
			}
		})
		
		//when a list scrolls to the bottom
		//we can add additional content
		.on('mobility-paginate', function(e, target, callback) {
			setTimeout(function() {
				if(j === 3) {
					callback();
					return;
				}
				
				var id = target.attr('id');
			
				require([
				'server/' + id + '.js', 
				'templates/row.html'], 
				function(response, template) {
					var row = Handlebars.compile(template)(response.results[(++i) % 4]);
					
					for(var rows = [], i = 0; i < response.results.length; i++) {
						rows.push(Handlebars.compile(template)(response.results[i]));
					}
					
					callback(rows.join(''));
				});
				
				j++;
			}, 1000);	
		})
		
		//when a list scrolls to the top
		//we can add additional content
		.on('mobility-refresh', function(e, target, callback) {
			//TODO: DUMMY LOGIC
			var id = target.attr('id');
		
			require([
			'server/' + id + '.js', 
			'templates/row.html'], 
			function(response, template) {
				var row = Handlebars.compile(template)(response.results[(++i) % 4]);
				
				callback(row);
			});
		})
		
		//custom image picker with cropping
		.on('image-field-init', function(e, target) { 
			var file 	= jQuery('<input type="file" />', target);
			var hidden 	= jQuery('input[type="hidden"]', target);
			var image 	= jQuery('img', target);
			
			if($(target).hasClass('multiple')) {
				file.attr('multiple', 'multiple');
			} 
			
			var width 	= image[0].width	|| 200;
			var height 	= image[0].height	|| 200;
			
			file
				.attr('accept', 'image/png,image/jpg,image/jpeg,image/gif')
				.appendTo(target);
			
			image.click(function() {
				file.click();	
			});
			
			var images = [];
			
			image.each(function(i) {
				images.push({
					image: image.eq(i), 
					field: hidden.eq(i)})
			});
			
			image = image.eq(0);
			hidden = hidden.eq(0);
			
			file.change(function() {
				if(!this.files || !this.files[0]) {
					return;
				}
				
				//remove all images
				var item = null;
				while(images.length !== 1 && (item = images.pop())) {
					item.image.remove();
					item.field.remove();
				}
				
				images = [{
					image: image.appendTo(target), 
					field: hidden.appendTo(target)}];
				
				for(var i = 0; i < this.files.length; i++) {
					//if multiple
					if(i > 0) {
						//create more img and input tags
						images.push({
							image: image.clone().appendTo(target), 
							field: hidden.clone().appendTo(target)});
						
						images[images.length - 1].image.click(function() {
							file.click();	
						});
					}
					
					$.cropper(this.files[i], width, height, function(i, data) {
						images[i].image.attr('src', data);
						images[i].field.val(data);
					}.bind(null, i));
				}
			});
		})
		
		//custom password field
		.on('password-field-init', function(e, target) {
			$(target).passwordMask();
		});
	
	//same as $.get except this considers internet connectivity
	var remoteGet = function() {
		var args = arguments;
		$.get.apply($, args).fail(function(xhr) {
			var interval = $.client.intervals[(++$.client.nextInterval) % 5];
				
			$.mobility.notify('No Internet. Trying again in ' + interval + ' seconds.', 'error');
			
			$.client.currentTimeout = setTimeout(function() {
				$.client.currentTimeout = null;
				remoteGet.apply(null, args);
			}, interval * 1000);
		});
	};
	
	//same as $.post except this considers internet connectivity
	var remotePost = function() {
		var args = arguments;
		
		$.post.apply($, args).fail(function(xhr) {
			var interval = $.client.intervals[(++$.client.nextInterval) % 5];
				
			$.mobility.notify('No Internet. Trying again in ' + interval + ' seconds.', 'error');
			
			$.client.currentTimeout = setTimeout(function() {
				$.client.currentTimeout = null;
				remotePost.apply(null, args);
			}, interval * 1000);
		});
	};
	
	//random helper methods
	var formatNumber = function(number) {
		return (number + '').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	};
	
	var formatSlug = function(data) {
		data = data.replace(/[^a-zA-Z0-9_-\s]/gi, '');
		data = data.trim();
		data = data.replace(' ', '-');
		data = data.replace(/\-+/gi, '-');
		return data.toLowerCase();
	};
	
	//TODO: DUMMY DATA GENERATORS
	var populate = function(id) {
		require([
		'server/'+id+'.js', 
		'templates/row.html'], 
		function(response, template) {
			jQuery('section.body').removeClass('loading');
			
			for(var row, i = 0; i < response.results.length; i++) {
				row = jQuery(Handlebars.compile(template)(response.results[i]));
				jQuery('#' + id + ' div.list').append(row);
				row.doon();
			}
			
			jQuery('#' + id ).removeClass('hide').scrollTop(180);
		});
	};
	
	//create cdn helpers
	Handlebars.registerHelper('cdn', function(options) {
		return $.client.cdn; 
	});
	
	//create session helpers
	Handlebars.registerHelper('loggedin', function(options) {
		if(window.localStorage.hasOwnProperty('me')) {
			return options.fn(this);
		}
		
		return options.inverse(this);
	});
	
	//create session helpers
	Handlebars.registerHelper('me', function(key, options) {
		if(!window.localStorage.hasOwnProperty('me')) {
			return '';
		}
		
		var me = JSON.parse(window.localStorage.getItem('me'));
		
		return me[key] || ''; 
	});
	
	//create get query helper
	Handlebars.registerHelper('query', function(key, options) {
		var query = $.client.history[$.client.history.length - 1].data;
		
		if(!query) {
			return '';
		}
		
		return query[key] || ''; 
	});
	
	//create a better if helper
	Handlebars.registerHelper('when', function(value1, operator, value2, options) {
		var valid = false;
		
		switch (true) {
			case operator == 'eq' 	&& value1 == value2:
			case operator == '==' 	&& value1 == value2:
			case operator == 'req' 	&& value1 === value2:
			case operator == '===' 	&& value1 === value2:
			case operator == 'neq' 	&& value1 != value2:	
			case operator == '!=' 	&& value1 != value2:
			case operator == 'rneq' && value1 !== value2:
			case operator == '!==' 	&& value1 !== value2:
			case operator == 'lt' 	&& value1 < value2:
			case operator == '<' 	&& value1 < value2:
			case operator == 'lte' 	&& value1 <= value2:
			case operator == '<=' 	&& value1 <= value2:
			case operator == 'gt' 	&& value1 > value2:
			case operator == '>' 	&& value1 > value2:
			case operator == 'gte' 	&& value1 >= value2:
			case operator == '>=' 	&& value1 >= value2:
			case operator == 'and' 	&& value1 && value2:
			case operator == '&&' 	&& (value1 && value2):
			case operator == 'or' 	&& value1 || value2:
			case operator == '||' 	&& (value1 || value2):
			
			case operator == 'startsWith' 
			&& value1.indexOf(value2) === 0:
			
			case operator == 'endsWith' 
			&& value1.indexOf(value2) === (value1.length - value2.length):
				valid = true;
				break;
		}
		
		if(valid) {
			return options.fn(this);
		}
		
		return options.inverse(this);
	});
	
	//create a better loop helper
	Handlebars.registerHelper('loop', function(object, options) {
		var i = 0, buffer = '', key, total = Object.keys(object).length;
	
		for (key in object) {
			if (object.hasOwnProperty(key)) {
				buffer += options.fn({key: key, value: object[key], last: ++i === total});
			}
		}
	 
		return buffer;
	});
		
	//create in helper
	Handlebars.registerHelper('in', function(value, list, options) {
		list = list || '';
		
		if(!(list instanceof Array)) {
			list = list.split(',');
		}
		
		for (var i = 0; i < list.length; i++) {
			if(list[i] === value) {
				return options.fn(this);
			}
		}
	 
		return '';
	});
	
	//create not in helper
	Handlebars.registerHelper('notin', function(value, list, options) {
		list = list || '';
		
		if(!(list instanceof Array)) {
			list = list.split(',');
		}
		
		for (var i = 0; i < list.length; i++) {
			if(list[i] === value) {
				return '';
			}
		}
	 
		return options.fn(this);
	});
	
	//config aquire
	require.config({ 
		templates	: { root: 'templates' },
		server		: { root: $.client.server }
	});
	
	//live listen to all links
	$(document).on('click', 'a', function(e) {
		//and stop it
		e.preventDefault();
	});
	
	//allow cors
	$.support.cors = true; 
	
	//Need to change Default Type from form-url-encoded
	//to application/json if it's really json of course
	$.ajaxSetup({ 
		cache: false,
		beforeSend: function(jqxhr, xhr) {
			var isJSON = false;
			try {
			  $.parseJSON(xhr.data);
			  isJSON = true;
			}
			catch (err) {}
			
			if(isJSON) {
				jqxhr.setRequestHeader('Content-Type','application/json');
				jqxhr.setRequestHeader('Accept','application/json');
			}
			
		} 
	});
	
	//initialize
	$.mobility.start();
	
	$.client.ready = true;
	$.client.chops.trigger('client-request', $.client.chops.getState('#'));
}, false);