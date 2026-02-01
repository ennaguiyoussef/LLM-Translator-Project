// content.js
// Envoie la selection quand l'utilisateur relache la souris
document.addEventListener('mouseup', sendSelection);
// Envoie la selection si selection au clavier
document.addEventListener('keyup', sendSelection);

function sendSelection() {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    chrome.runtime.sendMessage({
        action: "NEW_SELECTION",
        text: selectedText
    }).catch(() => {
        // Ignore si le panel est ferme
    });
}