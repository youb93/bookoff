<template>
  <div id="app">
    <nav class="navbar">
      <router-link to="/" class="nav-item">Ajouter un livre</router-link>
      <router-link to="/books" class="nav-item">Livres ajoutés</router-link>
    </nav>

    <!-- Vue Router affiche ici les composants -->
    <router-view :books="books" @book-added="addBook" @book-deleted="deleteBook"></router-view>
  </div>
</template>

<script>
import router from './router';

export default {
  name: 'App',
  data() {
    return {
      books: []  // Initialisation de la liste de livres
    };
  },
  methods: {
    // Ajouter un livre
    addBook(book) {
      this.books.push(book);
    },
    
    // Supprimer un livre en écoutant l'événement du composant enfant
    deleteBook(index) {
      this.books.splice(index, 1); // Suppression du livre à l'index donné
    }
  },
  router: router
};
</script>

<style scoped src="./App.css"></style>