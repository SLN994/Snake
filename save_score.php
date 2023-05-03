<?php
header('Content-Type: application/json');

// Configura le informazioni del database qui
$db_host = 'localhost:3306';
$db_username = 'slen';
$db_password = 'inlineskater94';
$db_name = 'admin_snake';

$conn = new mysqli($db_host, $db_username, $db_password, $db_name);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Leggi il corpo della richiesta e decodifica il JSON
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$username = $input['username'];
$score = $input['score'];

// Inserisci il punteggio nel database
$sql = "INSERT INTO scores (username, score) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $username, $score);

if ($stmt->execute()) {
  echo json_encode(["success" => true, "message" => "Punteggio salvato"]);
} else {
  echo json_encode(["success" => false, "message" => "Errore durante il salvataggio del punteggio"]);
}

$stmt->close();
$conn->close();
?>
