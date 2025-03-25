const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import de la configuration
const config = require('./config');

const app = express();
const port = config.port; // Utilisation du port depuis la config


// Middleware CORS
const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost',  // Frontend Dockerisé
        'http://90.91.173.180:28080', // Frontend sur le NAS 
        // Ajouter d'autres origines autorisées ici
      ];
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true); // Autoriser l'origine
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
};
  
app.use(cors(corsOptions)); // Appliquer CORS
  
app.use(express.json());  // Utiliser express.json pour parser les JSON
  
// Servir les fichiers statiques du dossier "uploads"
app.use('/api/uploads', express.static('uploads'));

// Vérifier et créer le dossier "uploads" si nécessaire
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Setup multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// MongoDB connection
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Define Book Schema with title
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Ajout du titre
  price: { type: Number, required: false },
  description: { type: String, required: false },
  images: [String],
});
const Book = mongoose.model('Book', bookSchema);

// POST route to upload book info with title
app.post('/api/books', upload.array('images', 5), async (req, res) => {
  const { title, price, description } = req.body; // Ajout du titre dans la requête
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'At least one image is required' });
  }
  const images = req.files.map(file => file.filename);
  try {
    const newBook = new Book({ title, price, description, images }); // Ajout du titre dans le modèle
    await newBook.save();
    res.status(201).json({ message: 'Book added successfully', newBook });
  } catch (err) {
    res.status(400).json({ error: 'Error adding book' });
  }
});

// GET endpoint to list all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching books' });
  }
});

// DELETE endpoint to remove a book by id
app.delete('/api/books/:id', async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
  
      // Supprimer les images associées du serveur
      if (book.images && book.images.length > 0) {
        await Promise.all(
          book.images.map(image => {
            return new Promise((resolve) => {
              const imagePath = path.join(__dirname, 'uploads', image);
              fs.unlink(imagePath, (err) => {
                if (err) {
                  console.error('Error deleting image:', err);
                  // On ne rejette pas la promesse pour ne pas bloquer la suppression du livre
                }
                resolve();
              });
            });
          })
        );
      }
  
      // Supprimer le livre de la base de données avec deleteOne
      await Book.deleteOne({ _id: req.params.id });
      res.json({ message: 'Book deleted successfully' });
    } catch (err) {
      console.error('Error deleting book:', err);
      res.status(500).json({ error: 'Error deleting book', details: err.message });
    }
  });

// Endpoint to remove a specific image from a book
app.put('/api/books/:id/remove-image', async (req, res) => {
    const { image } = req.body;
    try {
      const updatedBook = await Book.findByIdAndUpdate(
        req.params.id,
        { $pull: { images: image } },
        { new: true }
      );
      if (!updatedBook) {
        return res.status(404).json({ error: 'Book not found' });
      }
  
      // Delete image file from server
      const imagePath = path.join(__dirname, 'uploads', image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image from server:', err);
          return res.status(500).json({ error: 'Error deleting image from server' });
        }
      });
  
      res.json({ message: 'Image deleted successfully', updatedBook });
    } catch (err) {
      console.error('Error deleting image:', err);
      res.status(500).json({ error: 'Error deleting image' });
    }
  });

// PUT endpoint to update book info (add images without replacing existing ones)
app.put('/api/books/:id', upload.array('images', 5), async (req, res) => {
    const { title, price, description } = req.body;
    
    const existingBook = await Book.findById(req.params.id);
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
  
    let images = existingBook.images; // Keep existing images
    if (req.files && req.files.length > 0) {
      images = [...images, ...req.files.map(file => file.filename)];
    }
  
    try {
      const updatedBook = await Book.findByIdAndUpdate(
        req.params.id,
        {
          title: title !== undefined ? title : existingBook.title,
          price: price !== undefined ? price : 0,  // Handle price as `null` if it's missing
          description: description !== undefined ? description : '',  // Handle description as `null` if it's missing
          images: images,
        },
        { new: true }
      );
  
      if (updatedBook) {
        res.json({ message: 'Book updated successfully', updatedBook });
      } else {
        res.status(404).json({ error: 'Book not found' });
      }
    } catch (err) {
      console.error('Error updating book:', err);
      res.status(500).json({ error: 'Error updating book', details: err.message });
    }
  });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
