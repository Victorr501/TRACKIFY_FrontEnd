import BaseService from './BaseService';

class HabitService extends BaseService {
    constructor() {
        super('/habits');
    }
}

export default new HabitService();