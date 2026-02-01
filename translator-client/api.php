<?php
header('Content-Type: application/json; charset=utf-8');

$text = trim($_POST['text'] ?? '');

if ($text === '') {
    echo json_encode(['error' => 'Le texte est vide']);
    exit;
}

$apiUrl = 'http://127.0.0.1:8080/api/translator/translate';
$username = 'admin';
$password = 'password';

$ch = curl_init($apiUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $text); // Envoi du texte brut
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: text/plain; charset=utf-8',
    'Authorization: Basic ' . base64_encode("$username:$password")
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

if ($response === false) {
    echo json_encode(['error' => "Erreur de connexion : $error"]);
} elseif ($httpCode !== 200) {
    echo json_encode(['error' => "Le service a répondu avec le code : $httpCode"]);
} else {
    echo json_encode([
        'success' => true,
        'translation' => trim($response)
    ], JSON_UNESCAPED_UNICODE);
}
?>