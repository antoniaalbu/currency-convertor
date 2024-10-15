const amountInput = document.getElementById("amount");
const fromCurrencySelect = document.getElementById("from-currency");
const toCurrencySelect = document.getElementById("to-currency");
const convertButton = document.getElementById("convert-btn");
const resultDisplay = document.getElementById("result");
const conversionResultSpan = document.getElementById("conversion-result");
const scrollingText = document.getElementById("scrolling-text");
const overlay = document.getElementById('overlay');
const closeOverlayBtn = document.getElementById('close-overlay-btn');

const API_URL = 'https://api.exchangerate-api.com/v4/latest/';
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; 

async function fetchCurrencies() {
    const lastFetchTimestamp = localStorage.getItem('lastFetchTimestamp');
    const currentTime = new Date().getTime();

    if (lastFetchTimestamp && (currentTime - lastFetchTimestamp) < ONE_DAY_IN_MS) {
        console.log("Using cached data from localStorage.");
        const savedRates = localStorage.getItem('exchangeRates');
        if (savedRates) {
            const rates = JSON.parse(savedRates);
            populateCurrencyOptions(rates);
            displayExchangeRates(rates);
            return; 
        }
    }

    try {
        const response = await fetch(`${API_URL}RON`);
        const data = await response.json();

        localStorage.setItem('exchangeRates', JSON.stringify(data.rates));
        localStorage.setItem('lastFetchTimestamp', currentTime); 

        populateCurrencyOptions(data.rates);
        displayExchangeRates(data.rates);
    } catch (error) {
        console.error('Error fetching currencies:', error);
        alert('Failed to load currency data from API. Using local data if available.');

        const savedRates = localStorage.getItem('exchangeRates');
        if (savedRates) {
            const rates = JSON.parse(savedRates);
            populateCurrencyOptions(rates);
            displayExchangeRates(rates);
        } else {
            alert('No local data available.');
        }
    }
}

function populateCurrencyOptions(rates) {
    const currencies = Object.keys(rates);

    currencies.forEach(currency => {
        const optionFrom = document.createElement("option");
        optionFrom.value = currency;
        optionFrom.textContent = currency;
        fromCurrencySelect.appendChild(optionFrom);

        const optionTo = document.createElement("option");
        optionTo.value = currency;
        optionTo.textContent = currency;
        toCurrencySelect.appendChild(optionTo);
    });
}

function displayExchangeRates(rates) {
    const displayedCurrencies = ["EUR", "GBP", "USD", "JPY", "CAD"];
    const exchangeRatesList = displayedCurrencies.map(currency => {
        return `${currency}: ${rates[currency].toFixed(2)}`;
    });

    let index = 0;
    setInterval(() => {
        scrollingText.textContent = `Current Exchange Rates - ${exchangeRatesList[index]}`;
        index = (index + 1) % exchangeRatesList.length;
    }, 3000);
}

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

        localStorage.setItem('exchangeRates', JSON.stringify(data.rates));

        const exchangeRate = data.rates[toCurrency];
        const convertedAmount = amount * exchangeRate;

        conversionResultSpan.textContent = `${convertedAmount.toFixed(2)} ${toCurrency}`;
        resultDisplay.style.display = 'block';
    } catch (error) {
        console.error('Error converting currency:', error);
        alert('Conversion failed. Using local data if available.');

        const savedRates = localStorage.getItem('exchangeRates');
        if (savedRates) {
            const rates = JSON.parse(savedRates);
            const exchangeRate = rates[toCurrency];
            const convertedAmount = amount * exchangeRate;

            conversionResultSpan.textContent = `${convertedAmount.toFixed(2)} ${toCurrency}`;
            resultDisplay.style.display = 'block';
        } else {
            alert('No local data available for conversion.');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const showExchangeBtn = document.getElementById('show-exchange-btn');
    const switchBtn = document.getElementById('switch-btn');

    showExchangeBtn.addEventListener('click', function() {
        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
    });

    closeOverlayBtn.addEventListener('click', function() {
        overlay.classList.add('hidden');
        overlay.classList.remove('visible');
    });

    switchBtn.addEventListener('click', function() {
        const tempCurrency = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = tempCurrency;
    });

    fetchCurrencies();
    convertButton.addEventListener("click", convertCurrency);
});
