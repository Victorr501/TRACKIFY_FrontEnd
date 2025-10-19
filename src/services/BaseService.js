import api from './Api.js';

export default class BaseService{
    constructor(endpoint){
        this.endpoint = endpoint;
        this.api = api;
    }

    //Obtener todos
    async getAll(){
        const response = await this.api.get(this.endpoint);
        return response.data;
    }

    //Obetner por ID
    async getById(id){
        const response = await this.api.get(`${this.endpoint}/${id}`);
        return response.data;
    }

    //Crear nuevo
    async create(data){
        const response = await this.api.post(`${this.endpoint}/`, data);
        return response.data;
    }

    //Actualizar existente
    async update(id, data){
        console.log("📡 PUT:", `${this.endpoint}/${id}`, data);
        const response = await this.api.put(`${this.endpoint}/${id}`, data);
        return response.data;
    }

    //Eliminar
    async delete(id){
        const response = await this.api.delete(`${this.endpoint}/${id}`);
        return response.data;
    }
}