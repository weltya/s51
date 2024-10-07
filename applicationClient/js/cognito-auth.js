var Project = window.Project || {};

(function scopeWrapper($) {
  var signinUrl = "/index.html";

  var poolData = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.userPoolClientId,
  };

  var userPool;

  if (
    !(
      _config.cognito.userPoolId &&
      _config.cognito.userPoolClientId &&
      _config.cognito.region
    )
  ) {
    $("#noCognitoMessage").show();
    return;
  }

  userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  if (typeof AWSCognito !== "undefined") {
    AWSCognito.config.region = _config.cognito.region;
  }

  signOut = function signOut() {
    var currentUser = userPool.getCurrentUser();
    if (currentUser != null) {
      currentUser.signOut();
      window.location.href = "index.html";
    } else {
      console.log("No user is currently signed in.");
    }
  };

  Project.authToken = new Promise(function fetchCurrentAuthToken(
    resolve,
    reject
  ) {
    var cognitoUser = userPool.getCurrentUser();
    var jwtToken = "";

    if (cognitoUser) {
      cognitoUser.getSession(function sessionCallback(err, session) {
        if (err) {
          reject(err);
        } else if (!session.isValid()) {
          resolve(null);
        } else {
          resolve(session.getIdToken().getJwtToken());
          jwtToken = session.getIdToken().getJwtToken();
          localStorage.setItem("jwtToken", jwtToken);
        }
      });
    } else {
      resolve(null);
    }
  });

  function register(email, password, name, phoneNumber, onSuccess, onFailure) {
    console.log("Type of onSuccess:", typeof onSuccess);
    console.log("Type of onFailure:", typeof onFailure);

    var dataEmail = {
      Name: "email",
      Value: email,
    };

    var dataName = {
      Name: "name",
      Value: name,
    };

    var dataPhoneNumber = {
      Name: "phone_number",
      Value: phoneNumber,
    };

    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataEmail
    );
    var attributeName = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataName
    );
    var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataPhoneNumber
    );

    if (typeof onSuccess !== "function") {
      console.error("onSuccess is not a function");
      return;
    }
    if (typeof onFailure !== "function") {
      console.error("onFailure is not a function");
      return;
    }

    userPool.signUp(
      toUsername(email),
      password,
      [attributeEmail, attributeName, attributePhoneNumber],
      null,
      function signUpCallback(err, result) {
        console.log("Sign-up callback executed");

        if (err) {
          console.error("Sign-up error:", err);
          if (typeof onFailure === "function") {
            onFailure(err);
          } else {
            console.error("onFailure is not a function during signUpCallback");
          }
        } else {
          console.log("Sign-up success:", result);
          if (typeof onSuccess === "function") {
            onSuccess(result);
          } else {
            console.error("onSuccess is not a function during signUpCallback");
          }
        }
      }
    );
  }

  function handleRegister(event) {
    event.preventDefault();

    var email = $("#emailInputRegister").val();
    var password = $("#passwordInputRegister").val();
    var password2 = $("#password2InputRegister").val();
    var name = $("#nameInputRegister").val();
    var phoneNumber = $("#phoneInputRegister").val();

    if (!email || !password || !name || !phoneNumber) {
      alert("All fields are required.");
      return;
    }

    console.log("Register button clicked");
    console.log(
      "Values - Email:",
      email,
      "Name:",
      name,
      "Phone Number:",
      phoneNumber
    );

    if (password !== password2) {
      alert("Passwords do not match");
      return;
    }

    var onSuccess = function registerSuccess(result) {
      var cognitoUser = result.user;
      console.log("User name is " + cognitoUser.getUsername());
      var confirmation =
        "Registration successful. Please check your email inbox or spam folder for your verification code.";
      if (confirmation) {
        window.location.href = "verify.html";
      }
    };

    var onFailure = function registerFailure(err) {
      console.error("Registration failed:", err);
      alert(
        "Error during registration: " + (err.message || JSON.stringify(err))
      );
    };

    console.log("Type of onSuccess before register:", typeof onSuccess);
    console.log("Type of onFailure before register:", typeof onFailure);

    register(email, password, name, phoneNumber, onSuccess, onFailure);
  }

  function signin(email, password, onSuccess, onFailure) {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      {
        Username: toUsername(email),
        Password: password,
      }
    );

    var cognitoUser = createCognitoUser(email);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: onSuccess,
      onFailure: onFailure,
    });
  }

  function verify(email, code, onSuccess, onFailure) {
    createCognitoUser(email).confirmRegistration(
      code,
      true,
      function confirmCallback(err, result) {
        if (!err) {
          onSuccess(result);
        } else {
          onFailure(err);
        }
      }
    );
  }

  function createCognitoUser(email) {
    return new AmazonCognitoIdentity.CognitoUser({
      Username: toUsername(email),
      Pool: userPool,
    });
  }

  function toUsername(email) {
    return email;
  }

  $(function onDocReady() {
    $("#signinForm").submit(handleSignin);
    $("#registrationForm").submit(handleRegister);
    $("#verifyForm").submit(handleVerify);
  });

  function handleSignin(event) {
    var email = $("#emailInputSignin").val();
    var password = $("#passwordInputSignin").val();
    event.preventDefault();
    signin(
      email,
      password,
      function signinSuccess() {
        console.log("Successfully Logged In");
        window.location.href = "main.html";
      },
      function signinError(err) {
        alert(err);
      }
    );
  }

  function handleVerify(event) {
    var email = $("#emailInputVerify").val();
    var code = $("#codeInputVerify").val();
    event.preventDefault();
    verify(
      email,
      code,
      function verifySuccess(result) {
        console.log("call result: " + result);
        console.log("Successfully verified");
        alert(
          "Verification successful. You will now be redirected to the login page."
        );
        window.location.href = signinUrl;
      },
      function verifyError(err) {
        alert(err);
      }
    );
  }
})(jQuery);
