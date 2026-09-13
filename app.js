// ============================================================
// NDI WEBSITE - MAIN JAVASCRIPT
// ============================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  set,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import {
  firebaseConfig
} from "./firebase-config.js";


// ============================================================
// FIREBASE INITIALIZATION
// ============================================================

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


// ============================================================
// DOM ELEMENTS
// ============================================================

const menuBtn = document.getElementById("menuBtn");
const siteNav = document.getElementById("siteNav");

const contactForm = document.getElementById("contactForm");
const newsletterForm = document.getElementById("newsletterForm");

const submitBtn = document.getElementById("submitBtn");

const toast = document.getElementById("toast");

const yearElement = document.getElementById("year");


// ============================================================
// CURRENT YEAR
// ============================================================

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


// ============================================================
// MOBILE MENU
// ============================================================

if (menuBtn && siteNav) {

  menuBtn.addEventListener("click", () => {

    const isOpen = siteNav.classList.toggle("open");

    menuBtn.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuBtn.setAttribute(
      "aria-label",
      isOpen ? "Close menu" : "Open menu"
    );

  });


  // Close menu when a navigation link is clicked

  siteNav.querySelectorAll("a").forEach((link) => {

    link.addEventListener("click", () => {

      siteNav.classList.remove("open");

      menuBtn.setAttribute(
        "aria-expanded",
        "false"
      );

      menuBtn.setAttribute(
        "aria-label",
        "Open menu"
      );

    });

  });

}


// ============================================================
// SMOOTH SCROLL
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach((link) => {

  link.addEventListener("click", (event) => {

    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  });

});


// ============================================================
// TOAST MESSAGE
// ============================================================

let toastTimer = null;

function showToast(message, type = "success") {

  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;

  toast.className = "toast";

  toast.classList.add(type);

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 4500);

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ============================================================
// BASIC EMAIL VALIDATION
// ============================================================

function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email).trim()
  );

}


// ============================================================
// CONTACT FORM
// ============================================================

if (contactForm) {

  contactForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    // --------------------------------------------------------
    // HONEYPOT
    // --------------------------------------------------------

    const honeypot =
      contactForm.elements.website?.value?.trim();

    if (honeypot) {

      // Pretend submission succeeded.
      // This prevents simple bots from learning
      // that they were blocked.

      contactForm.reset();

      showToast(
        "Thank you. Your enquiry has been received.",
        "success"
      );

      return;
    }


    // --------------------------------------------------------
    // READ FORM DATA
    // --------------------------------------------------------

    const formData = new FormData(contactForm);

    const name =
      String(formData.get("name") || "").trim();

    const email =
      String(formData.get("email") || "").trim();

    const phone =
      String(formData.get("phone") || "").trim();

    const organisation =
      String(formData.get("organisation") || "").trim();

    const interest =
      String(formData.get("interest") || "").trim();

    const message =
      String(formData.get("message") || "").trim();


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (name.length < 2) {

      showToast(
        "Please enter your full name.",
        "error"
      );

      return;
    }


    if (!isValidEmail(email)) {

      showToast(
        "Please enter a valid email address.",
        "error"
      );

      return;
    }


    if (!interest) {

      showToast(
        "Please select what you need help with.",
        "error"
      );

      return;
    }


    if (message.length < 10) {

      showToast(
        "Please provide a little more information.",
        "error"
      );

      return;
    }


    // --------------------------------------------------------
    // DISABLE BUTTON
    // --------------------------------------------------------

    const originalButtonHTML =
      submitBtn?.innerHTML || "Send enquiry";


    if (submitBtn) {

      submitBtn.disabled = true;

      submitBtn.innerHTML =
        "Sending…";

    }


    try {

      // ------------------------------------------------------
      // CREATE NEW DATABASE RECORD
      // ------------------------------------------------------

      const messageRef =
        push(ref(db, "contactMessages"));


      await set(messageRef, {

        name: escapeHtml(name),

        email: email,

        phone: escapeHtml(phone),

        organisation:
          escapeHtml(organisation),

        interest:
          escapeHtml(interest),

        message:
          escapeHtml(message),

        status: "new",

        createdAt:
          serverTimestamp()

      });


      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      contactForm.reset();


      showToast(
        "Thank you! Your enquiry has been sent successfully.",
        "success"
      );


    } catch (error) {

      console.error(
        "Contact form error:",
        error
      );


      showToast(
        "We couldn't send your enquiry. Please try again.",
        "error"
      );


    } finally {

      if (submitBtn) {

        submitBtn.disabled = false;

        submitBtn.innerHTML =
          originalButtonHTML;

      }

    }

  });

}


// ============================================================
// NEWSLETTER FORM
// ============================================================

if (newsletterForm) {

  newsletterForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const formData =
        new FormData(newsletterForm);


      const email =
        String(formData.get("email") || "")
          .trim()
          .toLowerCase();


      // ------------------------------------------------------
      // VALIDATE EMAIL
      // ------------------------------------------------------

      if (!isValidEmail(email)) {

        showToast(
          "Please enter a valid email address.",
          "error"
        );

        return;
      }


      const button =
        newsletterForm.querySelector(
          "button[type='submit']"
        );


      const originalText =
        button?.textContent ||
        "Subscribe";


      if (button) {

        button.disabled = true;

        button.textContent =
          "Saving…";

      }


      try {

        // ----------------------------------------------------
        // SAVE SUBSCRIBER
        // ----------------------------------------------------

        const subscriberRef =
          push(ref(db, "newsletter"));


        await set(subscriberRef, {

          email: email,

          subscribedAt:
            serverTimestamp(),

          source:
            "website"

        });


        newsletterForm.reset();


        showToast(
          "You're subscribed! Thank you for joining NDI.",
          "success"
        );


      } catch (error) {

        console.error(
          "Newsletter error:",
          error
        );


        showToast(
          "We couldn't complete your subscription. Please try again.",
          "error"
        );


      } finally {

        if (button) {

          button.disabled = false;

          button.textContent =
            originalText;

        }

      }

    }
  );

}


// ============================================================
// PREVENT DOUBLE SUBMISSIONS
// ============================================================

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter" &&
      event.target.tagName === "TEXTAREA"
    ) {
      return;
    }

  }
);


// ============================================================
// FIREBASE ERROR HELPER
// ============================================================

window.ndiFirebaseError = function(error) {

  console.error(error);

  if (!error) {
    return "An unknown error occurred.";
  }

  switch (error.code) {

    case "PERMISSION_DENIED":

      return (
        "Firebase denied this request. " +
        "Please check your Realtime Database Rules."
      );


    case "NETWORK_ERROR":

      return (
        "Network error. Please check your internet connection."
      );


    case "INVALID_ARGUMENT":

      return (
        "The information sent to Firebase was invalid."
      );


    default:

      return (
        error.message ||
        "Something went wrong."
      );

  }

};


// ============================================================
// PAGE READY
// ============================================================

console.log(
  "NDI website loaded successfully."
);
