import api from './api.js';

export default class BaseService{
    constructor(endpoint){
        this.endpoint = endpoint;
    }

    //Obtener todos
    async getAll(){
        const response = await api.get(this.endpoint);
        return response.data;
    }

    //Obetner por ID
    async getById(id){
        const response = await api.get(`${this.endpoint}/${id}`);
        return response.data;
    }

    //Crear nuevo
    async create(data){
        const response = await api.post(this.endpoint, data);
        return response.data;
    }

    //Actualizar existente
    async update(id, data){
        const response = await api.put(`${this.endpoint}/${id}`, data);
        return response.data;
    }

    //Eliminar
    async delete(id){
        const response = await api.delete(`${this.endpoint}/${id}`);
        return response.data;
    }
}