import BaseService from "./BaseService";


class UserService extends BaseService{
    constructor(){
        super("/users");
    }

    async changePassword(userId, oldPassword, newPassword){
        try{
            const payload = {
                old_password: oldPassword,
                new_password: newPassword,
            };

            console.log("PUT:", `${this.endpoint}/${userId}/password`, payload);

            const response = await this.api.put(
                `${this.endpoint}/${userId}/password`, 
                payload
            );
            return response.data;
        }catch(error){
            console.error("Error al cambiar contraseña: ", error.response?.data || error);
        }
    }   
}

export default new UserService();