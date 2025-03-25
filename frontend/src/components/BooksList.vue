<template>
    <div class="submitted-books">
      <h3>Livres ajoutés :</h3>
      
      <!-- Message d'erreur éventuel -->
      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>
      
      <div class="books-grid">
        <div v-for="book in books" :key="book._id" class="book-item">
          <!-- Bouton pour supprimer le livre -->
          <button class="delete-btn" @click="deleteBook(book._id)">
            <i class="fas fa-trash-alt"></i>
          </button>
    
          <!-- Zone modifiable pour la description et le prix -->
          <div class="book-details">
            <label><strong>Title:</strong></label>
            <input v-model="book.title" class="editable-input edit-title" placeholder="Cliquez pour modifier..."/>
    
            <label><strong>Description:</strong></label>
            <textarea v-model="book.description" class="editable-input edit-description" placeholder="Cliquez pour modifier..."></textarea>
    
            <label><strong>Prix:</strong></label>
            <input v-model="book.price" type="number" class="editable-input edit-price" placeholder="Prix en €" />
          </div>
    
          <!-- Affichage des images existantes -->
          <div v-if="book.images && book.images.length > 0" class="book-images">
            <p><strong>Images:</strong></p>
            <div class="submitted-gallery">
              <div v-for="(image, index) in book.images" :key="index" class="image-wrapper">
                <img :src="getImageUrl(image)" alt="Preview" class="submitted-img" />
                <button @click="removeImage(book._id, image)" class="remove-img-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
    
          <!-- Prévisualisation des images ajoutées -->
          <div v-if="previewImages[book._id]" class="image-previews">
            <div v-for="(preview, index) in previewImages[book._id]" :key="index" class="preview-wrapper">
              <img :src="preview" alt="Image Preview" class="preview-img" />
            </div>
          </div>
    
          <!-- Ajouter de nouvelles images -->
          <div class="add-image">
            <label :for="'fileInput-' + book._id" class="upload-btn">Ajouter des images</label>
            <input type="file" :id="'fileInput-' + book._id" multiple @change="onImageChange($event, book._id)" />
          </div>
    
          <!-- Bouton de sauvegarde -->
          <button @click="updateBook(book._id)" class="save-btn">Sauvegarder</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        books: [],
        previewImages: {}, // Aperçus d'images par bookId
        errorMessage: null
      };
    },
    methods: {
      // Récupérer tous les livres depuis le backend
      fetchBooks() {
        const backendURL = process.env.VUE_APP_BACKEND_URL || 'http://localhost:5000';
        axios.get(`${backendURL}/books`)
          .then(response => {
            this.books = response.data.length > 0 ? response.data : [];
            this.errorMessage = null;
          })
          .catch(error => {
            console.error('Erreur lors de la récupération des livres:', error);
            this.errorMessage = 'Erreur lors de la récupération des livres.';
          });
      },
      // Supprimer un livre
      deleteBook(bookId) {
        const backendURL = process.env.VUE_APP_BACKEND_URL || 'http://localhost:5000';
        axios.delete(`${backendURL}/books/${bookId}`)
          .then(() => {
            this.fetchBooks();
          })
          .catch(error => {
            console.error('Erreur lors de la suppression du livre:', error);
            this.errorMessage = 'Erreur lors de la suppression du livre.';
          });
      },
      // Gérer l'ajout d'images et créer des aperçus
      onImageChange(event, bookId) {
        const newFiles = event.target.files;
        const previews = [];
        for (let i = 0; i < newFiles.length; i++) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previews.push(e.target.result);
            // Mise à jour réactive : assignation directe (Vue 3 gère la réactivité)
            this.previewImages[bookId] = [...(this.previewImages[bookId] || []), ...previews];
          };
          reader.readAsDataURL(newFiles[i]);
        }
      },
      // Convertir une Data URL en Blob
      dataURLToBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        return new Blob([uint8Array], { type: 'image/png' });
      },
      // Mettre à jour un livre en ajoutant les nouvelles images aux existantes
      updateBook(bookId) {
        const backendURL = process.env.VUE_APP_BACKEND_URL || 'http://localhost:5000';
        const book = this.books.find(b => b._id === bookId);
        const formData = new FormData();
        formData.append('title', book.title !== '' ? book.title : '');
        formData.append('price', book.price !== '' ? book.price : 0);
        formData.append('description', book.description !== '' ? book.description : '');
    
        const newImages = this.previewImages[bookId];
        if (newImages && newImages.length > 0) {
          newImages.forEach(preview => {
            const imageBlob = this.dataURLToBlob(preview);
            formData.append('images', imageBlob, `image_${Date.now()}.png`);
          });
        }
    
        axios.put(`${backendURL}/books/${bookId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(() => {
          this.fetchBooks(); // Mise à jour de la liste après modification
          this.previewImages[bookId] = []; // Réinitialiser les aperçus pour ce livre
        })
        .catch(error => {
          console.error('Erreur lors de la mise à jour du livre:', error);
          this.errorMessage = 'Erreur lors de la mise à jour du livre.';
        });
      },
      // Supprimer une image d'un livre
      removeImage(bookId, image) {
        const backendURL = process.env.VUE_APP_BACKEND_URL || 'http://localhost:5000';
        axios.put(`${backendURL}/books/${bookId}/remove-image`, { image })
            .then(response => {
            console.log('Image supprimée avec succès:', response.data);
            this.fetchBooks();  // Update the book list after image removal
            })
            .catch(error => {
            console.error('Erreur lors de la suppression de l\'image:', error);
            this.errorMessage = 'Erreur lors de la suppression de l\'image.';
            });
      },
      // Construire l'URL complète d'une image
      getImageUrl(filename) {
        const backendURL = process.env.VUE_APP_BACKEND_URL || 'http://localhost:5000';
        return `${backendURL}/uploads/${filename}`;
      }
    },
    mounted() {
      this.fetchBooks();
    }
  };
  </script>
  
  <style scoped src="./BooksList.css"></style>
  