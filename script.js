/* Defina aqui o único telefone, em formato internacional (55 + DDD + número). */
const PHONE = "[DEFINIR: numero unico]";
const form = document.getElementById("quote-form");
const steps = [...document.querySelectorAll("[data-step]")];
const titles = [
  "Sua mudança",
  "Imóvel de origem",
  "Imóvel de destino",
  "Últimos detalhes",
];
const status = document.getElementById("form-status");
let current = 0;
document.getElementById("year").textContent = new Date().getFullYear();
document.querySelectorAll("[data-phone]").forEach((a) => {
  a.textContent = PHONE;
  a.href = "tel:" + PHONE;
});
const today = new Date();
document.getElementById("moving-date").min = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");
function values() {
  return [...form.querySelectorAll("[name]")].map((el) => [
    el.name,
    el.value.trim(),
  ]);
}
function message() {
  return (
    "Olá, Mudanças Menezes! Gostaria de um orçamento.\n\n" +
    values()
      .map(([key, value]) => {
        if (key === "Data pretendida" && value)
          value = value.split("-").reverse().join("/");
        return key + ": " + (value || "Não informado");
      })
      .join("\n")
  );
}
function updateSummary() {
  document.getElementById("summary").textContent = message();
}
function showStep(index, focus = true) {
  current = index;
  document.getElementById("error-summary").hidden = true;
  steps.forEach((step, i) => {
    step.hidden = i !== index;
    step.disabled = i !== index;
  });
  document.getElementById("progress").value = index + 1;
  document.getElementById("step-label").textContent =
    String(index + 1).padStart(2, "0") + " / 04 — " + titles[index];
  document.getElementById("back").hidden = index === 0;
  document.getElementById("next-label").textContent =
    index === 3 ? "Abrir pedido no WhatsApp" : "Continuar";
  status.textContent = "";
  updateSummary();
  if (focus) steps[index].querySelector("legend").focus();
}
const errorSummary = document.getElementById("error-summary");
const errorList = document.getElementById("error-list");
[...form.querySelectorAll("input[name],select[name]")].forEach((input, i) => {
  if (!input.id) input.id = "quote-field-" + i;
  const error = document.createElement("span");
  error.id = input.id + "-error";
  error.className = "field-error";
  error.hidden = true;
  input.parentElement.append(error);
  input.setAttribute(
    "aria-describedby",
    [input.getAttribute("aria-describedby"), error.id]
      .filter(Boolean)
      .join(" "),
  );
});
function fieldError(input) {
  if (input.required && !input.value.trim())
    return input.tagName === "SELECT"
      ? "Selecione uma opção."
      : "Preencha este campo.";
  if (input.name === "WhatsApp" && input.value) {
    const digits = input.value.replace(/\D/g, "");
    const international = input.value.trim().startsWith("+");
    if (
      international
        ? digits.length < 8 || digits.length > 15
        : digits.length < 10 || digits.length > 11
    )
      return "Informe o WhatsApp com DDD ou use + e o código do país.";
  }
  if (input.validity.rangeUnderflow) return "Escolha hoje ou uma data futura.";
  if (!input.validity.valid) return "Confira o valor informado.";
  return "";
}
function setFieldError(input, text) {
  const error = document.getElementById(input.id + "-error");
  error.textContent = text;
  error.hidden = !text;
  if (text) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}
function refreshErrorSummary() {
  errorList.replaceChildren();
  steps[current].querySelectorAll('[aria-invalid="true"]').forEach((input) => {
    const item = document.createElement("li"),
      link = document.createElement("a");
    link.href = "#" + input.id;
    link.textContent =
      input.name +
      ": " +
      document.getElementById(input.id + "-error").textContent;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      input.focus();
    });
    item.append(link);
    errorList.append(item);
  });
  errorSummary.hidden = errorList.children.length === 0;
}
function validate() {
  const fields = [...steps[current].querySelectorAll("input,select")];
  fields.forEach((input) => {
    input.setCustomValidity("");
    setFieldError(input, fieldError(input));
  });
  refreshErrorSummary();
  if (!errorSummary.hidden) {
    errorSummary.focus();
    return false;
  }
  return true;
}
form.addEventListener("input", (event) => {
  const input = event.target;
  if (input.getAttribute("aria-invalid") === "true") {
    input.setCustomValidity("");
    setFieldError(input, fieldError(input));
    refreshErrorSummary();
  }
});
document.querySelectorAll(".mobile-navigation a").forEach((link) =>
  link.addEventListener("click", () => {
    document.querySelector(".mobile-navigation").open = false;
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }),
);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validate()) return;
  if (current < 3) {
    showStep(current + 1);
    return;
  }
  const text = message();
  const url = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text);
  document.getElementById("whatsapp-link").href = url;
  document.getElementById("message").value = text;
  document.getElementById("message-wrap").hidden = false;
  status.textContent = PHONE.startsWith("[DEFINIR:")
    ? "Mensagem preparada. Nesta versão, o número da empresa ainda precisa ser definido para receber o pedido."
    : "Mensagem preparada. Confirme o envio na conversa do WhatsApp.";
  const ready = /^[1-9]\d{7,14}$/.test(PHONE);
  const link = document.getElementById("whatsapp-link");
  link.hidden = !ready;
  if (!ready) {
    status.textContent =
      "Seu pedido está preparado, mas o WhatsApp da empresa ainda não foi configurado. Você pode copiar a mensagem abaixo.";
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
});
form.addEventListener("input", (event) => {
  if (event.target.setCustomValidity) event.target.setCustomValidity("");
  updateSummary();
  document.getElementById("message-wrap").hidden = true;
});
form.addEventListener("change", updateSummary);
document
  .getElementById("back")
  .addEventListener("click", () => showStep(current - 1));
function preset(type) {
  form.elements.namedItem("Tipo").value = type;
  showStep(0, false);
}
document
  .getElementById("choose-shared")
  .addEventListener("click", () => preset("Compartilhada"));
document
  .querySelectorAll(".service-quote")
  .forEach((a) => a.addEventListener("click", () => preset(a.dataset.type)));
document.getElementById("choose-hoist").addEventListener("click", () => {
  form.elements.namedItem("Içamento").value = "Sim";
  showStep(0, false);
});
showStep(0, false);
