const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(express.static('public'));

// Обработка корневого URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API для получения списка товаров
app.get('/api/products', (req, res) => {
    const products = require('./data/products.json');
    res.json(products);
});

// API для добавления товара
app.post('/api/products', (req, res) => {
    const newProduct = req.body;
    const products = require('./data/products.json');
    newProduct.id = products.length ? products[products.length - 1].id + 1 : 1; // Генерация ID
    products.push(newProduct);
    fs.writeFile('./data/products.json', JSON.stringify(products, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Ошибка записи файла');
        }
        res.status(201).json(newProduct);
    });
});

// API для редактирования товара
app.put('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const products = require('./data/products.json');
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products[productIndex] = { ...products[productIndex], ...req.body };
        fs.writeFile('./data/products.json', JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Ошибка записи файла');
            }
            res.json(products[productIndex]);
        });
    } else {
        res.status(404).send('Товар не найден');
    }
});

// API для удаления товара
app.delete('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const products = require('./data/products.json');
    const newProducts = products.filter(p => p.id !== productId);
    if (newProducts.length === products.length) {
        return res.status(404).send('Товар не найден');
    }
    fs.writeFile('./data/products.json', JSON.stringify(newProducts, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Ошибка записи файла');
        }
        res.status(204).send();
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Админ-сервер запущен на http://localhost:${PORT}`);
});