const amountInput = document.getElementById("amount");
const fromCurrencySelect = document.getElementById("from-currency");
const toCurrencySelect = document.getElementById("to-currency");
const convertButton = document.getElementById("convert-btn");
const resultDisplay = document.getElementById("result");
const conversionResultSpan = document.getElementById("conversion-result");
const exchangeRatesNavbar = document.getElementById("exchange-rates-navbar");
const scrollingText = document.getElementById("scrolling-text");
const API_URL = 'https://api.exchangerate-api.com/v4/latest/';
const overlay = document.getElementById('overlay');
const closeOverlayBtn = document.getElementById('close-overlay-btn');

// Fetch and display the list of currencies and exchange rates
async function fetchCurrencies() {
    try {
        const response = await fetch(`${API_URL}RON`); // Using USD as the base currency
        const data = await response.json();

        const currencies = Object.keys(data.rates);
        
        // Populate the dropdown options for "From" and "To" currencies
        currencies.forEach(currency => {
            const optionFrom = document.createElement("option");
            optionFrom.value = currency;
            optionFrom.textContent = currency;
            fromCurrencySelect.appendChild(optionFrom);

            const optionTo = document.createElement("option");
            optionTo.value = currency;
            optionTo.textContent = currency;
            toCurrencySelect.appendChild(optionTo);

            displayExchangeRates(data.rates);
        });

    } catch (error) {
        console.error('Error fetching currencies:', error);
        alert('Failed to load currency data.');
    }
}

function displayExchangeRates(rates) {
    const displayedCurrencies = ["EUR", "GBP", "JPY", "RON", "CAD"];
    const exchangeRatesList = displayedCurrencies.map(currency => {
        return `${currency}: ${rates[currency].toFixed(2)}`;
    });

    let index = 0;
    setInterval(() => {
        scrollingText.textContent = `Current Exchange Rates - ${exchangeRatesList[index]}`;
        index = (index + 1) % exchangeRatesList.length; 
    }, 3000);
}

// Convert currency function
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (!amount || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}${fromCurrency}`);
        const data = await response.json();
        const exchangeRate = data.rates[toCurrency];
        const convertedAmount = amount * exchangeRate;

        conversionResultSpan.textContent = `${convertedAmount.toFixed(2)} ${toCurrency}`;
        resultDisplay.style.display = 'block';
    } catch (error) {
        console.error('Error converting currency:', error);
        alert('Conversion failed.');
    }
}

// Event listeners and initial data fetch
document.addEventListener('DOMContentLoaded', function() {
    const showExchangeBtn = document.getElementById('show-exchange-btn'); // Button that shows the exchange form
    const switchBtn = document.getElementById('switch-btn'); // Button to swap currencies

    // Show the overlay when "Make a Conversion" button is clicked
    showExchangeBtn.addEventListener('click', function() {
        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
    });

    // Hide the overlay when the close button is clicked
    closeOverlayBtn.addEventListener('click', function() {
        overlay.classList.add('hidden');
        overlay.classList.remove('visible');
    });

    // Swap the "From" and "To" currency values
    switchBtn.addEventListener('click', function() {
        const tempCurrency = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = tempCurrency;
    });

    // Fetch the list of currencies when the page loads
    fetchCurrencies();

    // Handle conversion on button click
    convertButton.addEventListener("click", convertCurrency);
});
