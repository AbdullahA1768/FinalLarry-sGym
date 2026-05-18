// ============================================================
//  Larry's Gym - Form Validation
//  validation.js
//
//  Handles all the checking for the membership registration
//  form. Nothing gets submitted unless it passes every single
//  test below. Larry has standards, and so does this form.
// ============================================================

// Wait for the page to fully load before we do anything
document.addEventListener("DOMContentLoaded", function () {

  // Grab the form and the elements we'll need to interact with
  const form         = document.getElementById("registration-form");
  const errorBanner  = document.getElementById("form-errors");
  const errorList    = document.getElementById("error-list");
  const successMsg   = document.getElementById("form-success");

  // If the form does not exist on this page, bail out early
  if (!form) return;

  // ---- Listen for form submission ----
  form.addEventListener("submit", function (event) {
    // Stop the browser from actually navigating anywhere
    event.preventDefault();

    // Run all the checks and collect any problems
    const errors = validateAll();

    if (errors.length === 0) {
      // Everything looks good! Show the success message
      showSuccess();
    } else {
      // Something's wrong - show the error banner and highlight the bad fields
      showErrors(errors);
    }
  });


  // ============================================================
  //  validateAll()
  //  Runs every field through its check function and returns
  //  an array of error message strings. An empty array means
  //  the form is good to go.
  // ============================================================
  function validateAll() {

    // We'll collect all our error messages in this array
    var errorMessages = [];

    // Clear any leftover errors from a previous submit attempt
    clearAllErrors();

    // ---- Pull the current values out of the form fields ----
    var fullName       = document.getElementById("full-name").value.trim();
    var age            = document.getElementById("age").value.trim();
    var email          = document.getElementById("email").value.trim();
    var phone          = document.getElementById("phone").value.trim();
    var membershipType = document.getElementById("membership-type").value;
    var fitnessGoals   = document.getElementById("fitness-goals").value.trim();
    var experience     = document.getElementById("experience").value;
    var heardAbout     = document.getElementById("heard-about").value;

    // ---- Store fields in an array so we can loop over them
    //      and catch empty ones all at once ----
    var requiredFields = [
      { value: fullName,       id: "full-name",       label: "Full Name"          },
      { value: age,            id: "age",             label: "Age"                },
      { value: email,          id: "email",           label: "Email Address"      },
      { value: phone,          id: "phone",           label: "Phone Number"       },
      { value: membershipType, id: "membership-type", label: "Membership Type"    },
      { value: fitnessGoals,   id: "fitness-goals",   label: "Fitness Goals"      },
      { value: experience,     id: "experience",      label: "Experience Level"   },
      { value: heardAbout,     id: "heard-about",     label: "How You Heard About Us" },
    ];

    // Loop through every required field and flag any that are empty
    for (var i = 0; i < requiredFields.length; i++) {
      var field = requiredFields[i];

      if (field.value === "" || field.value === null) {
        showFieldError(field.id, field.label + " is required!");
        errorMessages.push(field.label + " can't be left empty.");
      }
    }

    // ---- Individual field validation (beyond just "is it filled in?") ----

    // Full name - must have at least a first and last name (two words)
    if (fullName !== "") {
      var nameParts = fullName.split(" ");
      if (nameParts.length < 2 || nameParts[1] === "") {
        showFieldError("full-name", "Please enter your full name - first and last.");
        errorMessages.push("Full Name must include first and last name.");
      }
    }

    // Age - must be a real number between 13 and 120
    if (age !== "") {
      var ageNumber = parseInt(age, 10);

      if (isNaN(ageNumber)) {
        // Not a number at all
        showFieldError("age", "Age has to be a number, not a word.");
        errorMessages.push("Age must be a valid number.");

      } else if (ageNumber < 13) {
        // Too young - gym policy
        showFieldError("age", "You must be at least 13 to join Larry's Gym.");
        errorMessages.push("Members must be at least 13 years old.");

      } else if (ageNumber > 120) {
        // Suspiciously old - even for Bikini Bottom
        showFieldError("age", "That age looks a little off. Are you sure? 👀");
        errorMessages.push("Please enter a realistic age (under 120).");
      }
    }

    // Email - check it matches the standard user@domain.ext pattern
    if (email !== "") {
      // This regex covers the basics: something @ something . something
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        showFieldError("email", "That does not look like a valid email address.");
        errorMessages.push("Email address must be in a valid format (e.g. name@domain.com).");
      }
    }

    // Phone - accept common US formats: (555) 867-5309, 555-867-5309, 5558675309, etc.
    if (phone !== "") {
      // Strip everything except digits so we can count them
      var digitsOnly = phone.replace(/\D/g, "");

      if (digitsOnly.length < 10 || digitsOnly.length > 11) {
        showFieldError("phone", "Phone number should have 10 digits (or 11 with country code).");
        errorMessages.push("Phone number must contain 10 digits.");
      }
    }

    // Fitness goals - needs at least 20 characters so it's actually meaningful
    if (fitnessGoals !== "" && fitnessGoals.length < 20) {
      showFieldError("fitness-goals", "Give us a little more detail - Larry loves hearing your goals!");
      errorMessages.push("Fitness Goals should be at least 20 characters.");
    }

    // Return the full list of problems (empty = all good!)
    return errorMessages;
  }


  // ============================================================
  //  showFieldError(fieldId, message)
  //  Lights up a specific field's error label with a message.
  // ============================================================
  function showFieldError(fieldId, message) {
    var errorSpan = document.getElementById("error-" + fieldId);
    var inputEl   = document.getElementById(fieldId);

    if (errorSpan) {
      errorSpan.textContent = "🐠 " + message;
      errorSpan.classList.add("show");
    }

    // Also highlight the input itself with a red border
    if (inputEl) {
      inputEl.style.borderColor = "rgba(231, 76, 60, 0.7)";
      inputEl.style.boxShadow   = "0 0 16px rgba(231, 76, 60, 0.2)";
    }
  }


  // ============================================================
  //  clearAllErrors()
  //  Resets every field back to its normal look before we
  //  run validation again on a new submit attempt.
  // ============================================================
  function clearAllErrors() {
    // Hide the top-level error banner
    errorBanner.classList.remove("show");
    errorList.innerHTML = "";

    // Find every error span on the page and hide it
    var allErrors = document.querySelectorAll(".field-error");
    for (var i = 0; i < allErrors.length; i++) {
      allErrors[i].classList.remove("show");
      allErrors[i].textContent = "";
    }

    // Reset the border color on all inputs/selects/textareas
    var allInputs = form.querySelectorAll("input, select, textarea");
    for (var j = 0; j < allInputs.length; j++) {
      allInputs[j].style.borderColor = "";
      allInputs[j].style.boxShadow   = "";
    }
  }


  // ============================================================
  //  showErrors(errorsArray)
  //  Populates and displays the error summary banner at the
  //  top of the form, then scrolls the user up to see it.
  // ============================================================
  function showErrors(errorsArray) {
    // Build a list item for each unique error message
    errorList.innerHTML = "";

    for (var i = 0; i < errorsArray.length; i++) {
      // Skip duplicate messages if two checks caught the same field
      var alreadyListed = false;
      var existingItems = errorList.querySelectorAll("li");

      for (var j = 0; j < existingItems.length; j++) {
        if (existingItems[j].textContent === errorsArray[i]) {
          alreadyListed = true;
          break;
        }
      }

      if (!alreadyListed) {
        var li = document.createElement("li");
        li.textContent = errorsArray[i];
        errorList.appendChild(li);
      }
    }

    // Show the banner
    errorBanner.classList.add("show");

    // Scroll smoothly up to the banner so they see what's wrong
    errorBanner.scrollIntoView({ behavior: "smooth", block: "start" });
  }


  // ============================================================
  //  showSuccess()
  //  Hides the form and shows the big friendly success message.
  //  Larry is very proud of this moment.
  // ============================================================
  function showSuccess() {
    // Hide the form itself
    form.style.display = "none";

    // Also hide any lingering error banner
    errorBanner.classList.remove("show");

    // Reveal the success message
    successMsg.classList.add("show");

    // Scroll up so the user sees it
    successMsg.scrollIntoView({ behavior: "smooth", block: "center" });
  }


  // ============================================================
  //  Live field clearing - as soon as someone starts fixing
  //  a field that had an error, clear that field's error message
  //  so it does not feel like we're nagging them.
  // ============================================================
  var allInputs = form.querySelectorAll("input, select, textarea");

  for (var i = 0; i < allInputs.length; i++) {
    allInputs[i].addEventListener("input", function () {
      // Clear just this field's error (not the whole form)
      var errorSpan = document.getElementById("error-" + this.id);
      if (errorSpan) {
        errorSpan.classList.remove("show");
        errorSpan.textContent = "";
      }
      this.style.borderColor = "";
      this.style.boxShadow   = "";
    });
  }

}); // end DOMContentLoaded
