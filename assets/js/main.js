// Met l'année en cours dans le pied de page (si la page en a un)
const annee = document.getElementById('year');
if (annee) annee.textContent = new Date().getFullYear();
