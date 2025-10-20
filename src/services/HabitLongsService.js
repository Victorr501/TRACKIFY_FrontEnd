import BaseService from './BaseService';

class HabitLogsService extends BaseService {
    constructor() {
        super('/habit_logs');
    }

    async getUserLogs(userId) {
        if (!userId) {
            throw new Error('Se requiere el ID del usuario para obtener sus registros.');
        }

        const response = await this.api.get(`${this.endpoint}/user/${userId}`);
        return response.data;
    }

    async getSummary(params = {}) {
        const response = await this.api.get(`${this.endpoint}/summary`, { params });
        return response.data;
    }
}

export default new HabitLogsService();