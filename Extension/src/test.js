const TradingView = require('tradingview-api');

async function testAPI() {
    try {
        console.log('Подключение к TradingView API...');
        const client = new TradingView();
        await client.connect();
        console.log('Подключено успешно');

        console.log('Создание графика для BTCUSDT...');
        const chart = await client.chart('BINANCE:BTCUSDT');
        await chart.setMarket('BINANCE:BTCUSDT');
        console.log('График создан');

        console.log('Получение исторических данных...');
        const history = await chart.getHistory('1D', 100);
        console.log('Получено свечей:', history.length);
        console.log('Последняя свеча:', history[history.length - 1]);

        console.log('Отключение...');
        await client.disconnect();
        console.log('Тест завершен');

    } catch (error) {
        console.error('Ошибка при тестировании:', error);
    }
}

// Запускаем тест
testAPI();
