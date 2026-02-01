document.addEventListener('DOMContentLoaded', () => {
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    const btnTranslate = document.getElementById('btnTranslate');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const charCount = document.getElementById('charCount');
    const errorZone = document.getElementById('errorZone');
    const errorText = document.getElementById('errorText');
    const btnCopy = document.getElementById('btnCopy');
    const copyText = document.getElementById('copyText');
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    const btnClearHistory = document.getElementById('btnClearHistory');

    let history = JSON.parse(localStorage.getItem('translationHistory')) || [];
    let isLoading = false;

    // 0) Historique
    renderHistory();

    // 1) Auto-remplissage depuis la sélection (temps réel)
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "NEW_SELECTION" && request.text) {
            updateInput(request.text);
        }
    });

    // 2) Sélection déjà faite avant ouverture
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => window.getSelection().toString()
            }, (results) => {
                const text = results?.[0]?.result?.trim();
                if (text) updateInput(text);
            });
        }
    });

    function updateInput(text) {
        const trimmed = (text || "").trim();
        if (!trimmed) return;

        sourceText.value = trimmed.slice(0, 500);
        charCount.textContent = sourceText.value.length;
        sourceText.focus();
    }

    // 3) Compteur + limite 500
    sourceText.addEventListener('input', () => {
        const count = sourceText.value.length;
        charCount.textContent = Math.min(count, 500);
        if (count > 500) sourceText.value = sourceText.value.substring(0, 500);
    });

    // 4) Traduction Ctrl+Entrée
    sourceText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            translate();
        }
    });

    // 5) Boutons
    btnTranslate.addEventListener('click', translate);
    btnCopy.addEventListener('click', copyTranslation);

    btnClearHistory.addEventListener('click', () => {
        if (confirm("Êtes-vous sûr de vouloir effacer l'historique ?")) {
            history = [];
            localStorage.removeItem('translationHistory');
            renderHistory();
        }
    });

    async function translate() {
        const text = sourceText.value.trim();

        if (text === '') {
            showError('Veuillez entrer du texte à traduire.');
            return;
        }
        if (isLoading) return;

        isLoading = true;
        btnTranslate.disabled = true;
        btnText.textContent = 'Traduction en cours...';
        spinner.classList.remove('hidden');
        hideError();
        btnCopy.classList.add('hidden');

        try {
            const translation = await callApi(text);

            const cleanedTranslation = (translation || "")
                .trim()
                .replace(/\n\n+/g, '\n\n');

            targetText.textContent = cleanedTranslation || "—";
            targetText.classList.remove('placeholder');
            btnCopy.classList.remove('hidden');

            addToHistory(text, cleanedTranslation);
        } catch (err) {
            showError(err?.message || "Erreur lors de la traduction.");
        } finally {
            isLoading = false;
            btnTranslate.disabled = false;
            btnText.textContent = 'Traduire';
            spinner.classList.add('hidden');
        }
    }

    function copyTranslation() {
        const text = targetText.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const original = copyText.textContent;
            copyText.textContent = '✅ Copié !';
            btnCopy.classList.add('copied');
            setTimeout(() => {
                copyText.textContent = original;
                btnCopy.classList.remove('copied');
            }, 2000);
        }).catch(() => showError('Impossible de copier.'));
    }

    function showError(message) {
        errorText.textContent = message;
        errorZone.classList.remove('hidden');
    }

    function hideError() {
        errorZone.classList.add('hidden');
    }

    function addToHistory(source, target) {
        history.unshift({ source, target, timestamp: new Date().getTime() });
        if (history.length > 10) history.pop();
        localStorage.setItem('translationHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        if (!history || history.length === 0) {
            historySection.classList.add('hidden');
            return;
        }

        historySection.classList.remove('hidden');
        historyList.innerHTML = '';

        history.forEach((item) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-item-source">${escapeHtml(item.source)}</div>
                <div class="history-item-target">${escapeHtml(item.target)}</div>
            `;
            historyItem.addEventListener('click', () => {
                sourceText.value = item.source;
                sourceText.focus();
                charCount.textContent = item.source.length;
            });
            historyList.appendChild(historyItem);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text ?? '';
        return div.innerHTML;
    }
});

async function callApi(text) {
    const apiUrl = "http://localhost:8080/api/translator/translate";
    const basicAuth = "Basic " + btoa("admin:password");

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": basicAuth,
            "Content-Type": "text/plain",
            "Accept": "application/json, text/plain;q=0.9"
        },
        body: text
    });

    if (!response.ok) {
        if (response.status === 404) throw new Error("API introuvable (Vérifiez l'URL).");
        throw new Error("Erreur serveur : " + response.status);
    }

    const contentType = response.headers.get("content-type") || "";

    // Supporte 2 formats:
    // 1) JSON: { translation: "..." }
    // 2) texte brut: "..."
    if (contentType.includes("application/json")) {
        const data = await response.json();
        const t = data?.translation ?? data?.result ?? data?.text;
        if (!t) throw new Error("Réponse JSON invalide (champ translation manquant).");
        return t;
    }

    const result = await response.text();
    if (result.trim().startsWith("<")) throw new Error("Erreur URL: reçoit du HTML au lieu du Darija.");
    return result;
}