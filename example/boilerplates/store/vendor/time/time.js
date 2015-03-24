jQuery.extend({
	time: jQuery.classified(function() {
		/* Require
		-------------------------------*/
		/* Constants
		-------------------------------*/
		/* Public.Properties
		-------------------------------*/
		this.offset = (new Date()).getTimezoneOffset() * 60000;
		
		/* Protected Properties
		-------------------------------*/
		/* Private Properties
		-------------------------------*/
		/* Magic
		-------------------------------*/
		/* Public.Methods
		-------------------------------*/
		/**
		 * Returns Unix time
		 *
		 * @return number
		 */
		this.now = function(gmt) {
			var offset = gmt ? this.offset: 0;
			return (new Date).getTime() + offset;
		};
		
		/**
		 * Converts time to a readable formatted date
		 *
		 * @param int|string|Date
		 * @param bool
		 * @param bool
		 * @return string
		 */
		this.toDate = function(date, format, gmt) {
			format = format || 'F d, Y h:ia';
			
			if(!(date instanceof Date)) {
				date = new Date(date);	
			}
			
			if(gmt) {
				date = new Date(date.getTime() + this.offset);	
			}
			
			for(var string = '', escaped = false, char, i = 0; i < format.length; i++) {
				char = format.substring(i, i + 1);
				
				if(!escaped && char === '\\') {
					escaped = true;
					continue;
				} 
				
				if(escaped || typeof __formats[char] === 'undefined') {
					string += '' + char;
					escaped = false;
					continue;
				}
				
				string += '' + __formats[char](date);
			}
			
			return string;
		};
		
		/**
		 * Converts time to a relative formatted date
		 *
		 * @param int|string|Date
		 * @return string
		 */
		this.toRelative = function(time, gmt) {
			if(typeof time === 'string') {
				if(!(new Date(time)).getTime()) {
					//we have to do this the old school way
					if(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}\s[0-9]{2}\:[0-9]{2}\:[0-9]{2}$/.test(time)) {
						var parts = time.split(/\-|\s|\:/);
						
						time = new Date();
						time.setYear(parseInt(parts[0]));
						time.setMonth(parseInt(parts[1]) - 1);
						time.setDate(parseInt(parts[2]));
						time.setHours(parseInt(parts[3]));
						time.setMinutes(parseInt(parts[4]));
						time.setSeconds(parseInt(parts[5]));
					} else if(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/.test(time)) {
						var parts = time.split('-');
						
						time = new Date();
						time.setYear(parseInt(parts[0]));
						time.setMonth(parseInt(parts[1]) - 1);
						time.setDate(parseInt(parts[2]));
					} else {
						time = new Date(time);	
					}
				} else {
					time = new Date(time);	
				}
			}
			
			if(time instanceof Date) {
				time = time.getTime();	
			}
			
			if(gmt) {
				time += this.offset;
			}
			
			var dateNow	= new Date();
			var now 	= dateNow.getTime();
	
			var passed 	=  now - parseInt(time);
	
			var tokens 	= [
				[(1000 * 60 * 60 * 24 * 365), 'year'],
				[(1000 * 60 * 60 * 24 * 30), 'month'],
				[(1000 * 60 * 60 * 24 * 7), 'week'],
				[(1000 * 60 * 60 * 24), 'day'],
				[(1000 * 60 * 60), 'hour'],
				[(1000 * 60), 'minute'],
				[1000, 'second'],
				[-1000, 'second'],
				[-(1000 * 60), 'minute'],
				[-(1000 * 60 * 60), 'hour'],
				[-(1000 * 60 * 60 * 24), 'day'],
				[-(1000 * 60 * 60 * 24 * 7), 'week'],
				[-(1000 * 60 * 60 * 24 * 7 * 3), 'week'],
				[(1000 * 60 * 60 * 24 * 30), 'month'],
				[(1000 * 60 * 60 * 24 * 365), 'year'] ];
			
			if(passed > (tokens[0][0] * 3) || passed < (tokens[9][0] * 3)) {
				return this.toDate(time, 'M d');
			}
			
			for(var prefix = '', suffix = '', i = 0; i < tokens.length; i++) {
				if(passed < tokens[i][0]) {
					continue;
				}
				
				if(tokens[i][0] < 0) {
					i--;
				}
				
				passed = Math.round(passed / tokens[i][0]);
				
				
				if(tokens[i][1] == 'second' && -5 < passed && passed < 5) {
					return 'Now';
				} 
	
				if(tokens[i][1] == 'day' && passed == 1) {
					if(tokens[i][0] < 0) {
						return 'Tomorrow';
					}
					
					return 'Yesterday';
				} 
				
				prefix = tokens[i][0] < 0 ? 'in ': '';
				suffix = tokens[i][0] > 0 ? ' ago': '';
	
				return prefix + passed + ' ' + tokens[i][1]+(passed == 1 ? '' : 's')+suffix;
			}
			
			return this.toDate(time, 'M d');
		};
		
		/* Protected Methods
		-------------------------------*/
		/* Private Methods
		-------------------------------*/
		/* Long Data
		-------------------------------*/
		var __formats = {
			a: function(date) {
				return date.getHours() < 12 ? 'am' : 'pm';
			},
			
			A: function(date) {
				return date.getHours() < 12 ? 'AM' : 'PM';
			},
			
			B: function(date) {
				return ('000' + Math.floor((date.getHours() * 60 * 60 
				+ (date.getMinutes() + 60 
				+ date.getTimezoneOffset()) * 60 
				+ date.getSeconds()) / 86.4) % 1000).slice(-3);
			},
			
			c: function(date) {
				return date().toDate(date, 'Y-m-d\\TH:i:s');
			},
			
			d: function(date) {
				return (date.getDate() < 10 ? '0' : '') + date.getDate();
			},
			
			D: function(date) {
				switch (date.getDay()) {
					case 0: return 'Sun';
					case 1: return 'Mon';
					case 2: return 'Tue';
					case 3: return 'Wed';
					case 4: return 'Thu';
					case 5: return 'Fri';
					case 6: return 'Sat';
					default: return '';
				}
			},
			
			e: function(date) {
				var first 	= parseInt(Math.abs(date.getTimezoneOffset() / 60),10),
					second 	= Math.abs(date.getTimezoneOffset() % 60);
					
				return (new Date().getTimezoneOffset() < 0 ? '+' : '-') 
					+ (first < 10 ? '0' : '') + first 
					+ (second < 10 ? '0' : '') + second;
			},
			
			F: function(date) {
				switch (date.getMonth()) {
					case 0: return 'January';
					case 1: return 'February';
					case 2: return 'March';
					case 3: return 'April';
					case 4: return 'May';
					case 5: return 'June';
					case 6: return 'July';
					case 7: return 'August';
					case 8: return 'September';
					case 9: return 'October';
					case 10: return 'November';
					case 11: return 'December';
					default: return '';
				}
			},
			
			g: function(date) {
				return date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
			},
			
			G: function(date) {
				return date.getHours();
			},
			
			h: function(date) {
				var hour = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
				return (hour < 10 ? "0" : "") + hour;
			},
			
			H: function(date) {
				return (date.getHours() < 10 ? '0' : '') + date.getHours();
			},
			
			i: function(date) {
				return (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
			},
			
			I: function(date) {
				return date.getTimezoneOffset() < Math.max(
					new Date(date.getFullYear(), 0, 1).getTimezoneOffset(),
					new Date(date.getFullYear(), 6, 1).getTimezoneOffset()) 
					? 1 : 0;
			},
			
			j: function(date) {
				return date.getDate();
			},
			
			l: function(date) {
				switch (date.getDay()) {
					case 0: return 'Sunday';
					case 1: return 'Monday';
					case 2: return 'Tuesday';
					case 3: return 'Wednesday';
					case 4: return 'Thursday';
					case 5: return 'Friday';
					case 6: return 'Saturday';
					default: return '';
				}
			},
			
			L: function(date) {
				return new Date(date.getFullYear(), 1, 29).getMonth() == 1 ? 1 : 0;
			},
			
			m: function(date) {
				return (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
			},
			
			M: function(date) {
				switch (date.getMonth()) {
					case 0: return 'Jan';
					case 1: return 'Feb';
					case 2: return 'Mar';
					case 3: return 'Apr';
					case 4: return 'May';
					case 5: return 'Jun';
					case 6: return 'Jul';
					case 7: return 'Aug';
					case 8: return 'Sep';
					case 9: return 'Oct';
					case 10: return 'Nov';
					case 11: return 'Dec';
					default: return '';
				}
			},
			
			n: function(date) {
				return date.getMonth() + 1;
			},
			
			N: function(date) {
				return date.getDay() == 0 ? 7 : date.getDay();
			},
			
			o: function(date) {
				return date.getWeekYear();
			},
			
			O: function(date) {
				var first = parseInt(Math.abs(date.getTimezoneOffset() / 60),10),
					second = Math.abs(date.getTimezoneOffset() % 60);
					
				return (new Date().getTimezoneOffset() < 0 ? '+' : '-') 
					+ (first < 10 ? '0' : '') + first 
					+ (second < 10 ? '0' : '') + second;
			},
			
			P: function(date) {
				var first = parseInt(Math.abs(date.getTimezoneOffset() / 60),10),
					second = Math.abs(date.getTimezoneOffset() % 60);
					
				return (new Date().getTimezoneOffset() < 0 ? "+" : "-") 
					+ (first < 10 ? '0' : '') + first + ':' 
					+ (second < 10 ? '0' : '') + second;
			},
			
			r: function(date) {
				return date().toDate(date, 'D, d M Y H:i:s O');
			},
			
			s: function(date) {
				return (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
			},
			
			S: function(date) {
				switch (date.getDate()) {
					case 1:
					case 21:
					case 31:
						return 'st';
	
					case 2:
					case 22:
						return 'nd';
	
					case 3:
					case 23:
						return 'rd';
	
					default:
						return 'th';
				}
			},
			
			t: function(date) {
				return new Date(date.getFullYear(),date.getMonth() + 1, 0).getDate();
			},
			
			T: function(date) {
				var abbreviation = String(date).match(/\(([^\)]+)\)$/) 
				|| String(date).match(/([A-Z]+) [\d]{4}$/);
				
				if (abbreviation) {
					abbreviation = abbreviation[1].match(/[A-Z]/g).join("");
				}
				
				return abbreviation;
			},
			
			u: function(date) {
				return date.getMilliseconds() * 1000;
			},
			
			U: function(date) {
				return Math.round(date.getTime() / 1000);
			},
			
			w: function(date) {
				return date.getDay();
			},
			
			W: function(date) {
				return date.getWeek();
			},
			
			y: function(date) {
				return String(date.getFullYear()).substring(2,4);
			},
			
			Y: function(date) {
				return date.getFullYear();
			},
			
			z: function(date) {
				return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
			},
			
			Z: function(date) {
				return (date.getTimezoneOffset() < 0 ? '+' : '-') + (date.getTimezoneOffset() * 24);
			}
		};
	}).singleton()
});