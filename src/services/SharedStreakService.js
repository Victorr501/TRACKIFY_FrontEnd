import BaseService from './BaseService';

class SharedStreakService extends BaseService {
    constructor() {
        super('/shared-streaks');
    }

    async getUserSharedStreaks(userId) {
        if (!userId) {
            throw new Error('Se requiere el ID del usuario para obtener streaks compartidos.');
        }

        const response = await this.api.get(`${this.endpoint}/user/${userId}`);
        return response.data;
    }

    async getSharedStreakBetweenUsers(user1Id, user2Id) {
        if (!user1Id || !user2Id) {
            throw new Error('Se requieren ambos IDs de usuario para obtener el streak compartido.');
        }

        const response = await this.api.get(`${this.endpoint}/users/${user1Id}/${user2Id}`);
        return response.data;
    }
}

export default new SharedStreakService();