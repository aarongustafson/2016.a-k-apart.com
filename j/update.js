(function(window,document){// Preamble for all JavaScript in this folder

'use strict';

var $body = document.body,
	$postal_code = document.getElementById('ap'),
	$country = document.getElementById('ac'),
	$city_state = document.getElementById('al'),
	$datalist = document.createElement('datalist'),
	$option = document.createElement('option'),
	options,
	throttling,
	throttle_sensitivity = 500,
	country_codes = {"ZW":"Zimbabwe","ZM":"Zambia","ZA":"South Africa","YT":"Mayotte","YE":"Yemen","XK":"Kosovo","WS":"Samoa","WF":"Wallis and Futuna","VU":"Vanuatu","VN":"Vietnam","VI":"U.S. Virgin Islands","VG":"British Virgin Islands","VE":"Venezuela","VC":"Saint Vincent and the Grenadines","VA":"Vatican City","UZ":"Uzbekistan","UY":"Uruguay","US":"United States","UM":"U.S. Minor Outlying Islands","UG":"Uganda","UA":"Ukraine","TZ":"Tanzania","TW":"Taiwan","TV":"Tuvalu","TT":"Trinidad and Tobago","TR":"Turkey","TO":"Tonga","TN":"Tunisia","TM":"Turkmenistan","TL":"East Timor","TK":"Tokelau","TJ":"Tajikistan","TH":"Thailand","TG":"Togo","TF":"French Southern Territories","TD":"Chad","TC":"Turks and Caicos Islands","SZ":"Swaziland","SY":"Syria","SX":"Sint Maarten","SV":"El Salvador","ST":"São Tomé and Príncipe","SS":"South Sudan","SR":"Suriname","SO":"Somalia","SN":"Senegal","SM":"San Marino","SL":"Sierra Leone","SK":"Slovakia","SJ":"Svalbard and Jan Mayen","SI":"Slovenia","SH":"Saint Helena","SG":"Singapore","SE":"Sweden","SD":"Sudan","SC":"Seychelles","SB":"Solomon Islands","SA":"Saudi Arabia","RW":"Rwanda","RU":"Russia","RS":"Serbia","RO":"Romania","RE":"Réunion","QA":"Qatar","PY":"Paraguay","PW":"Palau","PT":"Portugal","PS":"Palestine","PR":"Puerto Rico","PN":"Pitcairn Islands","PM":"Saint Pierre and Miquelon","PL":"Poland","PK":"Pakistan","PH":"Philippines","PG":"Papua New Guinea","PF":"French Polynesia","PE":"Peru","PA":"Panama","OM":"Oman","NZ":"New Zealand","NU":"Niue","NR":"Nauru","NP":"Nepal","NO":"Norway","NL":"Netherlands","NI":"Nicaragua","NG":"Nigeria","NF":"Norfolk Island","NE":"Niger","NC":"New Caledonia","NA":"Namibia","MZ":"Mozambique","MY":"Malaysia","MX":"Mexico","MW":"Malawi","MV":"Maldives","MU":"Mauritius","MT":"Malta","MS":"Montserrat","MR":"Mauritania","MQ":"Martinique","MP":"Northern Mariana Islands","MO":"Macao","MN":"Mongolia","MM":"Myanmar [Burma]","ML":"Mali","MK":"Macedonia","MH":"Marshall Islands","MG":"Madagascar","MF":"Saint Martin","ME":"Montenegro","MD":"Moldova","MC":"Monaco","MA":"Morocco","LY":"Libya","LV":"Latvia","LU":"Luxembourg","LT":"Lithuania","LS":"Lesotho","LR":"Liberia","LK":"Sri Lanka","LI":"Liechtenstein","LC":"Saint Lucia","LB":"Lebanon","LA":"Laos","KZ":"Kazakhstan","KY":"Cayman Islands","KW":"Kuwait","KR":"South Korea","KP":"North Korea","KN":"Saint Kitts and Nevis","KM":"Comoros","KI":"Kiribati","KH":"Cambodia","KG":"Kyrgyzstan","KE":"Kenya","JP":"Japan","JO":"Jordan","JM":"Jamaica","JE":"Jersey","IT":"Italy","IS":"Iceland","IR":"Iran","IQ":"Iraq","IO":"British Indian Ocean Territory","IN":"India","IM":"Isle of Man","IL":"Israel","IE":"Ireland","ID":"Indonesia","HU":"Hungary","HT":"Haiti","HR":"Croatia","HN":"Honduras","HM":"Heard Island and McDonald Islands","HK":"Hong Kong","GY":"Guyana","GW":"Guinea-Bissau","GU":"Guam","GT":"Guatemala","GS":"South Georgia and the South Sandwich Islands","GR":"Greece","GQ":"Equatorial Guinea","GP":"Guadeloupe","GN":"Guinea","GM":"Gambia","GL":"Greenland","GI":"Gibraltar","GH":"Ghana","GG":"Guernsey","GF":"French Guiana","GE":"Georgia","GD":"Grenada","GB":"United Kingdom","GA":"Gabon","FR":"France","FO":"Faroe Islands","FM":"Micronesia","FK":"Falkland Islands","FJ":"Fiji","FI":"Finland","ET":"Ethiopia","ES":"Spain","ER":"Eritrea","EH":"Western Sahara","EG":"Egypt","EE":"Estonia","EC":"Ecuador","DZ":"Algeria","DO":"Dominican Republic","DM":"Dominica","DK":"Denmark","DJ":"Djibouti","DE":"Germany","CZ":"Czechia","CY":"Cyprus","CX":"Christmas Island","CW":"Curacao","CV":"Cape Verde","CU":"Cuba","CR":"Costa Rica","CO":"Colombia","CN":"China","CM":"Cameroon","CL":"Chile","CK":"Cook Islands","CI":"Ivory Coast","CH":"Switzerland","CG":"Republic of the Congo","CF":"Central African Republic","CD":"Democratic Republic of the Congo","CC":"Cocos [Keeling] Islands","CA":"Canada","BZ":"Belize","BY":"Belarus","BW":"Botswana","BV":"Bouvet Island","BT":"Bhutan","BS":"Bahamas","BR":"Brazil","BQ":"Bonaire","BO":"Bolivia","BN":"Brunei","BM":"Bermuda","BL":"Saint Barthélemy","BJ":"Benin","BI":"Burundi","BH":"Bahrain","BG":"Bulgaria","BF":"Burkina Faso","BE":"Belgium","BD":"Bangladesh","BB":"Barbados","BA":"Bosnia and Herzegovina","AZ":"Azerbaijan","AX":"Åland","AW":"Aruba","AU":"Australia","AT":"Austria","AS":"American Samoa","AR":"Argentina","AQ":"Antarctica","AO":"Angola","AM":"Armenia","AL":"Albania","AI":"Anguilla","AG":"Antigua and Barbuda","AF":"Afghanistan","AE":"United Arab Emirates","AD":"Andorra"};

function updateDatalist( $target, options )
{
	var list = $target.getAttribute( 'list' ),
		list_id = $target.id + '-options',
		$list,
		options_count = options.length,
		$opt;

	if ( list )
	{
		$list = document.getElementById( list_id );
	}
	else
	{
		$list = $datalist.cloneNode();
		$list.id = list_id;
		$body.appendChild( $list );
		$target.setAttribute( 'list', list_id );
	}

	$list.innerHTML = '';

	options.sort();
	options.reverse();
	while ( options_count-- )
	{
		$opt = $option.cloneNode();
		$opt.innerText = options[options_count];
		$list.appendChild($opt);
	}

	// release memory
	$opt = null;
	$list = null;
	$target = null;
}

function updateCountries()
{
	updateDatalist( $country, Object.keys( options ) );
}

function updateTown()
{
	var country = $country.value;
	if ( country != '' &&
		 country in options )
	{
		$city_state.value = options[country];
	}
}

function handleResponse()
{
	var response = JSON.parse(this.responseText),
		results = response.postalcodes,
		result_count = results.length,
		result,
		address_bits,
		address_bits_count,
		address_bit,
		long_name,
		country,
		town;

	// update the options
	options = {};

	// loop front to back
	results.reverse();
	while ( result_count-- )
	{
		console.log(results[result_count]);
		result = results[result_count];
		country = country_codes[ result.countryCode ] || result.countryCode;
		console.log(country);
		options[ country ] = result.adminName1 + ', ' + result.placeName;
	}
	console.log( options );
	updateCountries();
}

function lookupPostalCode()
{
	clearTimeout( throttling );
	throttling = null;
	
	var geocode_uri = 'http://api.geonames.org/postalCodeLookupJSON?formatted=true&username=aarongustafson&style=full&postalcode=',
		postal_code = $postal_code.value,
		XHR;
	
	if ( postal_code != '' )
	{
		XHR = new XMLHttpRequest();
		XHR.addEventListener( 'load', handleResponse );
		XHR.open( 'GET', geocode_uri + postal_code );
		XHR.send();
	}
}

function throttledLookupPostalCode()
{
	if ( throttling )
    {
		clearTimeout( throttling );
		throttling = null;
    }
	throttling = setTimeout( lookupPostalCode, throttle_sensitivity );
}

$postal_code.addEventListener( 'keyup', throttledLookupPostalCode, false );
$country.addEventListener( 'change', updateTown, false );
// Epilogue for all JavaScript in this folder
}(this,this.document));