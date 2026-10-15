/* =========================
   NUVEXLI - JAVASCRIPT
   Owner: Sushil Modanwal
========================= */

"use strict";

// Helper: find HTML element by ID
const $ = (id) => document.getElementById(id);

// Footer year
$("year").textContent = new Date().getFullYear();


// =========================
// DARK MODE
// =========================

const themeToggle = $("themeToggle");

function updateThemeButton() {
    const darkMode = document.body.classList.contains("dark-mode");

    themeToggle.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
    themeToggle.setAttribute("aria-pressed", String(darkMode));
}

try {
    if (localStorage.getItem("nuvexli-theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
} catch (error) {
    // The site still works if browser storage is unavailable.
}

updateThemeButton();

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const darkMode = document.body.classList.contains("dark-mode");

    try {
        localStorage.setItem("nuvexli-theme", darkMode ? "dark" : "light");
    } catch (error) {
        // Theme works for the current page even without storage.
    }

    updateThemeButton();
});


// =========================
// WORD COUNTER
// =========================

$("wordInput").addEventListener("input", () => {
    const text = $("wordInput").value;
    const trimmed = text.trim();

    const words = trimmed ? trimmed.split(/\s+/).length : 0;

    $("wordCount").textContent = words;
    $("charCount").textContent = text.length;
});


// =========================
// TEXT CASE CONVERTER
// =========================

$("upperBtn").addEventListener("click", () => {
    $("caseOutput").value = $("caseInput").value.toUpperCase();
});

$("lowerBtn").addEventListener("click", () => {
    $("caseOutput").value = $("caseInput").value.toLowerCase();
});

$("copyCaseBtn").addEventListener("click", async () => {
    await copyText($("caseOutput").value, "caseOutput");
});


// =========================
// PERCENTAGE CALCULATOR
// =========================

$("percentBtn").addEventListener("click", () => {
    const part = Number($("percentPart").value);
    const total = Number($("percentTotal").value);
    const result = $("percentResult");

    if (
        $("percentPart").value.trim() === "" ||
        $("percentTotal").value.trim() === "" ||
        !Number.isFinite(part) ||
        !Number.isFinite(total)
    ) {
        result.textContent = "Please enter both numbers.";
        return;
    }

    if (total === 0) {
        result.textContent = "Total number cannot be zero.";
        return;
    }

    const percentage = (part / total) * 100;

    result.textContent =
        `${formatNumber(part)} is ${formatNumber(percentage)}% of ${formatNumber(total)}.`;
});


// =========================
// DISCOUNT CALCULATOR
// =========================

$("discountBtn").addEventListener("click", () => {
    const price = Number($("originalPrice").value);
    const discount = Number($("discountPercent").value);
    const result = $("discountResult");

    if (
        $("originalPrice").value.trim() === "" ||
        $("discountPercent").value.trim() === "" ||
        !Number.isFinite(price) ||
        !Number.isFinite(discount)
    ) {
        result.textContent = "Please enter the price and discount.";
        return;
    }

    if (price < 0 || discount < 0 || discount > 100) {
        result.textContent = "Enter a valid price and a discount from 0 to 100%.";
        return;
    }

    const saved = price * discount / 100;
    const finalPrice = price - saved;

    result.textContent =
        `You save ₹${formatNumber(saved)}. Final price: ₹${formatNumber(finalPrice)}.`;
});


// =========================
// AGE CALCULATOR
// =========================

$("ageBtn").addEventListener("click", () => {
    const input = $("birthDate").value;
    const result = $("ageResult");

    if (!input) {
        result.textContent = "Please select your date of birth.";
        return;
    }

    const birthDate = new Date(`${input}T00:00:00`);
    const today = new Date();

    if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
        result.textContent = "Please enter a valid date of birth.";
        return;
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;

        const previousMonthDays = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
        ).getDate();

        days += previousMonthDays;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    result.textContent = `Your age is ${years} years, ${months} months and ${days} days.`;
});


// =========================
// IMAGE RESIZER
// =========================

$("resizeBtn").addEventListener("click", () => {
    const file = $("resizeFile").files[0];
    const width = Number($("resizeWidth").value);
    const height = Number($("resizeHeight").value);
    const result = $("resizeResult");
    const download = $("resizeDownload");
    const canvas = $("resizeCanvas");

    download.hidden = true;

    if (!file) {
        result.textContent = "Please choose an image.";
        return;
    }

    if (
        !file.type.startsWith("image/") ||
        !Number.isInteger(width) ||
        !Number.isInteger(height) ||
        width < 1 ||
        height < 1 ||
        width > 10000 ||
        height > 10000
    ) {
        result.textContent = "Choose a valid image and dimensions between 1 and 10000 pixels.";
        return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
        try {
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");

            context.clearRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(imageUrl);

                if (!blob) {
                    result.textContent = "Unable to resize this image.";
                    return;
                }

                const outputUrl = URL.createObjectURL(blob);

                download.href = outputUrl;
                download.download = `nuvexli-resized-${width}x${height}.png`;
                download.textContent = "Download Resized Image";
                download.hidden = false;

                result.textContent = `Image resized to ${width} × ${height} pixels.`;
            }, "image/png");
        } catch (error) {
            URL.revokeObjectURL(imageUrl);
            result.textContent = "Something went wrong while resizing the image.";
        }
    };

    image.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        result.textContent = "Unable to open this image.";
    };

    image.src = imageUrl;
});


// =========================
// JPG / PNG CONVERTER
// =========================

$("convertBtn").addEventListener("click", () => {
    const file = $("convertFile").files[0];
    const format = $("convertFormat").value;
    const result = $("convertResult");
    const download = $("convertDownload");

    download.hidden = true;

    if (!file) {
        result.textContent = "Please choose an image.";
        return;
    }

    if (!file.type.startsWith("image/")) {
        result.textContent = "Please select a valid image file.";
        return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
        try {
            const canvas = document.createElement("canvas");

            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            const context = canvas.getContext("2d");

            // JPG does not support transparency, so use a white background.
            if (format === "image/jpeg") {
                context.fillStyle = "#ffffff";
                context.fillRect(0, 0, canvas.width, canvas.height);
            }

            context.drawImage(image, 0, 0);

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(imageUrl);

                if (!blob) {
                    result.textContent = "Unable to convert this image.";
                    return;
                }

                const outputUrl = URL.createObjectURL(blob);
                const extension = format === "image/jpeg" ? "jpg" : "png";

                download.href = outputUrl;
                download.download = `nuvexli-converted.${extension}`;
                download.textContent = `Download ${extension.toUpperCase()} Image`;
                download.hidden = false;

                result.textContent = `Image converted to ${extension.toUpperCase()} successfully.`;
            }, format, 0.92);
        } catch (error) {
            URL.revokeObjectURL(imageUrl);
            result.textContent = "Something went wrong while converting the image.";
        }
    };

    image.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        result.textContent = "Unable to open this image.";
    };

    image.src = imageUrl;
});


// =========================
// TEXT CLEANER
// =========================

$("cleanBtn").addEventListener("click", () => {
    const text = $("cleanInput").value;

    const cleaned = text
        .split("\n")
        .map(line => line.replace(/[ \t]+/g, " ").trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    $("cleanOutput").value = cleaned;
});

$("copyCleanBtn").addEventListener("click", async () => {
    await copyText($("cleanOutput").value, "cleanOutput");
});


// =========================
// COPY HELPER
// =========================

async function copyText(text, fallbackElementId) {
    if (!text) {
        alert("There is no text to copy.");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        alert("Copied successfully!");
    } catch (error) {
        const element = $(fallbackElementId);

        element.focus();
        element.select();

        const copied = document.execCommand("copy");

        alert(copied ? "Copied successfully!" : "Please copy the selected text manually.");
    }
}


// =========================
// NUMBER FORMAT HELPER
// =========================

function formatNumber(number) {
    return Number(number.toFixed(2)).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}


// =========================
// TOOL SEARCH
// =========================

$("toolSearch").addEventListener("input", () => {
    const query = $("toolSearch").value.trim().toLowerCase();
    const cards = document.querySelectorAll(".tool-card");

    let visibleCount = 0;

    cards.forEach((card) => {
        const searchableText =
            `${card.dataset.name || ""} ${card.innerText}`.toLowerCase();

        const matches = searchableText.includes(query);

        card.hidden = !matches;

        if (matches) {
            visibleCount++;
        }
    });

    $("noToolsMessage").hidden = visibleCount !== 0;
});