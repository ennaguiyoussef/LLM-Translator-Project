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

    // Charger l'historique au démarrage
    renderHistory();

    // Compteur de caractères
    sourceText.addEventListener('input', () => {
        const count = sourceText.value.length;
        charCount.textContent = Math.min(count, 500);

        // Empêcher de dépasser 500 caractères
        if (count > 500) {
            sourceText.value = sourceText.value.substring(0, 500);
        }
    });

    // Traduction avec Ctrl+Entrée
    sourceText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            translate();
        }
    });

    // Bouton Traduire
    btnTranslate.addEventListener('click', translate);

    // Bouton Copier
    btnCopy.addEventListener('click', copyTranslation);

    // Bouton Effacer historique
    btnClearHistory.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir effacer l\'historique ?')) {
            history = [];
            localStorage.removeItem('translationHistory');
            renderHistory();
        }
    });

    // Fonction de traduction
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
            const response = await fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'text=' + encodeURIComponent(text),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                showError(data.error || 'Erreur lors de la traduction. Vérifiez que l\'API est accessible.');
                return;
            }

            const translation = data.translation;

            // Nettoyage et formatage du texte
            const cleanedTranslation = translation
                .trim()
                .replace(/\n\n+/g, '\n\n'); // Compacter les sauts de ligne multiples

            targetText.textContent = cleanedTranslation;
            targetText.classList.remove('placeholder');
            btnCopy.classList.remove('hidden');

            // Ajouter à l'historique
            addToHistory(text, cleanedTranslation);

        } catch (err) {
            showError('Erreur réseau : ' + err.message);
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
            const originalText = copyText.textContent;
            copyText.textContent = '✅ Copié !';
            btnCopy.classList.add('copied');

            setTimeout(() => {
                copyText.textContent = originalText;
                btnCopy.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            showError('Impossible de copier.');
        });
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
        if (history.length > 10) {
            history.pop();
        }
        localStorage.setItem('translationHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        if (history.length === 0) {
            historySection.classList.add('hidden');
            return;
        }

        historySection.classList.remove('hidden');
        historyList.innerHTML = '';

        history.forEach((item, index) => {
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
        div.textContent = text;
        return div.innerHTML;
    }
});

