function registrationFormValidation(){

    var emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (document.registerForm.email.value == ""){
        alert("You need an Email");
        document.registerForm.email.value = "";
        return false;
    }
    else if (document.registerForm.email.value.length > 256){
        alert("Email format no valid");
        document.registerForm.email.value = "";
        return false;
    }
    else if (! (document.registerForm.email.value.match(emailFormat))){
        alert("Email format no valid");
        document.registerForm.email.value = "";
        return false;
    }
    else if (document.registerForm.psw.value == ""){
        alert("You need a password");
        document.registerForm.psw.value == "";
        document.registerForm.pswRepeat.value == "";
        return false;
    }
    else if (document.registerForm.psw.value != document.registerForm.pswRepeat.value){
        alert("Password and Re-password doesn't match");
        document.registerForm.psw.value == "";
        document.registerForm.pswRepeat.value == "";
        return false;
    }
    else{
            return true;
    }
}