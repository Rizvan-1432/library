// Получаем элементы из DOM
const addBookBtn = document.getElementById('addBookBtn');
const bookTitleInput = document.getElementById('bookTitle');
const bookCategoryInput = document.getElementById('bookCategory');
const bookRatingInput = document.getElementById('bookRating');
const bookFileInput = document.getElementById('bookFile');
const bookCoverInput = document.getElementById('bookCover');
const bookList = document.getElementById('bookList');
const bookCountDisplay = document.getElementById('bookCount');
const actionHistoryDisplay = document.getElementById('actionHistory');

// Массив для хранения книг
let books = [];

// Массив для хранения истории действий
let actionHistory = [];

// Функция для уменьшения размера изображения
function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(blob => {
                resolve(blob);
            }, 'image/jpeg', 0.7);
        };
        img.onerror = () => {
            reject(new Error('Error resizing image'));
        };
    });
}

// Функция для отображения книг
function displayBooks() {
    bookList.innerHTML = ''; // Очищаем список книг
    books.forEach((book, index) => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        
        const bookTitle = document.createElement('span');
        bookTitle.textContent = book.title;
        if (book.read) {
            bookTitle.classList.add('read');
        }
        
        const readLink = document.createElement('a');
        readLink.textContent = 'Открыть';
        readLink.href = book.file; // Устанавливаем ссылку на PDF
        readLink.target = '_blank'; // Открываем в новой вкладке
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.onclick = () => deleteBook(index);
        
        const readBtn = document.createElement('button');
        readBtn.textContent = book.read ? 'Не прочитано' : 'Прочитано';
        readBtn.onclick = () => toggleReadStatus(index);
        
        const coverImg = document.createElement('img');
        coverImg.src = book.cover || 'default-cover.jpg'; // Используем обложку или заглушку
        coverImg.alt = book.title;
        coverImg.style.width = '100px'; // Устанавливаем ширину обложки
        coverImg.style.height = '150px'; // Устанавливаем высоту обложки
        
        bookItem.appendChild(coverImg);
        bookItem.appendChild(bookTitle);
        bookItem.appendChild(readLink);
        bookItem.appendChild(readBtn);
        bookItem.appendChild(deleteBtn);
        
        bookList.appendChild(bookItem);
    });
    updateBookCount(); // Обновляем счетчик книг
    updateActionHistory(); // Обновляем историю действий
}

// Функция для обновления счетчика книг
function updateBookCount() {
    bookCountDisplay.textContent = `Количество книг: ${books.length}`;
}

// Функция для обновления истории действий
function updateActionHistory() {
    actionHistoryDisplay.innerHTML = '';
    actionHistory.forEach(action => {
        const actionItem = document.createElement('div');
        actionItem.textContent = action;
        actionHistoryDisplay.appendChild(actionItem);
    });
}

// Функция для загрузки книг из локального хранилища
function loadBooksFromLocalStorage() {
    const storedBooks = localStorage.getItem('books');
    if (storedBooks) {
        books = JSON.parse(storedBooks);
    }
}

// Функция для сохранения книг в локальное хранилище
function saveBooksToLocalStorage() {
    localStorage.setItem('books', JSON.stringify(books));
}

// Функция для добавления книги
async function addBook() {
    const title = bookTitleInput.value.trim();
    const category = bookCategoryInput.value;
    const rating = bookRatingInput.value;
    const file = bookFileInput.files[0];
    const coverFile = bookCoverInput.files[0];

    if (title && file) {
        const fileURL = URL.createObjectURL(file);
        let coverURL = '';
        if (coverFile) {
            const resizedCover = await resizeImage(coverFile, 200, 300); // Уменьшаем до 200x300
            coverURL = URL.createObjectURL(resizedCover);
        }
        books.push({ title, category, rating, cover: coverURL, read: false, file: fileURL });
        actionHistory.push(`Добавлена книга: ${title}`);
        saveBooksToLocalStorage(); // Сохраняем книги в локальное хранилище
        bookTitleInput.value = ''; // Очищаем поле ввода
        bookCategoryInput.value = ''; // Очищаем поле категории
        bookRatingInput.value = ''; // Очищаем поле оценки
        bookFileInput.value = ''; // Очищаем поле выбора файла
        bookCoverInput.value = ''; // Очищаем поле выбора обложки
        displayBooks(); // Обновляем отображение книг
    } else {
        alert("Пожалуйста, введите название книги и выберите PDF файл.");
    }
}

// Функция для удаления книги
function deleteBook(index) {
    const deletedBook = books.splice(index, 1)[0];
    actionHistory.push(`Удалена книга: ${deletedBook.title}`);
    saveBooksToLocalStorage(); // Сохраняем изменения в локальное хранилище
    displayBooks(); // Обновляем отображение книг
}

// Функция для переключения статуса прочтения
function toggleReadStatus(index) {
    books[index].read = !books[index].read;
    actionHistory.push(`Статус прочтения изменен для книги: ${books[index].title}`);
    saveBooksToLocalStorage(); // Сохраняем изменения в локальное хранилище
    displayBooks(); // Обновляем отображение книг
}

// Функция для фильтрации книг
function filterBooks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchTerm));
    displayBooks(filteredBooks);
}

// Функция для сортировки книг
function sortBooks() {
    const sortBy = document.getElementById('sortSelect').value;
    if (sortBy === 'title') {
        books.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'rating') {
        books.sort((a, b) => b.rating - a.rating);
    }
    displayBooks();
}

// Функция для экспорта книг в CSV
function exportBooks() {
    const csvContent = "data:text/csv;charset=utf-8," + books.map(e => e.title + "," + e.category + "," + e.rating).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "books.csv");
    document.body.appendChild(link);
    link.click();
}

// Загружаем книги из локального хранилища при загрузке страницы
loadBooksFromLocalStorage();

// Добавляем обработчик события для кнопки добавления книги
addBookBtn.addEventListener('click', addBook);