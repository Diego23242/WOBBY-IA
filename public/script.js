const synth = window.speechSynthesis;

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    synth.speak(utterance);
}

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (userInput.trim() === '') return;

    const messagesDiv = document.getElementById('messages');
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = userInput;
    messagesDiv.appendChild(userMessageDiv);

    document.getElementById('userInput').value = '';

    const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput })
    });
    const data = await response.json();

    const assistantMessageDiv = document.createElement('div');
    assistantMessageDiv.className = 'message assistant-message';
    assistantMessageDiv.textContent = data.answer;
    messagesDiv.appendChild(assistantMessageDiv);

    speak(data.answer);

    if (data.url) {
        window.open(data.url, '_blank');
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
