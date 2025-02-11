import { TradingViewAPI } from './api';

export interface OptimizationParams {
    minProfit: number;
    maxDrawdown: number;
    minTrades: number;
    minWinRate: number;
}

export interface OptimizationResult {
    inputs: { [key: string]: number };
    results: {
        netProfit: number;
        maxDrawdown: number;
        totalTrades: number;
        winRate: number;
    };
}

export class TradingViewOptimizer {
    private api: TradingViewAPI;
    private currentSymbol: string | null = null;

    constructor() {
        this.api = new TradingViewAPI();
    }

    /**
     * Инициализация оптимизатора
     */
    public async initialize(symbol: string): Promise<void> {
        try {
            await this.api.connect();
            this.currentSymbol = symbol;
            await this.api.createSession(symbol);
        } catch (error) {
            console.error('Ошибка при инициализации оптимизатора:', error);
            throw error;
        }
    }

    /**
     * Закрытие и очистка ресурсов
     */
    public async close(): Promise<void> {
        try {
            await this.api.disconnect();
            this.currentSymbol = null;
        } catch (error) {
            console.error('Ошибка при закрытии оптимизатора:', error);
            throw error;
        }
    }

    /**
     * Проверка результатов на соответствие параметрам
     */
    private checkResults(results: OptimizationResult['results'], params: OptimizationParams): boolean {
        return (
            results.netProfit >= params.minProfit &&
            results.maxDrawdown <= params.maxDrawdown &&
            results.totalTrades >= params.minTrades &&
            results.winRate >= params.minWinRate
        );
    }

    /**
     * Применение параметров стратегии
     */
    private async applyStrategyParams(params: { [key: string]: number }): Promise<void> {
        if (!this.currentSymbol) {
            throw new Error('Оптимизатор не инициализирован');
        }

        const session = this.api.getSession(this.currentSymbol);
        if (!session) {
            throw new Error('Сессия не найдена');
        }

        // Применяем параметры к стратегии
        await session.study.setInputs(params);
        
        // Ждем обновления результатов
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Получение результатов стратегии
     */
    private async getStrategyResults(): Promise<OptimizationResult['results']> {
        if (!this.currentSymbol) {
            throw new Error('Оптимизатор не инициализирован');
        }

        // Получаем результаты через API
        const results = await this.api.getStrategyResults(this.currentSymbol);
        
        return {
            netProfit: results.netProfit,
            maxDrawdown: results.maxDrawdown,
            totalTrades: results.totalTrades,
            winRate: results.winRate
        };
    }

    /**
     * Оптимизация стратегии
     */
    public async optimize(
        params: OptimizationParams,
        ranges: { [key: string]: { min: number; max: number; step: number } }
    ): Promise<OptimizationResult | null> {
        try {
            let bestResult: OptimizationResult | null = null;

            // Перебираем все комбинации параметров
            for (const [paramName, range] of Object.entries(ranges)) {
                for (let value = range.min; value <= range.max; value += range.step) {
                    try {
                        // Применяем текущие параметры
                        const currentParams = { [paramName]: value };
                        await this.applyStrategyParams(currentParams);

                        // Получаем результаты
                        const results = await this.getStrategyResults();

                        // Проверяем результаты
                        if (this.checkResults(results, params)) {
                            if (!bestResult || results.netProfit > bestResult.results.netProfit) {
                                bestResult = {
                                    inputs: currentParams,
                                    results: results
                                };
                            }
                        }
                    } catch (error) {
                        console.warn(`Ошибка при проверке параметра ${paramName}=${value}:`, error);
                        continue;
                    }
                }
            }

            return bestResult;
        } catch (error) {
            console.error('Ошибка при оптимизации:', error);
            throw error;
        }
    }
}
