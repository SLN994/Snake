<?php
header('Content-Type: application/json');

// Configura le informazioni del database qui
$db_host = '**********';
$db_username = '*****';
$db_password = '**********';
$db_name = '*********';

$conn = new mysqli($db_host, $db_username, $db_password, $db_name);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT username, score FROM scores ORDER BY score DESC LIMIT 10";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  $scores = [];
  while ($row = $result->fetch_assoc()) {
    array_push($scores, $row);
  }
  echo json_encode(["success" => true, "scores" => $scores]);
} else {
  echo json_encode(["success" => false, "message" => "Nessun punteggio trovato"]);
}

$conn->close();
?>
