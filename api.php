<?php
// api.php

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include config.php and prompt.php
require_once '/etc/secure-chat-credentials/config.php';
require_once '/etc/secure-chat-credentials/prompt.php';

// Get the origin of the request
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Check if the request origin is allowed
if (isOriginAllowed($requestOrigin)) {
    header("Access-Control-Allow-Origin: $requestOrigin");
} else {
    // If the origin is not allowed, deny the request
    http_response_code(403); // Forbidden
    echo json_encode(['error' => 'Origin not allowed']);
    exit;
}

// Allow CORS headers
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST requests are allowed']);
    exit;
}

// Get the raw input data
$input = json_decode(file_get_contents('php://input'), true);

// Validate the input
if (empty($input['message'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Message is required']);
    exit;
}

// Load the Gemini API key from config.php
$apiKey = GEMINI_API_KEY;
if (!$apiKey) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'API key not configured']);
    exit;
}

// Prepare the Gemini API request
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey;

// Include the AI instructions from prompt.php
$aiInstructions = $aiInstructions['content']; // Get the instructions from prompt.php

// Prepare the request payload
$data = [
    "contents" => [
        [
            "parts" => [
                ["text" => $aiInstructions], // Include the AI instructions
                ["text" => $input['message']] // Include the user's message
            ]
        ]
    ]
];

// Send the request to Gemini API
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Handle Gemini API response
if ($httpCode !== 200) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Failed to communicate with Gemini API', 'details' => $response]);
    exit;
}

// Decode the response
$responseData = json_decode($response, true);

// Check if the response contains valid data
if (empty($responseData['candidates'][0]['content']['parts'][0]['text'])) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Invalid response from Gemini API', 'details' => $responseData]);
    exit;
}

// Return the response
echo json_encode(['response' => $responseData['candidates'][0]['content']['parts'][0]['text']]);
?>