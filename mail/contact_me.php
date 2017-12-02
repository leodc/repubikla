<?php

    $correo = 'comments@repubikla.org';

    if( isset($_POST['email']) ){
        if(empty($_POST['name']) || empty($_POST['email']) || empty($_POST['message']) ){
            echo "No arguments Provided!";
            return false;
        }

        $name = $_POST['name'];
        $email_address = $_POST['email'];
        $message = $_POST['message'];


        $to = $correo; 
        $email_subject = "Repubikla, comentario de:  $name";
        $email_body = "Name: $name\n\nEmail: $email_address\n\nMessage:\n$message";
        $headers = "From: noreply@repubikla.org\n"; 
        $headers .= "Reply-To: $email_address";	
        mail($to,$email_subject,$email_body,$headers);

        return true;
    }else{
        if(empty($_POST['name']) || empty($_POST['message']) ){
            echo "No arguments Provided!";
            return false;
        }

        $name = $_POST['name'];
        $message = $_POST['message'];

        $to = $correo; 
        $email_subject = "Repubikla, comentario de:  $name";
        $email_body = "Name: $name\n\nMessage:\n$message";
        $headers = "From: noreply@repubikla.org\n";
        mail($to,$email_subject,$email_body,$headers);

        return true;
    }
?>