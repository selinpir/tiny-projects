// 1. HTML elemanlarına erişiyoruz.
const form = document.querySelector("#password-form");
const lengthInput = document.querySelector("#length");
const lowercaseInput = document.querySelector("#lowercase");
const uppercaseInput = document.querySelector("#uppercase");
const numbersInput = document.querySelector("#numbers");
const symbolsInput = document.querySelector("#symbols");
const passwordOutput = document.querySelector("#password-output");
const copyButton = document.querySelector("#copy-button");
const statusMessage = document.querySelector("#status");

// 2. Kullanılabilecek karakterleri tanımlıyoruz.
const characterSets = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?",
};

// 3. 0 ile max - 1 arasında güvenli rastgele sayı üretiyoruz.
function randomIndex(max) {
  const range = 2 ** 32;
  const limit = range - (range % max);
  const buffer = new Uint32Array(1);

  // Eşit olasılıklı seçim için sınır dışındaki sayıları tekrar çekiyoruz.
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);

  return buffer[0] % max;
}

// 4. Tercihleri alıp şifre döndüren fonksiyon.
// Bu fonksiyon HTML elemanlarına erişmez.
function generatePassword(options) {
  if (
    !Number.isInteger(options.length) ||
    options.length < 8 ||
    options.length > 64
  ) {
    throw new Error("Şifre uzunluğu 8–64 arasında tam sayı olmalı.");
  }

  const selectedSets = [];

  for (const type of Object.keys(characterSets)) {
    if (options[type]) {
      selectedSets.push(characterSets[type]);
    }
  }

  if (selectedSets.length === 0) {
    throw new Error("En az bir karakter türü seçmelisin.");
  }

  const password = [];

  // Seçilen her türden en az bir karakter ekliyoruz.
  for (const characters of selectedSets) {
    password.push(characters[randomIndex(characters.length)]);
  }

  // Tüm seçili grupları tek karakter havuzunda birleştiriyoruz.
  const pool = selectedSets.join("");

  // Kalan uzunluğu ortak havuzdan dolduruyoruz.
  while (password.length < options.length) {
    password.push(pool[randomIndex(pool.length)]);
  }

  // Karakterleri Fisher–Yates yöntemiyle karıştırıyoruz.
  for (let i = password.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);

    const temporary = password[i];
    password[i] = password[j];
    password[j] = temporary;
  }

  return password.join("");
}

// 5. Form gönderildiğinde seçimleri okuyup şifre üretiyoruz.
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const options = {
    length: Number(lengthInput.value),
    lowercase: lowercaseInput.checked,
    uppercase: uppercaseInput.checked,
    numbers: numbersInput.checked,
    symbols: symbolsInput.checked,
  };

  passwordOutput.value = "";
  copyButton.disabled = true;
  statusMessage.textContent = "";

  try {
    passwordOutput.value = generatePassword(options);
    copyButton.disabled = false;
    statusMessage.textContent = "Şifre oluşturuldu.";
  } catch (error) {
    statusMessage.textContent = error.message;
  }
});

// 6. Üretilen şifreyi panoya kopyalıyoruz.
copyButton.addEventListener("click", async () => {
  const password = passwordOutput.value;

  if (!password) return;

  try {
    await navigator.clipboard.writeText(password);
    statusMessage.textContent = "Şifre kopyalandı.";
  } catch {
    statusMessage.textContent =
      "Kopyalanamadı. Şifreyi seçerek elle kopyalayabilirsin.";
  }
});