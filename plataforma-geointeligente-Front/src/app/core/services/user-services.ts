import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment.development';

// Interfaz opcional para tipar tus usuarios
export interface User {
  idUsuario?: number;       // opcional porque lo genera la BD
  nombreUsuario: string;
  contrasena: string;
  idRol: number;
  activo?: boolean; 
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = `${environment.apiUrl}/api/User`;

  constructor(private http: HttpClient) {}

  // Obtener lista de usuarios
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/GetUsers`);
  }

  // Registrar nuevo usuario
  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/RegisterUser`, user);
  }

  // Actualizar usuario
  
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/UpdateUser/${id}`, user);
}


  // Eliminar usuario
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/DeleteUser/${id}`);
  }
  //Desabilitar usuario
  deactivateUser(id: number): Observable<void> {
  return this.http.put<void>(`${this.baseUrl}/DeactivateUser/${id}`, {});
}
}
