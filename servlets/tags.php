<?php
	
	if( isset($_GET["tags"]) ){
	    
	    header("Content-Type: text/html;charset=utf-8");

	    $servername = "127.0.0.1";
	    $dbname = "repubikl_001";
	    $username = "repub_crud_001";
	    $password = "yS4au?48";

	    $conn = new mysqli($servername, $username, $password, $dbname);
	    if ($conn->connect_error) {
	        die("Connection failed: " . $conn->connect_error);
	    }


	    $conn->query("SET NAMES 'utf8'");

	    $tags = explode(",", $_GET["tags"]);

	    foreach ($tags as $value) {

	    	$result = $conn->query("SELECT count FROM `tags` WHERE name='" . $value . "'");

	    	if( $result->num_rows > 0 ){

	    		while($row = $result->fetch_assoc()) {
					$count = intval($row) + 1;

	    			$conn->query("UPDATE `tags` SET count=" .$count. " WHERE name='" . $value . "'");
				}

	    	}else{
	    		$conn->query("INSERT INTO `tags` VALUES ('".$value."'',1)");
	    	}

	    }

	    $conn->close();
	}
    
?>
