/**
 * Chops - Client HTML5 on Push State
 *
 * @version 0.0.9
 * @author Christian Blanquera <cblanquera@openovate.com>
 * @website https://github.com/cblanquera/chops
 * @license MIT
 */
(function() {
	var chops = function() {
		/* Require
		-------------------------------*/
		var $ = jQuery;
		
		/* Constants
		-------------------------------*/
		/* Public.Properties
		-------------------------------*/
		/* Protected Properties
		-------------------------------*/
		/* Private Properties
		-------------------------------*/
		var __useHash = false;
		var __root = '';
		
		/* Magic
		-------------------------------*/
		this.___construct = function() {
			//hijack url changes
			this._hijackPushState();
			this._hijackPopState();
			//hijack links
			this._hijackLinks();
			//hijack forms
			this._hijackForms();
		};
		
		/* Public.Methods
		-------------------------------*/
		/**
		 * Returns a default state even if one is not set
		 *
		 * @string
		 * @return object
		 */
		this.getState = function(url) {
			if(url) {
				return __getState(url);
			}
			
			if(!window.history.state || typeof window.history.state === 'number') {
				return __getState(window.location.href);
			}
			
			return window.history.state;
		};
		
		/**
		 * Global event listener for the server
		 *
		 * @return this
		 */
		this.on = function(event, callback) {
			$(window).on(event, callback);
			return this;
		};
	
		/**
		 * Global event listener for the server once
		 *
		 * @return this
		 */
		this.once = function(event, callback) {
			$(window).one(event, callback);
			return this;
		};
	
		/**
		 * Stops listening to a specific event
		 *
		 * @return this
		 */
		this.off = function(event, handler) {
			if(handler) {
				$(window).unbind(event, handler);
				return this;
			}
	
			$(window).unbind(event);
			return this;
		};
		
		/**
		 * Effectively pushes a url 
		 *
		 * @param string
		 * @return this
		 */
		this.redirect = function(url) {
			__pushLink(url);
			return this;
		};
		
		/**
		 * Sets the root path of all calls
		 *
		 * @param string
		 * @return this
		 */
		this.setRoot = function(path) {
			__root = path.replace('/index.html', '').replace(/\/\//ig, '/');
			
			if(__root.lastIndexOf('/') === (__root.length - 1)) {
				__root = __root.substr(0, __root.length - 1);
			}
			
			return this;
		};
		
		/**
		 * Global event trigger for the server
		 *
		 * @return this
		 */
		this.trigger = function() {
			$(window).trigger.apply($(window), arguments);
			return this;
		};
		
		/**
		 * Enables hash mode
		 *
		 * @return this
		 */
		this.useHash = function() {
			__useHash = true;
			
			if(__root === '') {
				this.setRoot(window.location.pathname);
			}
			
			return this;
		};
		
		/* Protected Methods
		-------------------------------*/
		this._hijackPushState = function() {
			//remember the push state
			var pushState = window.history.pushState;
			
			//override the function
			window.history.pushState = function(state, name, href) {
				if (typeof window.history.onpushstate == 'function') {
					window.history.onpushstate({state: state});
				}
				
				var results = pushState.apply(window.history, arguments);
				
				//now trigger something special
				var event = jQuery.Event('request');
				event.state = state;
				$(window).trigger(event, [href, state]);
				
				return results;
			};
		};
		
		this._hijackPopState = function() {
			window.onpopstate = function(e) {
				//now trigger something special
				var state = __getState(window.location.href),
					event = jQuery.Event('request');
				
				event.state = state;
				$(window).trigger(event, [window.location.href, state]);
			};
		};
		
		this._hijackLinks = function() {
			//live listen to all links
			$(document).on('click', 'a', function(e) {
				//if another event says to do nothing
				if(e.originalEvent && e.originalEvent.stop) {
					//do nothing
					return;
				}
				
				//if the link is in the same domain
				if(this.href.indexOf(window.location.origin) === 0) {
					//stop it
					e.preventDefault();
					
					__pushLink(this.href);
				}
			});
		};
		
		this._hijackForms = function() {
			//listen to form submits
			$(document.body).on('submit', 'form', function(e) {
				//if the action is not in the same domain
				if($(this).attr('action') 
				&& $(this).attr('action').length
				&& $(this).attr('action').indexOf(window.location.origin) !== 0
				&& $(this).attr('action').indexOf('/') !== 0) {
					//do nothing
					return;
				}
				
				//if another event says to do nothing
				if(e.originalEvent.stop) {
					//do nothing
					return;
				}
				
				//at this point, the form is for local processing.
				
				//stop it
				e.preventDefault();
				
				__pushForm(this);
			});
		};
		
		/* Private Methods
		-------------------------------*/
		var __queryToHash = function(data) {
			var hash = {};
			
			//if empty data
			if(data.length == 0) {
				//return empty hash
				return {};
			}
			
			//split the query by &
			var queryArray = data.split('&');
			
			//loop through the query array
			for (var propertyArray, hashNameArray, 
			curent, next, name, value, j, i = 0; 
			i < queryArray.length; i++) {
				//split name and value
				propertyArray = queryArray[i].split('=');
				
				propertyArray[1] = propertyArray[1] || '';
				
				//url decode both name and value
				name = decodeURIComponent(propertyArray[0].replace(/\+/g, '%20'));
				value = decodeURIComponent(propertyArray[1].replace(/\+/g, '%20'));
				
				//if no value
				if (!propertyArray[1]) {
					//if no name
					if(!propertyArray[0]) {
						//do nothing
						continue;
					}
					
					value = null;
				}
				
				//At this point, we have a key and value
				
				//is value a a string but a number ?
				//and there is a decimal ?
				if(typeof value == 'string' 
				&& /^[\+\-]*[0-9\.]+$/.test(value)
				&& !/^0/.test(value)
				&& value.indexOf('.') === value.lastIndexOf('.')
				&& !isNaN(parseFloat(value))
				&& value.indexOf('.') != -1) {
					value = parseFloat(value);
				//is value a a string but a number ?
				} else if(typeof value == 'string'
				&& /^[\+\-]*[0-9\.]+$/.test(value)
				&& !/^0/.test(value) 
				&& value.indexOf('.') === value.lastIndexOf('.')
				&& !isNaN(parseFloat(value))) {
					value = parseInt(value);
				}
				
				//if no array marker
				if(name.indexOf('[') == -1) {
					//simply put it in hash
					hash[name] = value;
					//we are done
					continue;
				}
				
				//At this point, we have a hash key and value
				
				//BEFORE:
				//hash[key1][some][]
				//hash[][some][key1]
				
				hashNameArray = name.split('[');
				
				//AFTER:
				//hash, key1], some, ]
				//hash, ], some], key1]
				
				current = hash;
				for(j = 0; j < hashNameArray.length; j++) {
					//remove straggling ]
					name = hashNameArray[j].replace(']', '');
					
					//is there more names ?
					if((j + 1) == hashNameArray.length) {
						//we are done
						break;
					}
					
					//at this point there are more names
					//hash, key1, some, ]
					//hash, ], some], key1]
					
					//does it exist ? 
					if(!current[name]) {
						next =  {}
						
						//if no name
						//it is possible for numbers to be the name
						if(hashNameArray[j + 1] == ']'
						|| (!isNaN(parseFloat(hashNameArray[j + 1].replace(']', ''))) 
						&& isFinite(hashNameArray[j + 1].replace(']', '')))) {
							next = [];
						}
						
						
						//is the current an array ?
						if(current instanceof Array) {
							current.push(next);
						} else {
							current[name] = next;
						}
					}
					
					//at this point next exists
					
					//is the current an array ?
					if(current instanceof Array) {
						//traverse
						current = current[current.length - 1];
						continue;
					}
					
					//traverse
					current = current[name];
				}
				
				//is the current an array ?
				if(current instanceof Array) {
					current.push(value);
					continue;
				}
				
				//current can be undefined because it reached
				//a datatype that cannot be traversable
				if(current) {
					current[name] = value;
				}
			}
			
			return hash;
		};
		
		var __replace = function(data, files) {
			for(var key in data) {
				if(data.hasOwnProperty(key)) {
					if(typeof data[key] === 'string' && data[key].indexOf('____CHOPS____') === 0) {
						if(typeof files[data[key].substr(13)] === 'undefined') {
							delete data[key];
						}
						
						data[key] = files[data[key].substr(13)];
					}
					
					if(typeof data[key] === 'object' && data[key] !== null) {
						__replace(data[key], files);
					}
				}
			}
		};
		
		var __getState = function(url) {
			var state = { 
				url		: url,
				path	: url.split('#').shift().split('?').shift(),
				query	: '', //query string
				hash	: '',
				json	: '', //json string; no files
				method	: 'GET', 
				data	: {}, //combined data in common js object
				serial	: [], //serialized array; no files
				files	: [] }; //serialized array; just files
			
			var origin = window.location.protocol + '//' + window.location.hostname;
			
			if(window.location.port) {
				origin += ':' + window.location.port;
			}
			
			if(state.path.indexOf(origin) === 0) {
				state.path = state.path.substr(origin.length).split('?')[0];
			}
			
			if(url.indexOf('#') !== -1) {
				state.hash = url.split('#').pop();
			}
			
			if(__useHash) {
				state.path 	= state.hash.split('?')[0] || '/';
				state.hash 	= '';
			}
			
			//if there is a ?
			if(state.url.indexOf('?') !== -1) {
				state.query = state.url.split('?')[1];
			} 
			
			state.data = __queryToHash(state.query);
			state.json = JSON.stringify(state.data);
			
			var query = [];
			
			if(state.query.length) {
				query = state.query.split('&');
			}
			
			for(var setting, i = 0; i < query.length; i++) {
				setting = query[i].split('=');
				state.serial.push({name: setting.shift(), value: setting.join('=')});
			}
			
			return state;
		};
		
		var __pushLink = function(url) {
			
			var origin = window.location.protocol + '//' + window.location.hostname;
			
			if(window.location.port) {
				origin += ':' + window.location.port;
			}
			
			if(__useHash) {
				if(url.indexOf(origin) === 0) {
					url = url.substr(origin.length);
					url = origin + __root + '/#' + url;
				} else {
					url = __root + '/#' + url;
				}
			}
			
			if(url.indexOf(origin) !== 0) {
				url = origin + url;
			} 
			
			var state = __getState(url);
			
			//push the state
			window.history.pushState(state, '', url);
		};
		
		var __pushForm = function(form) {
			var url = $(form).attr('action') || window.location.href;
			
			if(__useHash) {
				var origin = window.location.protocol + '//' + window.location.hostname;
			
				if(window.location.port) {
					origin += ':' + window.location.port;
				}
				
				if(url.indexOf(origin) === 0) {
					url = url.substr(origin.length);
					url = origin + __root + '/#' + url;
				} else {
					url = __root + '/#' + url;
				}
			}
			
			var state = __getState(url);
			
			//populate state with what we know
			state.method 	= $(form).attr('method') || 'GET'; 
			state.method 	= state.method.toUpperCase();
			state.query 	= $(form).serialize();
			state.serial 	= $(form).serializeArray();
			state.data		= __queryToHash(state.query);
			state.json 		= JSON.stringify(state.data);
			
			//is it a GET request ?
			if(state.method === 'GET') {
				//manually form the HREF
				//if there is a ?
				if(state.url.indexOf('?') !== -1) {
					state.url = state.url.split('?')[0];
				} 
				
				//populate the state
				state.url += '?' + state.query;
			}
			
			var files = { query: state.query, items: {} };
			
			//is there files?
			$('input[type="file"]', form).each(function() {
				//if there is no name to this
				if(!this.name || !this.name.length) {
					//skip it
					return;
				}
				
				//store the files
				for(var j = 0, i = 0; i < this.files.length; i++) {
					state.files.push({ name: this.name + '[]', value: this.files[i] });
					files.items[++j] = this.files[i];
					
					//add this to state.data
					files.query += '&' + this.name + '[]=____CHOPS____' + j;
				}
			});
			
			files.data = __queryToHash(files.query);
			
			__replace(files.data, files.items);
			
			state.data = files.data;
			
			//push the state
			window.history.pushState(state, '', state.url);
		};
	};
	
	/* Adaptor
	-------------------------------*/
	//if AMD
	if(typeof define === 'function') {
		define(['jquery', 'classified'], function(jQuery, classified) {
			return classified(chops).singleton();
		});
	//how about jQuery?
	} else if(typeof jQuery === 'function' && typeof jQuery.extend === 'function') {
		jQuery.extend({
			chops: jQuery.classified(chops).singleton()
		});
	//ok fine lets put it in windows.
	} else if(typeof window === 'object') {
		window.chops = window.classified(chops).singleton();
	}
})();