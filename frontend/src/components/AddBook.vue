<template>
    <div class="uploader-container">
      <h1 class="title">Ajoutez un livre</h1>
  
      <!-- Galerie d'images -->
      <div class="gallery">
        <div v-for="(image, index) in images" :key="index" class="gallery-item">
          <img :src="image" alt="Preview" class="gallery-img" />
          <button @click="removeImage(index)" class="remove-btn">×</button>
        </div>
        <div v-if="images.length < 5" class="upload-section">
          <label for="file-upload" class="upload-btn">Ajouter une image</label>
          <input 
            id="file-upload" 
            type="file" 
            ref="fileInput" 
            @change="handleFileUpload" 
            accept="image/*" 
            hidden 
            />
        </div>
      </div>

      <!-- Titre -->
      <div class="title-section">
        <input v-model="bookTitle" type="text" placeholder="Titre du livre" class="title-input" />
      </div>
  
      <!-- Description -->
      <div class="description-section">
        <textarea v-model="bookDescription" placeholder="Ajoutez une description de votre livre..." class="description-textarea" />
      </div>

      <!-- Prix -->
      <div class="title-section">
        <input v-model="bookPrice" type="number" placeholder="Prix (€)" class="price-input" />
      </div>

      <div class="submit-section">
        <button @click="submitBook" class="submit-btn" :disabled="!images.length || !bookTitle">
          Soumettre
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        bookTitle: '', // Nouveau champ titre
        images: [],
        bookDescription: '',
        bookPrice: 0,
      };
    },
    methods: {
      openFileInput() {
        this.$refs.fileInput.click();
      },
      handleFileUpload(event) {
        const file = event.target.files && event.target.files[0];
        if (file && this.images.length < 5) {
            let reader = new FileReader();
            reader.onload = () => {
            this.images.push(reader.result);
            };
            reader.readAsDataURL(file);
        } else if (!file) {
            console.error('Aucun fichier sélectionné.');
        }
      },
      removeImage(index) {
        this.images.splice(index, 1);
      },
      async submitBook() {
        // Préparez les données pour l'upload
        const formData = new FormData();
        formData.append('title', this.bookTitle); // Titre ajouté
        formData.append('price', this.bookPrice || 0);
        formData.append('description', this.bookDescription || '');
  
        // Ajouter les images au FormData
        for (let i = 0; i < this.images.length; i++) {
          const imageFile = this.dataURLtoFile(this.images[i], `image${i}.jpg`);
          formData.append('images', imageFile);
        }
  
        const backendURL = process.env.VUE_APP_BACKEND_URL || 'http://localhost:5000';
  
        try {
          console.log(formData);
          const response = await axios.post(`${backendURL}/books`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log('Book added successfully:', response.data);
          this.$emit('book-added', response.data.newBook);
  
          // Reset form
          this.images = [];
          this.bookTitle = '';
          this.bookDescription = '';
          this.bookPrice = 0;
        } catch (error) {
          console.error('Error adding book:', error);
          alert('Une erreur est survenue lors de l\'ajout du livre. Veuillez réessayer.');
        }
      },
      dataURLtoFile(dataUrl, filename) {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
      }
    }
  };
  </script>
  
  <style src="./AddBook.css"></style>
  