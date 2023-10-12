// errorHandling.js

// This file contains a helper function that will set the state of an error based on the error received.
// Sample input: handleError(setError, setMessage, err)
// setError: A setter for useState that adjusts the variable from false to true. This makes it possible for the user to see the error message in the paragraph element on their page
// setMessage: A setter for useState that will change the message that is displayed to the user based on the error received
// err: The actual error message handled from the catch statement.

export const handleError = (setError, setMessage, err) => {
      const errorCode = err.code;
    
      switch (errorCode) {
        case "auth/email-already-in-use":
          setMessage("Email is already in use. Please choose another email.");
          break;
        case "auth/weak-password":
          setMessage("Password is too weak. Please choose a stronger password.");
          break;
        default:
          setMessage("An error occurred during registration. Please try again later.");
          break;
      }
    
      setError(true);
};