(function(window,document){if ( ! ( 'DOMParser' in window ) )
{
	return;
}

var $main = document.querySelector('main'),
	XHR = new XMLHttpRequest(),
	parser = new DOMParser(),
	text,
	requested_url,
	content,
	cache,
	pop = false;

// Caching fallback from ServiceWorker to sessionStorage
function setCacheItem(){}
function getCacheItem(){ return undefined; }
if ( ! ( 'serviceWorker' in window.navigator ) &&
	 window.sessionStorageAvailable )
{
	cache = window.sessionStorage;
	setCacheItem = function( key, text )
	{
		return cache.setItem( key, text );
	};
	getCacheItem = function( key )
	{
		return cache.getItem( key );
	};
}

function updateGallery()
{
	var response;
	if ( ! content )
	{
		response = parser.parseFromString( this.responseText, 'text/html' );
		content = response.getElementsByTagName( 'main' )[0].innerHTML;
	}
	
	// insert the gallery
	$main.innerHTML = content;

	// XHR needs processing & caching
	if ( response )
	{
		window.xhrReInit();
		setCacheItem( requested_url, $main.innerHTML );
	}

	// update history
	if ( ! pop )
	{
		history.pushState( {}, text, requested_url );
	}
	// update next time
	else
	{
		pop = false;
	}
}

function paginate( e ) {
	
	var $target = e.target,
		hidden = '.pagination a .hidden',
		pagination_links = '.pagination .next, .pagination .prev',
		cached_response;
	
	if ( $target.matches( hidden ) )
	{
		$target = $target.parentNode;
	}

	if ( $target.matches( pagination_links ) )
	{
		e.preventDefault();

		// Get the page info
		requested_url = $target.href;
		text = $target.innerText;

		content = getCacheItem( requested_url );		
		if ( content )
		{
			updateGallery();
		}
		// Load via XHR
		else
		{
			XHR.open( 'GET', requested_url );
			XHR.send();
		}
		
	}

}

window.addEventListener( 'load', function(){
	setCacheItem( window.location.href, $main.innerHTML );
});
window.addEventListener( 'popstate', function(e){
	requested_url = document.location;
	content = getCacheItem( requested_url );
	pop = true;
	updateGallery();
});
XHR.addEventListener( 'load', updateGallery );

$main.addEventListener('click', paginate, false);
$main.addEventListener('touchdown', paginate, false);}(this,this.document));