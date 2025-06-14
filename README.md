# 🧪 Lab vulnérable File Upload multi-niveaux

Ce projet est un laboratoire de test avec plusieurs niveaux de vulnérabilités de type d'upload de fichier, construit avec Node.js.

---

## 🎯 Objectifs

- Comprendre les vecteurs d'attaque liés aux fichiers uploadés
- Visualiser les différents niveaux de sécurisation possibles
- Apprendre à bypasser des protections naïves (extension, MIME, content-type)
- Appliquer des contre-mesures solides en backend

---

## 🔐 Niveaux

- Niveau 0 : Aucun filtre
- Niveau 1 : Filtrage par extension (client)
- Niveau 2 : Vérification du type MIME (serveur)
- Niveau 3 : Sécurisation du rendu + nom aléatoire + validation stricte

---

## ✅ Prérequis

- Node.js (version 18+ recommandée)   
- Un fichier `.env` avec une variable SECURITY 

---

## ⚙️ Installation

1. Clonez ce dépôt :

   ```bash
   git clone https://github.com/AledMikuinIt/XXXXXX.git
   cd upload-lab
   
2. Installez les dépendances backend :

   ```bash
   npm install
   
3. Installez les dépendances backend :

   ```bash
   npm run dev


Note : Assurez-vous que la variables .env est correctement configurée.

## 🧠 Explication du fonctionnement

# 🔓 Niveau 0

Aucune vérification n'est effectuée. Vous pouvez uploader n'importe quel fichier, y compris malveillant (PHP, SVG, etc.).
J'ai donc fait un fichier .svg avec le code suivant :

```bash
<svg xmlns="http://www.w3.org/2000/svg" onload="alert('XSS')">
</svg>
```
Le script s'exécute dès l'affichage car le SVG est directement rendu via index.ejs.

# 🚧 Niveau 1

Un filtrage basique est appliqué côté client : seules certaines extensions sont autorisées (.png, .jpg, etc.).

Pour contourner cette protection, il suffit de déguiser un fichier malveillant, par exemple :

- Fichier d'origine : xss.svg
- Fichier contourné : xss.svg.jpg

Ensuite, un header Content-Type est forcé dans le code (démo uniquement) :

```
  if (securityLevel === 1) {
    res.setHeader('Content-Type', 'image/svg+xml'); 
  }
```
Cela permet au navigateur d’interpréter le contenu comme un SVG et d’exécuter le code malveillant.

# 🔬 Niveau 2

Le serveur lit les magic bytes pour vérifier le MIME type réel du fichier uploadé grâce à la bibliothèque file-type.

Exemple de contournement : un fichier polyglotte PNG/SVG :

- Le fichier commence par des headers PNG valides.
- Le contenu reste du SVG malveillant.
- Généré via un script Python.

Cela permet de tromper la détection tout en conservant un comportement exploitable côté client.

# 🛡️ Niveau 3

Ajout de protections supplémentaires :
- Forçage du Content-Type: text/plain pour désactiver tout rendu HTML/SVG. Donc le code sera pas éxécuté mais juste affiché comme du texte.
- Header X-Content-Type-Options: nosniff pour empêcher l'interprétation automatique par le navigateur.

Ces mécanismes bloquent l’exécution de scripts embarqués, même en cas d’upload réussi.


## ✅ Résumé

Ce lab montre qu’une protection “visuelle” (comme le filtrage client) est triviale à contourner, et que seul un ensemble de mécanismes combinés (MIME check, stockage contrôlé, headers de protection) permet une défense réellement robuste.



## 🚀 Pistes d'amélioration

- Ajouter un antivirus côté serveur (ex: ClamAV)
- Générer un hash SHA256 et renommer tous les fichiers uploadés
- Isoler les fichiers dans un conteneur ou bucket S3
- Stocker les fichiers hors du répertoire servi par Express