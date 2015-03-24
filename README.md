Mobility
========

Mobility is a super light weight HTML, CSS, and JS mobile UI built on top of Bootstrap for developing mobile applications. 

View the demo here (with code samples):
[http://cblanquera.github.io/mobility/](http://cblanquera.github.io/mobility/)

View mobile blog example here:
[http://cblanquera.github.io/mobility/boilerplates/blog](http://cblanquera.github.io/mobility/boilerplates/blog)

View mobile store example here:
[http://cblanquera.github.io/mobility/boilerplates/store](http://cblanquera.github.io/mobility/boilerplates/store)

Mobility Features:
 - CSS Powered Transitions
 - Fixed Header and footer
 - Form Fields optimized for mobile
 - Tabs
 - Lists (with inifinite scrolling pagination both on top and on the bottom)
 - Modals
 - Popover Menus
 - Aside Menus
 - Notifications
 - Hero Image

Optional Components:
 - Image Field and Client Side Cropper
 - Apple Style Pasword field

Mobility uses:
 - Boostrap 3
 - jQuery
 - Font Awesome 4
 - Open Sans
 - [Do On](http://github.com/cblanquera/doon)
 
Mobility works well with:
 - Handlebars
 - [Acquire](http://github.com/cblanquera/acquire)
 - [CHOPS](http://github.com/cblanquera/chops)

Mobility plays nice with:
 - Backbone
 - Angular
 - RequireJS (though I had problems using RequireJS on PhoneGap)
 
Mobility is full of plugable events:
 - `$(window).on('go-click', callback)`
 - `$(window).on('go-back-click', callback)`
 - `$(window).on('go-forward-click', callback)`
 - `$(window).on('go-previous-click', callback)`
 - `$(window).on('go-next-click', callback)`
 - `$(window).on('go-fade-click', callback)`
 - `$(window).on('mobility-request', callback)`
 - `$(window).on('mobility-paginate', callback)`
 - `$(window).on('mobility-refresh', callback)`
 - `$(window).on('tab-switch-click', callback)`
 - `$(window).on('modal-open-click', callback)`
 - `$(window).on('modal-close-click', callback)`
 - `$(window).on('popover-open-click', callback)`
 - `$(window).on('popover-close-click', callback)`
 - `$(window).on('notify-open-click', callback)`
 - `$(window).on('notify-close-click', callback)`
 - `$(window).on('aside-click', callback)`

Mobility is full of programatic triggers:
 - `$.mobility.notify('hi', 'warning')`
 - `$.mobility.swap('hi', 'slide-left')`
 - `$.mobility.modalOpen('#sample-modal')`
 - `$.mobility.modalClose('#sample-modal')`
 - `$.mobility.popoverOpen('#sample-popover')`
 - `$.mobility.popoverClose('#sample-popover')`
 - `$.mobility.asideOpen('#sample-aside')`
 - `$.mobility.asideClose('#sample-aside')`
 - `$.mobility.isMobile.Android()`
 - `$.mobility.isMobile.iOS()`

You are free to use any Bootstrap class and components. Mobility has been tested on PhoneGap for iOS > 6 and Android > 4.1.1 and works well with Cordova. Mobility is not for everyone if you disagree with the libraries chosen, you should not use this UI.

Why Not Use X
========

I never wanted to write this actually. I tried using ChocolateChip UI, not pluggable. I tried using Ratchet, problems with PhoneGap. I tried using TopCoat, not enough components. I tried using jQuery Mobile, not that style friendly. I don't even want to go over Sencha Touch. I'm sorry but I love Bootstrap's way of doing things overall.

Hints and Tips
========
 - Start off with the [Mobility Boilerplate](http://github.com/cblanquera/mobility/example/boilerplates/blank)
 - Do not use `position: fixed`. Instead use `position: absolute`
 - Do not `display: none` on `<input type="file" />`
 - Mobility out of the box color themes use the same hue/saturation/brightness combinations given the starting color (It wasn't randomly chosen).

License
========
 The MIT License (MIT)

Copyright (c) 2014 Christian Blanquera

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.