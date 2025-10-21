import BaseService from './BaseService';

class HabitService extends BaseService {
    constructor() {
        super('/habits');
    }

    async getUserHabits(userId) {
        if (!userId) {
            throw new Error('Se requiere el ID del usuario para obtener sus hábitos.');
        }

        const response = await this.api.get(`${this.endpoint}/user/${userId}`);
        return response.data;
    }
}

export default new HabitService();