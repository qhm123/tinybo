<?php
$url = "";
$params = "";
if($_POST) {

  foreach($_POST as $key=>$value)
  {
    $params .= ($key . '=' . $value . '&');
  }
  rtrim($params, '&');

  $url = $_GET['url'];

  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_POST, 1);
  curl_setopt($curl, CURLOPT_POSTFIELDS, $params);
  $data = curl_exec($curl);
  echo $data;
  curl_close($curl);

} else {
  $url = $_GET['url'];

  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  $data = curl_exec($curl);
  echo $data;
  curl_close($curl);
}
?>
