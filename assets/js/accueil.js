/* ==========================================================
   RÉGLAGES DE L'EFFET PARALLAX (page d'accueil)
   → Modifie seulement les valeurs ci-dessous.
   ========================================================== */

const DEPLACEMENT_HORIZONTAL = 40;  // Déplacement max gauche-droite, en pixels (pour un élément de profondeur 1)
const DEPLACEMENT_VERTICAL = 0;     // Déplacement max haut-bas, en pixels (0 = pas de mouvement vertical)
const SENS = -1;                    // -1 = le décor part à l'opposé de la souris · 1 = il suit la souris
const FLUIDITE = 0.08;              // Douceur du mouvement : 0.02 (très doux, lent) à 1 (instantané)

// La force de l'effet pour chaque élément se règle dans index.html (data-profondeur="...").


/* ==========================================================
   FONCTIONNEMENT (pas besoin de modifier en dessous)
   ========================================================== */

const elements = document.querySelectorAll('[data-profondeur]');

// Position de la souris visée (cible) et position affichée (actuelle), de -1 à 1
let cibleX = 0, cibleY = 0;
let actuelX = 0, actuelY = 0;
let animationEnCours = false;

// Pas d'effet sur téléphone/tablette (pas de souris)
// ni si la personne a désactivé les animations sur son ordinateur
const avecSouris = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const parallaxDesactive = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (avecSouris && !parallaxDesactive) {
  window.addEventListener('mousemove', (evenement) => {
    cibleX = (evenement.clientX / window.innerWidth) * 2 - 1;   // -1 = bord gauche, 1 = bord droit
    cibleY = (evenement.clientY / window.innerHeight) * 2 - 1;  // -1 = haut, 1 = bas
    if (!animationEnCours) {
      animationEnCours = true;
      requestAnimationFrame(animer);
    }
  });
}

function animer() {
  // Rapproche petit à petit la position affichée de la position visée
  actuelX += (cibleX - actuelX) * FLUIDITE;
  actuelY += (cibleY - actuelY) * FLUIDITE;

  elements.forEach((element) => {
    const profondeur = parseFloat(element.dataset.profondeur) || 0;
    const x = actuelX * DEPLACEMENT_HORIZONTAL * profondeur * SENS;
    const y = actuelY * DEPLACEMENT_VERTICAL * profondeur * SENS;
    element.style.translate = `${x}px ${y}px`;
  });

  // Continue tant que le décor n'est pas arrivé, puis s'arrête (économise la batterie)
  const arrive = Math.abs(cibleX - actuelX) < 0.001 && Math.abs(cibleY - actuelY) < 0.001;
  if (arrive) {
    animationEnCours = false;
  } else {
    requestAnimationFrame(animer);
  }
}
