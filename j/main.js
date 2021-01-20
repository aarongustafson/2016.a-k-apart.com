(function(window,document){// Preamble for all JavaScript in this folder

'use strict';

// Alias Element.matches()
if ( ! Element.prototype.matches )
{
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;            
        };
}
function cookiesApproved(){
	return document.cookie.indexOf('approves_cookies') > -1;
}
// Get the active Media Query as defined in the CSS
// Use the following format:
// #getActiveMQ-watcher { font-family: "default"; }
// @media only screen and (min-width:20em){ #getActiveMQ-watcher { font-family: "small"; } }
// etc.
window.getActiveMQ = function()
{
		// Build the watcher
	var $watcher = document.createElement('div'),
		// alias getComputedStyle
		computed = window.getComputedStyle,
		// Regexp for removing quotes
		re = /['"]/g;

	// set upt the watcher and add it to the DOM
	$watcher.setAttribute( 'id', 'getActiveMQ-watcher' );
	$watcher.style.display = 'none';
	document.body.appendChild( $watcher );
	
	// For modern browsers
	if ( computed )
	{
		window.getActiveMQ = function() {
			return computed( $watcher, null ).getPropertyValue( 'font-family' ).replace( re, '' );
		};
	}
	// For everything else
	else
	{
		window.getActiveMQ = function() {
			return 'unknown';
		};
	}
	return window.getActiveMQ();
};
window.watchResize = function( callback ){
	var resizing;
	callback.size = 0;
	function done()
	{
		var curr_size = window.innerWidth;
		clearTimeout( resizing );
		resizing = null;
		// only run on a true resize
		if ( callback.size != curr_size )
		{
			callback();
			callback.size = curr_size;
		}
	}
	window.addEventListener('resize', function(){
		if ( resizing )
		{
			clearTimeout( resizing );
			resizing = null;
		}
		resizing = setTimeout( done, 50 );
	});
	// init
	callback();
};
var $cookie_banner = document.getElementById('cookie-banner'),
	$form;

if ( $cookie_banner )
{
	// close & destroy
	function closeCookieBanner(immediate) {

			// How fast to close? Animation takes .5s
		var close_speed = immediate ? 0 : 600;

		// remove
		window.setTimeout(function(){

			$cookie_banner.parentNode.removeChild( $cookie_banner );
			$cookie_banner = null;

		}, close_speed);
		
		// animate closed
		if ( ! immediate ) {
	    	$cookie_banner.className = 'closing';
	  	}

	}

	// In case the template is cached
	if ( cookiesApproved() )
	{
		// close immedately
		closeCookieBanner( true );
	}
	else
	{
		function approveCookies( e ) {
			
			e.preventDefault();

			var cookie,
				expires = new Date();
			
			// expire in one year
			expires.setFullYear( expires.getFullYear() + 1 );

			cookie = [
				'approves_cookies=yes',
				'expires=' + expires.toUTCString(),
				'domain=' + window.location.hostname,
				window.location.protocol == 'https:' ? 'secure' : ''
			];

			// set it
			document.cookie = cookie.join('; ');
			
			closeCookieBanner();

			return false; 
		};

		$form = $cookie_banner.getElementsByTagName('form')[0];
		$form.addEventListener( 'submit', approveCookies, false );
	}	 
}
// Google Analytics Async (compressed)
if ( cookiesApproved() )
{
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.defer=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-37396709-8', 'auto');
	ga('send', 'pageview');
}
// Lazy Load Images
// Assumes Jpeg XR and WebP versions exist for all images
//
// data-img="A|B|C|D|E"
// A = source url
// B = alt
// C = prepend? (y/n)
// D = insert into (descendent selector)
// E = svg?
//
function lazyImages(){

	if ( !( 'querySelectorAll' in document ) ){ return; }

	var $els = document.querySelectorAll( '[data-img]' ),
		i = $els.length,
		$el,
		$parent,
		$picture = document.createElement('picture'),
		$webp = document.createElement('source'),
		$svg = $webp.cloneNode(true),
		$img = document.createElement('img'),
		$ins,
		data,
		file_path,
		file_root,
		inserted = false;

	$webp.type = 'image/webp';
	$svg.type = 'image/svg+xml';
	
	$picture.appendChild($webp);
	$picture.appendChild($img);

	while ( i-- )
	{
		$el = $els[i];
		data = $el.dataset.img.split('|');
		// console.log('data',data);

		// Get the root file name
		file_path = data[0].substring(0, data[0].lastIndexOf('/') + 1);
		data[0] = data[0].substring(data[0].lastIndexOf('/') + 1, data[0].length);
		data[0] = data[0].split('.');
		file_root = file_path + data[0][0];
		data[0] = file_path + data[0].join('.');

		// Original Image
		$img.src = data[0];
		$img.alt = ( data[1] ? data[1] : '' );

		// WebP
		$webp.srcset = file_root + '.webp';
		// console.log('WebP source', $webp.srcset);

		// SVG?
		if ( data[4] &&
		     data[4] == 'y' )
		{
			$picture.insertBefore( $svg, $picture.firstChild );
			$svg.srcset = file_root + '.svg';
		}
		else
		{
			if ( $svg.parentNode == $picture )
			{
				$picture.removeChild( $svg );
			}
		}

		// Create the insertion
		$ins = $picture.cloneNode(true);

		// Get the parent (old or new)
		$parent = false;
		if ( data[3] != '' )
		{
			$parent = $el.querySelector( data[3] );
		}
		if ( ! $parent )
		{
			$parent = $el;
		}

		// append or prepend?
		if ( data[2] == 'y' )
		{
			$parent.insertBefore( $ins, $parent.firstChild );
		}
		else
		{
			$parent.appendChild( $ins );
		}

		$el.setAttribute('data-imaged', 'true');
	}

}

// On DOM Ready
lazyImages();
function linkAll(){
	
	if ( !( 'querySelectorAll' in document ) ) { return; }
	
	var selector = '[data-link-all]',
		$els = document.querySelectorAll( selector ),
		len = $els.length,
		$el;
	
	while ( len-- )
	{
		$el = $els[len];
		$el.link = $el.querySelector('a');
		$el.clicked = false;

		$el.addEventListener( 'click', link, false );
		$el.addEventListener( 'touchdown', link, false );
	
		$el.classList.add('clickable');
	}

	function link(e) {
		var $target = e.target;
		if ( $target.nodeName.toLowerCase() != 'a' )
		{
			while ( ! $target.matches( selector ) )
			{
				$target = $target.parentNode;
			}
			if ( $target.clicked ) { return; }
			$target.clicked = true;
			$target.link.click(); 
			setTimeout(function(){
				$target.clicked = false;
			}, 500);
		}
	}
	
}

linkAll();
// Register the service worker
if ( 'serviceWorker' in window.navigator )
{
	navigator.serviceWorker
		.register('/serviceworker.js')
			//.then(function(registration) {
			//	// Registration was successful
			//	console.log(
			//		'ServiceWorker registration successful with scope: ',
			//		registration.scope
			//	);
			//})
			//.catch(function(err) {
			//    // registration failed :(
			//    console.log( 'ServiceWorker registration failed: ', err );
			//})
	;
}
function storageAvailable(type) {
	if ( ! cookiesApproved() )
	{
		return false;
	}
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}

window.localStorageAvailable = storageAvailable('localStorage');
window.sessionStorageAvailable = storageAvailable('sessionStorage');
function svgAvailable() {
	return	document.implementation &&
			document.implementation.hasFeature &&
			document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
}

window.svgAvailable = svgAvailable();

if ( window.svgAvailable ) {
	document.getElementsByTagName('html')[0].classList.add('has-svg');
}
// Epilogue for all JavaScript in this folder

window.xhrReInit = function(){
	linkAll();
	lazyImages();
};}(this,this.document));