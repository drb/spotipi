<?php

// Start session
session_start();

// Unset all of the session variables
$_SESSION 				= array();

// Redirect after auth (back to local app)
$redirect 				= $_GET['redirect'];

// Set redirect in the 
$_SESSION['redirect'] 	= $redirect;

// API path root
$spotify_api_root 		= 'https://accounts.spotify.com/authorize?';

// Spotify app credentials
$client_id 				= "client_id";

// The current server
$server 				= 'http://spotipi.pacosystems.com/authed';

// API request params
$qs = array(
	'client_id' 		=> $client_id,
	'redirect_uri' 		=> $server,
	'response_type' 	=> 'code',
	'state' 			=> 'not_used',
	//'scopes' 			=> implode(array(), ' '),
	'show_dialog' 		=> 'false'
);

// Convert request into querystring
$spotify_api_root .= http_build_query($qs);

// send off to Spotify to get some credentials
header("Location: " . $spotify_api_root);
?>