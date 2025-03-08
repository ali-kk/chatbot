<?php
// config.php

// Define the Gemini API key
define('GEMINI_API_KEY', 'AIzaSyCDAGIEM5qPtwmojfRvH41nJKghLOlQ-Cs');

// Define allowed origins (both production and local development)
define('ALLOWED_ORIGINS', [
    'https://my-uni-.xyz', // Your production domain
    'http://localhost',    // Local development
    'http://127.0.0.1'     // Alternative local development
]);

// Function to check if the request origin is allowed
function isOriginAllowed($origin) {
    return in_array($origin, ALLOWED_ORIGINS);
}
?>