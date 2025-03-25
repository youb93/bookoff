import { createRouter, createWebHashHistory } from 'vue-router';
import AddBook from '@/components/AddBook.vue';
import BooksList from '@/components/BooksList.vue';
import UserLogin from '@/components/UserLogin.vue';

const routes = [
    
        {
          path: '/login',
          component: UserLogin
        },

  {
    path: '/',
    name: 'home',
    component: AddBook,
    beforeEnter: (to, from, next) => {
        const isAuthenticated = localStorage.getItem('authenticated');
        if (!isAuthenticated) {
          next('/login'); // Redirige vers la page de login si non authentifié
        } else {
          next(); // Continue vers la page d'accueil si authentifié
        }
    }
  },
  {
    path: '/books',
    name: 'books',
    component: BooksList,
    beforeEnter: (to, from, next) => {
        const isAuthenticated = localStorage.getItem('authenticated');
        if (!isAuthenticated) {
          next('/login'); // Redirige vers la page de login si non authentifié
        } else {
          next(); // Continue vers la page d'accueil si authentifié
        }
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(), // Utilise le mode hash
  routes
});

export default router;