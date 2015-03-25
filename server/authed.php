<?
/**
 * 
**/

// Start session
session_start();

// Grab the redirect URL from the session
$redirect 	= $_SESSION['redirect'];

// This is the code from Spotify we use to auth against in node
$code 		= $_GET['code'];

// Kill the session
session_destroy();

// Send back to redirect held in session
header('Location: '. $redirect . '?code=' . $code);
?>