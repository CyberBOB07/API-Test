import { TradingView } from 'tradingview-api';

export interface TradingViewSession {
    chart: any;
    study: any;
}

export class TradingViewAPI {
    private client: any;
    private sessions: Map<string, TradingViewSession>;

    constructor() {
        this.sessions = new Map();
    }

    /**
     * Подключение к TradingView
     */
    public async connect(): Promise<void> {
        try {
            this.client = new TradingView();
            await this.client.connect();
            console.log('Подключено к TradingView API');
        } catch (error) {
            console.error('Ошибка подключения к TradingView:', error);
            throw error;
        }
    }

    /**
     * Отключение от TradingView
     */
    public async disconnect(): Promise<void> {
        try {
            if (this.client) {
                await this.client.disconnect();
                this.sessions.clear();
                console.log('Отключено от TradingView API');
            }
        } catch (error) {
            console.error('Ошибка при отключении от TradingView:', error);
            throw error;
        }
    }

    /**
     * Создание новой сессии для символа
     */
    public async createSession(symbol: string): Promise<TradingViewSession> {
        try {
            if (!this.client) {
                throw new Error('Нет подключения к TradingView API');
            }

            // Создаем новый график
            const chart = await this.client.chart(symbol);
            await chart.setMarket(symbol);

            // Создаем объект для работы с индикаторами
            const study = await chart.study();

            const session = { chart, study };
            this.sessions.set(symbol, session);

            console.log(`Создана сессия для символа ${symbol}`);
            return session;
        } catch (error) {
            console.error(`Ошибка создания сессии для ${symbol}:`, error);
            throw error;
        }
    }

    /**
     * Получение существующей сессии
     */
    public getSession(symbol: string): TradingViewSession | undefined {
        return this.sessions.get(symbol);
    }

    /**
     * Получение исторических данных
     */
    public async getHistory(symbol: string, timeframe: string = '1D', bars: number = 1000): Promise<any[]> {
        const session = this.getSession(symbol);
        if (!session) {
            throw new Error(`Сессия для ${symbol} не найдена`);
        }

        return await session.chart.getHistory(timeframe, bars);
    }

    /**
     * Добавление индикатора на график
     */
    public async addIndicator(symbol: string, name: string, inputs: any = {}): Promise<any> {
        const session = this.getSession(symbol);
        if (!session) {
            throw new Error(`Сессия для ${symbol} не найдена`);
        }

        return await session.study.add(name, inputs);
    }

    /**
     * Получение данных индикатора
     */
    public async getIndicatorData(symbol: string, indicatorId: string): Promise<any> {
        const session = this.getSession(symbol);
        if (!session) {
            throw new Error(`Сессия для ${symbol} не найдена`);
        }

        return await session.study.getData(indicatorId);
    }

    /**
     * Установка параметров индикатора
     */
    public async setIndicatorInputs(symbol: string, indicatorId: string, inputs: any): Promise<void> {
        const session = this.getSession(symbol);
        if (!session) {
            throw new Error(`Сессия для ${symbol} не найдена`);
        }

        await session.study.setInputs(indicatorId, inputs);
    }

    /**
     * Получение результатов стратегии
     */
    public async getStrategyResults(symbol: string): Promise<any> {
        const session = this.getSession(symbol);
        if (!session) {
            throw new Error(`Сессия для ${symbol} не найдена`);
        }

        return await session.chart.getStrategyResults();
    }
}
