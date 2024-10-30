function filterLanguages() {
    const input = document.getElementById('search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        if (title.includes(input)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}