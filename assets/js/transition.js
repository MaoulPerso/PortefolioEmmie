/* ==========================================================
   TRANSITIONS ENTRE LES PAGES
   Au clic sur un lien du site, les éléments de la page partent un par un
   dans une direction, puis ceux de la page suivante arrivent un par un
   par le côté opposé.

   Pour choisir la direction d'un lien, ajoute-lui data-direction="..." :
     bas    = on descend          (la page part vers le haut, la suivante arrive par le bas)
     haut   = on monte            (la page part vers le bas, la suivante arrive par le haut)
     droite = on va vers la droite (la page part à gauche, la suivante arrive par la droite)
     gauche = on va vers la gauche (la page part à droite, la suivante arrive par la gauche)
   Exemple : <a href="projets.html" data-direction="droite">Projets</a>
   Sans data-direction, c'est la direction par défaut ci-dessous.

   → Modifie seulement les valeurs ci-dessous.
   ========================================================== */

const DIRECTION_PAR_DEFAUT = 'bas';  // Direction des liens qui n'en précisent pas
const DUREE = 0.9;                   // Durée du mouvement de chaque élément, en secondes
const DECALAGE = 0.12;               // Temps entre deux éléments qui partent / arrivent, en secondes

// Éléments qui bougent pendant la transition (un par un).
// Ordre : ceux qui ont la plus grande profondeur (data-profondeur) partent en premier
// et arrivent en dernier, comme pour le parallax. Les autres suivent l'ordre de la page.
const ELEMENTS_ANIMES = '[data-profondeur], .site-header, main > *, .site-footer';


/* ==========================================================
   FONCTIONNEMENT (pas besoin de modifier en dessous)
   ========================================================== */

// Sens dans lequel les éléments PARTENT pour chaque direction (x, y)
const SENS_DE_DEPART = {
  bas:    [0, -1],
  haut:   [0, 1],
  droite: [-1, 0],
  gauche: [1, 0],
};

const animationsReduites = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let transitionEnCours = false;

// Mémorise la direction pour la page suivante (le navigateur peut refuser : on ignore alors)
function memoriser(direction) {
  try { sessionStorage.setItem('direction-transition', direction); } catch (e) {}
}
function lireEtOublier() {
  try {
    const direction = sessionStorage.getItem('direction-transition');
    sessionStorage.removeItem('direction-transition');
    return direction;
  } catch (e) { return null; }
}

// Position hors de l'écran, ex : "translate(0vw, -110vh)"
function horsEcran(direction, multiplicateur) {
  const [x, y] = SENS_DE_DEPART[direction] || SENS_DE_DEPART.bas;
  return `translate(${x * multiplicateur * 110}vw, ${y * multiplicateur * 110}vh)`;
}

// Liste des éléments à animer, triés par profondeur
function elementsTries(premiersLesPlusProches) {
  const liste = [...document.querySelectorAll(ELEMENTS_ANIMES)];
  const profondeur = (el) => parseFloat(el.dataset.profondeur) || 0;
  return liste.sort((a, b) =>
    premiersLesPlusProches ? profondeur(b) - profondeur(a) : profondeur(a) - profondeur(b));
}

// Lance l'animation de chaque élément, l'un après l'autre
function animerTransition(elements, depart, direction) {
  return elements.map((element, numero) => element.animate(
    depart
      ? [{ transform: 'none', opacity: 1 }, { transform: horsEcran(direction, 1), opacity: 0 }]
      : [{ transform: horsEcran(direction, -1), opacity: 0 }, { transform: 'none', opacity: 1 }],
    {
      duration: DUREE * 1000,
      delay: numero * DECALAGE * 1000,
      easing: depart ? 'cubic-bezier(0.7, 0, 0.84, 0)' : 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: depart ? 'forwards' : 'backwards',
    }
  ));
}


/* ---- Arrivée sur la page ---- */

const directionArrivee = animationsReduites ? null : lireEtOublier();
if (directionArrivee) document.documentElement.classList.add('arrivee'); // cache la page le temps de préparer (voir style.css)

document.addEventListener('DOMContentLoaded', () => {
  if (!directionArrivee) return;
  document.documentElement.classList.add('transition-en-cours');
  const animations = animerTransition(elementsTries(false), false, directionArrivee);
  document.documentElement.classList.remove('arrivee');
  Promise.all(animations.map((a) => a.finished)).then(() => {
    document.documentElement.classList.remove('transition-en-cours');
  });
});


/* ---- Départ : clic sur un lien vers une autre page du site ---- */

document.addEventListener('click', (evenement) => {
  const lien = evenement.target.closest('a');
  if (!lien) return;

  // On laisse le navigateur faire normalement si :
  const autreSite = lien.origin !== location.origin;            // lien vers un autre site
  const nouvelOnglet = lien.target === '_blank';                // ouverture dans un nouvel onglet
  const toucheEnfoncee = evenement.ctrlKey || evenement.metaKey || evenement.shiftKey; // ctrl+clic, etc.
  const memePage = lien.pathname === location.pathname;         // ancre dans la même page
  if (autreSite || nouvelOnglet || toucheEnfoncee || memePage || animationsReduites) return;

  evenement.preventDefault();
  if (transitionEnCours) return;
  transitionEnCours = true;

  const direction = lien.dataset.direction || DIRECTION_PAR_DEFAUT;
  memoriser(direction);
  document.documentElement.classList.add('transition-en-cours');

  const animations = animerTransition(elementsTries(true), true, direction);
  Promise.all(animations.map((a) => a.finished)).then(() => {
    window.location.href = lien.href;
  });
});

// Retour avec le bouton "Précédent" : la page réapparaît normalement
window.addEventListener('pageshow', (evenement) => {
  if (!evenement.persisted) return;
  document.getAnimations().forEach((animation) => animation.cancel());
  document.documentElement.classList.remove('transition-en-cours', 'arrivee');
  transitionEnCours = false;
});
