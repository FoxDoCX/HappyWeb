(() => {
  const EVENT_DATE = new Date("2026-10-04T17:00:00+03:00");

  const LINKS = {
    gift: "", // ссылка на сбор / QR
    rsvp: "", // внешняя форма регистрации
  };

  const EMAIL = ""; // email для RSVP через mailto

  /* Reveal on scroll */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Sticky nav */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-solid", window.scrollY > 48);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Countdown */
  const countdown = document.getElementById("countdown");
  if (countdown) {
    const daysEl = countdown.querySelector('[data-unit="days"]');
    const hoursEl = countdown.querySelector('[data-unit="hours"]');
    const minsEl = countdown.querySelector('[data-unit="mins"]');

    const tick = () => {
      const diff = EVENT_DATE.getTime() - Date.now();
      if (diff <= 0) {
        if (daysEl) daysEl.textContent = "0";
        if (hoursEl) hoursEl.textContent = "0";
        if (minsEl) minsEl.textContent = "0";
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (daysEl) daysEl.textContent = String(days);
      if (hoursEl) hoursEl.textContent = String(hours);
      if (minsEl) minsEl.textContent = String(mins);
    };

    tick();
    setInterval(tick, 30000);
  }

  /* Gifts */
  const giftLink = document.getElementById("gift-link");
  const amounts = document.querySelectorAll(".amount");
  let selectedAmount = "5000";

  amounts.forEach((el) => {
    if (el.dataset.amount === selectedAmount) el.classList.add("is-active");

    el.addEventListener("click", () => {
      selectedAmount = el.dataset.amount || selectedAmount;
      amounts.forEach((a) => a.classList.toggle("is-active", a === el));
    });
  });

  if (giftLink) {
    if (LINKS.gift) {
      giftLink.href = LINKS.gift;
    }

    giftLink.addEventListener("click", (e) => {
      if (!LINKS.gift) {
        e.preventDefault();
        alert("Добавьте ссылку на сбор в script.js → LINKS.gift");
        return;
      }
      try {
        const url = new URL(LINKS.gift, window.location.href);
        url.searchParams.set("amount", selectedAmount);
        giftLink.href = url.toString();
      } catch {
        /* keep base href */
      }
    });
  }

  /* RSVP */
  const rsvpExternal = document.getElementById("rsvp-external");
  const rsvpForm = document.getElementById("rsvp-form");
  const status = document.getElementById("form-status");

  if (LINKS.rsvp && rsvpExternal && rsvpForm) {
    rsvpExternal.hidden = false;
    rsvpExternal.href = LINKS.rsvp;
    rsvpForm.hidden = true;
  }

  function showStatus(message, type = "") {
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
    status.classList.toggle("is-error", type === "error");
    status.classList.toggle("is-success", type === "success");
  }

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(rsvpForm);
      const name = String(data.get("name") || "").trim();
      const answer = String(data.get("answer") || "");
      const note = String(data.get("note") || "").trim();

      if (!name) {
        showStatus("Пожалуйста, укажите имя.", "error");
        return;
      }

      const labels = {
        yes: "обязательно приду",
        maybe: "пока не уверена",
        no: "к сожалению, не смогу",
      };

      const subject = encodeURIComponent(`RSVP: день рождения Ирины — ${name}`);
      const body = encodeURIComponent(
        [
          `Имя: ${name}`,
          `Ответ: ${labels[answer] || answer}`,
          note ? `Комментарий: ${note}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      );

      if (EMAIL) {
        window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
        showStatus("Открываю почту для отправки ответа…", "success");
        return;
      }

      const stored = JSON.parse(localStorage.getItem("meyn-rsvp") || "[]");
      stored.push({ name, answer, note, at: new Date().toISOString() });
      localStorage.setItem("meyn-rsvp", JSON.stringify(stored));
      rsvpForm.reset();
      const yes = rsvpForm.querySelector('input[value="yes"]');
      if (yes) yes.checked = true;
      showStatus("Спасибо! Ваш ответ сохранён. До встречи в MEYN.", "success");
    });
  }
})();
