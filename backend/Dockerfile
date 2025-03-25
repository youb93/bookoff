# Utilise l'image Node.js officielle
FROM node:16

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du projet après l'installation des dépendances
COPY . .

# Exposer le port 5000
EXPOSE 5000

# Démarrer le serveur
CMD ["node", "server.js"]