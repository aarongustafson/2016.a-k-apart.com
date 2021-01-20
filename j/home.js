(function(window,document){if ( ! ( 'querySelector' in document ) ) {
	return;
}

var $hero =  document.querySelector( '.hero' ),
	base_hero_url = '/i/hero',
	cache = window.localStorage,
	$svg = false,
	XHR,
	hero_loaded = false;

function injectHero()
{
	var $script = document.createElement('script'),
		$scripts,
		s,
		attributes,
		a;

	// Fresh copy from XHR
	if ( ! $svg )
	{
		injectSVG = function(){
			$hero.appendChild( $svg );
		};

		$svg = this.responseXML;
		if ( $svg instanceof Document )
		{
			$svg = this.responseText;
			if ( window.localStorageAvailable )
			{
				cache.setItem('hero', $svg );
			}
		}
		else
		{
			$svg = false;
		}
	}

	if ( $svg )
	{
		$hero.insertAdjacentHTML( 'beforeend', $svg );
		hero_loaded = true;

		// pull the scripts and re-insert so they load
		$scripts = $hero.getElementsByTagName('script');
		s = $scripts.length;
		while ( s-- )
		{
			attributes = $scripts[s].attributes;
			a = attributes.length;
			while ( a-- )
			{
				if ( attributes[a].name == 'xlink:href' )
				{
					$script.src = attributes[a].value;
					$hero.appendChild( $script.cloneNode(true) );
				}
			}
		}
	}
	else
	{
		loadFallbackImage();
	}

}

function loadFallbackImage()
{
	var $picture = document.createElement('picture'),
		$source = document.createElement('source'),
		$img = document.createElement('img');

	// JPEG-XR
	$source.type = 'image/jxr';
	$source.srcset = base_hero_url + '.jxr';
	$picture.appendChild( $source.cloneNode(true) );

	// WebP
	$source.type = 'image/webp';
	$source.srcset = base_hero_url + '.webp';
	$picture.appendChild( $source.cloneNode(true) );

	// PNG
	$source.removeAttribute( 'type' );
	$source.srcset = base_hero_url + '.png';
	$picture.appendChild( $source.cloneNode(true) );

	// Fallback
	$img.src = base_hero_url + '.png';
	$img.alt = '';
	$picture.appendChild( $img );

	// Add it in
	$hero.appendChild( $picture );

	hero_loaded = true;
}

function lazyLoadHero()
{
	// SVG
	if ( window.svgAvailable )
	{
		$svg;
		if ( window.localStorageAvailable )
		{
			$svg = cache.getItem('hero');
		}		
		if ( $svg )
		{
			injectHero();
		}
		else
		{
			XHR = new XMLHttpRequest();
			XHR.addEventListener( 'load', injectHero );
			XHR.open( 'GET', base_hero_url + '.svg' );
			if ( XHR.overrideMimeType )
			{
				XHR.overrideMimeType('text/xml');
			}
			XHR.send();
		}
	}
	// Image fallback
	else
	{
		loadFallbackImage();
	}
}

window.watchResize(function(){
	if ( hero_loaded )
	{
		return;
	}

	var MQ = getActiveMQ();
	if ( MQ == 'larger' || MQ == 'full' )
	{
		lazyLoadHero();
	}
});}(this,this.document));