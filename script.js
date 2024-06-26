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

    const cryptoSelect = document.getElementById('cryptoCurrency');
    const paymentSelect = document.getElementById('paymentCurrency');

    cryptos.forEach(crypto => {
        const option = document.createElement('option');
        option.value = crypto;
        option.text = crypto;
        cryptoSelect.appendChild(option.cloneNode(true));
        paymentSelect.appendChild(option.cloneNode(true));
    });

    // Obtener la cotización inicialmente para la selección predeterminada
    fetchQuote();
}

// Función para obtener la cotización de la criptomoneda seleccionada desde Binance
async function fetchQuote() {
    const currency = document.getElementById('cryptoCurrency').value;

    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${currency}USDT`);
        const data = await response.json();

        const quoteElement = document.getElementById('cryptoQuote');
        quoteElement.textContent = `Precio Actual: ${parseFloat(data.price).toFixed(2)} USDT`;
    } catch (error) {
        console.error(`Error fetching quote:`, error);
    }
}

// Función para agregar una criptomoneda al carrito
function addToCart() {
    const crypto = document.getElementById('cryptoCurrency').value;
    const amount = parseFloat(document.getElementById('cryptoAmount').value);

    if (isNaN(amount) || amount <= 0) {
        alert("Ingrese una cantidad válida.");
        return;
    }

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
async function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    cartItemsDiv.innerHTML = '';

    const paymentCurrency = document.getElementById('paymentCurrency').value;
    let totalUSDT = 0;

    for (const item of cart) {
        const priceInUSDT = await fetchCryptoPriceInUSDT(item.crypto);
        const totalForItemUSDT = item.amount * priceInUSDT;
        totalUSDT += totalForItemUSDT;

        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
            <span>${item.crypto}: ${item.amount} x ${priceInUSDT.toFixed(2)} USDT = ${totalForItemUSDT.toFixed(2)} USDT</span>
            <button onclick="removeFromCart('${item.crypto}')">Eliminar</button>
            <button onclick="updateCartItem('${item.crypto}', -1)">-</button>
            <button onclick="updateCartItem('${item.crypto}', 1)">+</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
    }

    const priceOfPaymentCurrencyInUSDT = await fetchCryptoPriceInUSDT(paymentCurrency);
    const totalInPaymentCurrency = totalUSDT / priceOfPaymentCurrencyInUSDT;

    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `Total: ${totalInPaymentCurrency.toFixed(2)} ${paymentCurrency}`;
    document.getElementById('cart-total').innerHTML = '';
    document.getElementById('cart-total').appendChild(totalDiv);
}

// Función para obtener el precio de una criptomoneda en USDT
async function fetchCryptoPriceInUSDT(crypto) {
    if (crypto === 'USDT') {
        return 1;
    }

    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${crypto}USDT`);
        const data = await response.json();
        return parseFloat(data.price);
    } catch (error) {
        console.error(`Error fetching price for ${crypto}USDT:`, error);
        return 0;
    }
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

// Función para vaciar el carrito
function clearCart() {
    cart = [];
    updateCartDisplay();
}

// Llamar a la función para poblar los menús desplegables
populateCryptoDropdown();
