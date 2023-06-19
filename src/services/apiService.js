import axios, { type AxiosResponse } from 'axios'
const apiUrl: string = process.env.API_URL ?? 'http://localhost'
const apiPort: string = process.env.API_PORT ?? '3001'

class Api {
  baseUrl: string
  constructor (baseUrl: string) { // aqui va la url de la api base
    this.baseUrl = baseUrl
  }

  async get<T = never, R = AxiosResponse<T>> (path: string): Promise<R> {
    const url = `${this.baseUrl}${path}`
    const response = await axios.get(url)
    return response.data
  }

  async post<T = never, R = AxiosResponse<T>> (path: string, data: JSON): Promise<R> {
    const url = `${this.baseUrl}${path}`
    const response = await axios.post(url, data)
    return response.data
  }

  async put<T = never, R = AxiosResponse<T>> (path: string, data: JSON): Promise<R> {
    const url = `${this.baseUrl}${path}`
    const response = await axios.put(url, data)
    return response.data
  }

  async delete<T = never, R = AxiosResponse<T>> (path: string): Promise<R> {
    const url = `${this.baseUrl}${path}`
    const response = await axios.delete(url)
    return response.data
  }
}

const apiClient = new Api(`${apiUrl}:${apiPort}`)
export default apiClient
