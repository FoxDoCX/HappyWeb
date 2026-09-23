(() => {
  const EVENT_DATE = new Date("2026-10-04T17:00:00+03:00");

  const LINKS = {
    rsvp: "", // внешняя форма регистрации (если нужна)
  };

  const EMAIL = "iriska.g10@yandex.ru";

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

  /* Gifts — ссылка задана в HTML */

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
    rsvpForm.addEventListener("submit", async (e) => {
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
        yes: "Обязательно приду",
        maybe: "Пока не уверена",
        no: "К сожалению, не смогу",
      };

      const submitBtn = rsvpForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправляю…";
      }
      showStatus("Отправляю ответ…");

      const payload = {
        _subject: `RSVP: день рождения Ирины — ${name}`,
        _template: "table",
        _captcha: "false",
        Имя: name,
        Ответ: labels[answer] || answer,
        Комментарий: note || "—",
        Страница: window.location.href,
        Время: new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }),
      };

      try {
        const res = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        rsvpForm.reset();
        const yes = rsvpForm.querySelector('input[value="yes"]');
        if (yes) yes.checked = true;
        showStatus("Спасибо! Ответ отправлен. До встречи в MEYN.", "success");
      } catch {
        showStatus(
          "Не удалось отправить. Проверьте интернет или напишите напрямую: " + EMAIL,
          "error"
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Отправить ответ";
        }
      }
    });
  }
})();
