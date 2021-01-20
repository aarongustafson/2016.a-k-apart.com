(function(window,document){// Preamble for all JavaScript in this folder

'use strict';

function setupCounter()
{
	var $field = document.querySelector('[data-count]'),
		range,
		$message,
		added = false,
		state = false;
	
	if ( $field )
	{
		range = $field.dataset.count.split('-');
		
		// Piggyback on existing semantics
		$message = $field.getAttribute('aria-describedby');
		if ( $message )
		{
			$message = document.getElementById( $message.split(' ')[0] );
			if ( $message )
			{
				added = true;
			}
		}

		// Add a new message
		if ( ! $message )
		{
			$message = document.createElement('strong');
			$message.id = $field.id + '-e';
			$field.setAttribute( 'aria-describedby', $message.id );
		}

		$message.setAttribute('aria-live','polite');
		$message.setAttribute('aria-atomic','true');
		$field.addEventListener( 'keyup', keyup, false );
	}
	
	function keyup()
	{
		// Add the message if it’s not already added
		if ( ! added )
		{
			$field.parentNode.appendChild( $message );
			added = true;
		}

		var length = $field.value.length;
		if ( length < range[0] && state != 'under' )
		{
			$message.innerHTML = 'You will need to type at least ' + range[0] + ' characters.';
			state = 'under';
		}
		else if ( length > range[1] && state != 'over' )
		{
			$message.innerHTML = 'You’ve gone over the ' + range[1] + ' character limit.';
			state = 'over';
		}
		else if ( length >= range[0] && length <= range[1] && state != 'good' )
		{
			$message.innerHTML = 'Your text is the right length.';
			state = 'good';
		}

		$field.className = 'count count--' + state;
	}

}

setupCounter();
// Preview an entry as it is built

var $main = document.getElementsByTagName('main')[0],
	// preview HTML
	$preview = document.createElement('article'),
	$heading = document.createElement('h2'),
	$author = document.createElement('b'),
	$project = document.createElement('b'),
	$description = document.createElement('p'),
	
	// Form stuff
	$form = document.getElementsByTagName('form')[0],
	$name = document.getElementById('n'),
	name,
	$title = document.getElementById('p'),
	title,
	$screenshot = document.getElementById('s'),
	screenshot,
	$text = document.getElementById('d'),
	text,
	reader = false;
	
// setup the classes
$preview.className = 'project project--preview';
$author.className = 'project__author';
$project.className = 'project__name';

// combine stuff
$heading.appendChild($author);
$heading.appendChild($project);
$preview.appendChild($heading);

function previewText(){
	
	$main.classList.add('has-project-preview');
	
	// for performance, we’ll work with the original but swap in the clone
	var $clone;
	if ( $preview.parentNode == $main )
	{
		$clone = $preview.cloneNode(true);
		$main.replaceChild( $clone, $preview );
	}
	
	name = $name.value;
	$author.innerText = ( name != '' ? name : $name.placeholder );
	
	title = $title.value;
	$project.innerText = ( title != '' ? title : $title.placeholder );
	
	text = $text.value;
	if ( text != '' )
	{
		$description.innerText = text;
		if ( $description.parentNode != $preview )
		{
			$preview.appendChild($description);
		}
	}
	
	if ( $clone )
	{
		$main.replaceChild( $preview, $clone );
	}
	else
	{
		$main.appendChild( $preview );
	}
	
}

// init
previewText();

// set the handlers
$form.addEventListener( 'keyup', previewText, false );
$form.addEventListener( '10k::preview', previewText, false );
// Epilogue for all JavaScript in this folder
}(this,this.document));