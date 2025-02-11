const { TradingViewOptimizer } = require('./tradingview/optimizer');

async function testOptimizer() {
    try {
        const optimizer = new TradingViewOptimizer();
        
        // Инициализируем с тестовым символом
        console.log('Инициализация оптимизатора...');
        await optimizer.initialize('BINANCE:BTCUSDT');

        // Параметры оптимизации
        const params = {
            minProfit: 1000,
            maxDrawdown: 30,
            minTrades: 10,
            minWinRate: 50
        };

        // Диапазоны для оптимизации
        const ranges = {
            'length': { min: 10, max: 50, step: 10 },
            'multiplier': { min: 1, max: 3, step: 0.5 }
        };

        // Запускаем оптимизацию
        console.log('Запуск оптимизации...');
        const result = await optimizer.optimize(params, ranges);

        if (result) {
            console.log('Оптимальные параметры:', result.inputs);
            console.log('Результаты:', result.results);
        } else {
            console.log('Не найдено подходящих параметров');
        }

        // Закрываем оптимизатор
        await optimizer.close();
        console.log('Тест завершен');

    } catch (error) {
        console.error('Ошибка при тестировании:', error);
    }
}

// Запускаем тест
testOptimizer();
