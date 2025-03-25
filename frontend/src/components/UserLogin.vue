<template>
    <div>
      <h1>Login</h1>
      <input v-model="password" type="password" placeholder="Enter password" />
      <button @click="login">Login</button>
      <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        password: '',
        errorMessage: ''
      };
    },
    methods: {
      login() {
        const correctPassword = 'monMotDePasse'; // Défini le mot de passe ici
        if (this.password === correctPassword) {
          localStorage.setItem('authenticated', 'true');
          this.$router.push('/'); // Redirige vers la page d'accueil après connexion
        } else {
          this.errorMessage = 'Mot de passe incorrect';
        }
      }
    }
  };
  </script>