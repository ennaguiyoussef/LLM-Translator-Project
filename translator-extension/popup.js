document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('translateBtn');
    const textArea = document.getElementById('inputText');
    const resultText = document.getElementById('resultText');
    const outputArea = document.getElementById('outputArea');
    const loader = document.getElementById('loader');
    const errorDiv = document.getElementById('error');

    // 1. Ecoute temps reel (selection apres ouverture)
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "NEW_SELECTION" && request.text) {
            updateInput(request.text);
        }
    });

    // 2. Verification au demarrage (selection avant ouverture)
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]?.id) {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                func: () => window.getSelection().toString()
            }, (results) => {
                if (results?.[0]?.result) {
                    const text = results[0].result.trim();
                    if (text) updateInput(text);
                }
            });
        }
    });

    function updateInput(text) {
        if (textArea.value !== text) {
            textArea.value = text;
            // Flash visuel leger
            textArea.style.backgroundColor = "#e0e7ff";
            setTimeout(() => { textArea.style.backgroundColor = "white"; }, 300);
        }
    }

    // 3. Traduction
    btn.addEventListener('click', async () => {
        const text = textArea.value.trim();
        if (!text) return;

        loader.classList.remove('hidden');
        outputArea.classList.add('hidden');
        errorDiv.classList.add('hidden');
        btn.disabled = true;

        try {
            const translation = await callApi(text);
            resultText.textContent = translation;
            outputArea.classList.remove('hidden');
        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
            btn.disabled = false;
        }
    });
});

async function callApi(text) {
    const apiUrl = "http://localhost:8080/api/translator/translate";
    const basicAuth = "Basic " + btoa("admin:password");

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": basicAuth,
            "Content-Type": "text/plain",
            "Accept": "text/plain"
        },
        body: text
    });

    if (!response.ok) {
        if (response.status === 404) throw new Error("API introuvable (Verifiez URL).");
        throw new Error("Erreur serveur : " + response.status);
    }

    const result = await response.text();

    if (result.trim().startsWith("<")) {
        throw new Error("Erreur URL: Recoit du HTML au lieu du Darija.");
    }

    return result;
}