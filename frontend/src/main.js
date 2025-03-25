import { createApp } from 'vue';  // Création de l'application Vue
import App from './App.vue';  // Importation du composant principal
import router from './router';  // Importation du router configuré

createApp(App)
  .use(router)  // Utilisation du router dans l'application
  .mount('#app');  // Montée de l'application dans l'élément avec id="app"