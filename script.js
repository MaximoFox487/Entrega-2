const supportedCryptos = [
    'DOGE', 'BTC', 'ETH', 'ADA', 'AVAX', 'DOT', 'LTC', 'USDT', 'DAI', 'BNB', 'USDC', 'XRP', 'TON', 'SHIB', 'TRX', 'BCH'
];

let cart = [];

// Función para obtener la lista de criptomonedas desde la API de Binance
async function fetchCryptoList() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
        const data = await response.json();
        return data.symbols.map(crypto => crypto.baseAsset).filter(asset => supportedCryptos.includes(asset));
    } catch (error) {
        console.error('Error fetching crypto list:', error);
        return [];
    }
}

// Función para poblar los menús desplegables con las criptomonedas
async function populateCryptoDropdown() {
    const cryptos = await fetchCryptoList();

    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');

    cryptos.forEach(crypto => {
        const option = document.createElement('option');
        option.value = crypto;
        option.text = crypto;
        fromSelect.appendChild(option.cloneNode(true));
        toSelect.appendChild(option.cloneNode(true));
    });

    // Obtener la cotización inicialmente para la selección predeterminada
    fetchQuote('from');
    fetchQuote('to');
}

// Función para obtener la cotización de la criptomoneda seleccionada desde Binance
async function fetchQuote(type) {
    const currency = document.getElementById(`${type}Currency`).value;

    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${currency}USDT`);
        const data = await response.json();

        const quoteElement = document.getElementById(`${type}Quote`);
        quoteElement.textContent = `Current Price: ${parseFloat(data.price).toFixed(2)} USDT`;
        calculateConversion(); // Recalcular la conversión después de obtener la cotización
    } catch (error) {
        console.error(`Error fetching ${type} quote:`, error);
    }
}

// Función para calcular el resultado de la conversión
function calculateConversion() {
    const fromAmount = parseFloat(document.getElementById('fromAmount').value);
    const fromQuote = parseFloat(document.getElementById('fromQuote').textContent.split(':')[1]);

    if (!isNaN(fromAmount) && !isNaN(fromQuote) && fromQuote > 0) {
        const toCurrencyPrice = parseFloat(document.getElementById('toQuote').textContent.split(':')[1]);
        const tokensReceived = (fromAmount * fromQuote) / toCurrencyPrice;
        const conversionResult = tokensReceived.toFixed(6);

        const conversionResultElement = document.getElementById('conversionResult');
        conversionResultElement.textContent = conversionResult;

        const toCurrencySymbolElement = document.getElementById('toCurrencySymbol');
        toCurrencySymbolElement.textContent = document.getElementById('toCurrency').value;
    }
}

// Función para realizar el intercambio de criptomonedas
function convert() {
    const amount = parseFloat(document.getElementById('fromAmount').value);

    if (amount > 0) {
        const conversionMessage = document.getElementById('conversion-message');
        conversionMessage.innerText = 'Swap Exitoso';
    } else {
        const conversionMessage = document.getElementById('conversion-message');
        conversionMessage.innerText = 'Ingreso Invalido';
    }
}

// Función para agregar una criptomoneda al carrito
function addToCart(crypto, amount) {
    const index = cart.findIndex(item => item.crypto === crypto);
    if (index !== -1) {
        cart[index].amount += amount;
    } else {
        cart.push({ crypto, amount });
    }
    updateCartDisplay();
}

// Función para mostrar el carrito
function showCart() {
    const cartDiv = document.getElementById('cart');
    cartDiv.style.display = 'block';
}

// Función para ocultar el carrito
function hideCart() {
    const cartDiv = document.getElementById('cart');
    cartDiv.style.display = 'none';
}

// Función para actualizar la visualización del carrito
function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    cartItemsDiv.innerHTML = '';

    let total = 0;
    cart.forEach(item => {
        const cryptoTotal = item.amount; // Asegúrate de actualizar con el precio correcto
        total += cryptoTotal;

        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
            <span>${item.crypto}: ${item.amount}</span>
            <button onclick="removeFromCart('${item.crypto}')">Eliminar</button>
            <button onclick="updateCartItem('${item.crypto}', -1)">-</button>
            <button onclick="updateCartItem('${item.crypto}', 1)">+</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });

    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `Total: ${total}`;
    cartItemsDiv.appendChild(totalDiv);
}

// Función para eliminar una criptomoneda del carrito
function removeFromCart(crypto) {
    cart = cart.filter(item => item.crypto !== crypto);
    updateCartDisplay();
}

// Función para actualizar la cantidad de una criptomoneda en el carrito
function updateCartItem(crypto, amount) {
    const index = cart.findIndex(item => item.crypto === crypto);
    if (index !== -1) {
        cart[index].amount += amount;
        if (cart[index].amount <= 0) {
            removeFromCart(crypto);
        } else {
            updateCartDisplay();
        }
    }
}

// Llamar a la función para poblar los menús desplegables
populateCryptoDropdown();
