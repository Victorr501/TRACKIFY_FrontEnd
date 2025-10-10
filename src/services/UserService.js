import BaseService from "./BaseService";
import api from './api';

class UserService extends BaseService{
    constructor(){
        super("/users");
    }


}

export default new UserService();