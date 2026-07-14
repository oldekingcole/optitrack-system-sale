(() => {
  "use strict";

  const config = window.OPTITRACK_SALE_CONFIG || {};
  const apiBaseUrl = String(config.apiBaseUrl || "").replace(/\/$/, "");
  const salesEmail = String(config.salesEmail || "").trim();
  const turnstileRequired = config.turnstileRequired !== false;
  let turnstileToken = "";
  let turnstileWidgetId = null;

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  navToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    nav.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  }));

  document.querySelector("#year").textContent = `© ${new Date().getFullYear()}`;

  const copyEmail = document.querySelector("#copyEmail");
  const emailContact = document.querySelector("#emailContact");
  if (copyEmail && salesEmail) {
    emailContact?.removeAttribute("hidden");
    copyEmail.textContent = salesEmail;
    copyEmail.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(salesEmail);
        const original = copyEmail.textContent;
        copyEmail.textContent = "Email copied";
        setTimeout(() => { copyEmail.textContent = original; }, 1800);
      } catch {
        window.location.href = `mailto:${salesEmail}`;
      }
    });
  } else emailContact?.setAttribute("hidden", "");

  // Replace photo placeholders automatically when approved files exist.
  document.querySelectorAll("[data-photo]").forEach((frame) => {
    const src = frame.dataset.photo;
    const image = new Image();
    image.alt = frame.querySelector("[role=img]")?.getAttribute("aria-label") || "OptiTrack system equipment";
    image.loading = frame.classList.contains("hero-media") ? "eager" : "lazy";
    image.addEventListener("load", () => frame.replaceChildren(image));
    image.src = src;
  });

  const form = document.querySelector("#inquiryForm");
  const submitButton = document.querySelector("#submitButton");
  const statusBox = document.querySelector("#formStatus");
  const startedAt = document.querySelector("#startedAt");
  const referrer = document.querySelector("#referrer");
  startedAt.value = String(Date.now());
  referrer.value = document.referrer || "direct";

  const params = new URLSearchParams(location.search);
  document.querySelector("#utmSource").value = params.get("utm_source") || "";
  document.querySelector("#utmMedium").value = params.get("utm_medium") || "";
  document.querySelector("#utmCampaign").value = params.get("utm_campaign") || "";

  const setStatus = (message, type = "info") => {
    statusBox.textContent = message;
    statusBox.className = `form-status visible ${type}`;
  };

  const clearFieldErrors = () => {
    form?.querySelectorAll("[aria-invalid='true']").forEach((field) => {
      field.removeAttribute("aria-invalid");
      field.style.removeProperty("border-color");
      field.style.removeProperty("outline");
      field.setCustomValidity?.("");
    });
  };

  const showFieldErrors = (errors) => {
    const messages = [];
    let firstField = null;
    for (const [name, message] of Object.entries(errors || {})) {
      messages.push(message);
      const field = form?.elements.namedItem(name);
      if (!field || typeof field.setAttribute !== "function") continue;
      field.setAttribute("aria-invalid", "true");
      field.style.borderColor = "#b42318";
      field.style.outline = "3px solid rgba(180,35,24,.16)";
      field.setCustomValidity?.(message);
      firstField ||= field;
    }
    firstField?.focus();
    setStatus(messages.join(" "), "error");
  };

  const setSubmitting = (submitting) => {
    submitButton.disabled = submitting;
    submitButton.textContent = submitting ? "Submitting…" : "Submit inquiry";
  };

  const loadTurnstile = () => {
    const siteKey = String(config.turnstileSiteKey || "").trim();
    if (!siteKey) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      turnstileWidgetId = window.turnstile.render("#turnstileMount", {
        sitekey: siteKey,
        action: "sales_inquiry",
        callback: (token) => { turnstileToken = token; },
        "expired-callback": () => { turnstileToken = ""; },
        "error-callback": () => { turnstileToken = ""; setStatus("Verification could not load. Please refresh and try again.", "error"); }
      });
    };
    document.head.appendChild(script);
  };
  loadTurnstile();

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusBox.className = "form-status";
    clearFieldErrors();

    if (!form.reportValidity()) return;
    if (!apiBaseUrl) {
      setStatus("The inquiry backend is not configured yet. Please try again later.", "error");
      return;
    }
    if (turnstileRequired && !turnstileToken) {
      setStatus("Please complete the verification before submitting.", "error");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.turnstileToken = turnstileToken;
    data.pageUrl = location.href;
    data.userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

    setSubmitting(true);
    setStatus("Submitting your inquiry securely…", "info");

    try {
      const response = await fetch(`${apiBaseUrl}/api/inquiries`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (payload.errors) {
          showFieldErrors(payload.errors);
          return;
        }
        throw new Error(payload.message || "The inquiry could not be submitted.");
      }

      form.reset();
      startedAt.value = String(Date.now());
      referrer.value = document.referrer || "direct";
      turnstileToken = "";
      if (turnstileWidgetId !== null && window.turnstile) window.turnstile.reset(turnstileWidgetId);
      setStatus(`Thank you. Your inquiry reference is ${payload.reference}. A seller representative will review it.`, "success");
    } catch (error) {
      setStatus(`${error.message}${salesEmail ? ` You may also email ${salesEmail}.` : ""}`, "error");
    } finally {
      setSubmitting(false);
    }
  });
  form?.addEventListener("input", clearFieldErrors);
  form?.addEventListener("change", clearFieldErrors);
})();
