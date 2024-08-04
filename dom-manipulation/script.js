let quotes = [];

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  populateCategories();
}

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteButton">Add Quote</button>
  `;
  document.body.appendChild(formContainer);
  
  document.getElementById('addQuoteButton').addEventListener('click', addQuote);
}

function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;
  
  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    saveQuotes();
    populateCategories(); 
    alert('Quote added successfully!');
  } else {
    alert('Please enter both quote and category.');
  }
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const dataUrl = URL.createObjectURL(dataBlob);
  
  const exportButton = document.createElement('a');
  exportButton.href = dataUrl;
  exportButton.download = 'quotes.json';
  exportButton.click();
}
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories(); 
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(quote => quote.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const filteredQuotes = getFilteredQuotes();
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = '';
  filteredQuotes.forEach(quote => {
    const quoteElement = document.createElement('div');
    quoteElement.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
    quoteDisplay.appendChild(quoteElement);
  });
  
  localStorage.setItem('selectedCategory', selectedCategory);
}

function getFilteredQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  return selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    const newQuotes = data.slice(0, 5).map(post => ({ text: post.title, category: "Server" }));
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();  // Update category filter
    alert('New quotes fetched from server successfully!');
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
  }
}

async function postQuoteToServer(quote) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quote)
    });
    const data = await response.json();
    console.log('Posted quote to server:', data);
  } catch (error) {
    console.error('Error posting quote to server:', error);
  }
}

async function syncQuotes() {
  await fetchQuotesFromServer();
  const unsyncedQuotes = quotes.filter(quote => !quote.synced);
  for (const quote of unsyncedQuotes) {
    await postQuoteToServer(quote);
    quote.synced = true;
  }
  saveQuotes();
  alert('Quotes synced with server successfully!');
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000); // Remove notification after 3 seconds
}

setInterval(syncQuotes, 60000);

document.getElementById('newQuote').addEventListener('click', showRandomQuote);

document.getElementById('addQuoteButton').addEventListener('click', addQuote);

showRandomQuote();
