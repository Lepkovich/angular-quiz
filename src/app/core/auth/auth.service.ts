import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {LoginResponseType} from "../../../types/login-response.type";
import {Observable, Subject, tap} from "rxjs";
import {UserInfoType} from "../../../types/user-info.type";
import {LogoutResponseType} from "../../../types/logout-response.type";
import {SignupResponseType} from "../../../types/signup-response.type";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public accessTokenKey: string = 'accessToken';
  private refreshTokenKey: string = 'refreshToken';
  private userInfoKey: string = 'userInfo';
  private userEmail: string = 'userEmail';

  public isLogged$: Subject<boolean> = new Subject<boolean>(); //для передачи в другие компоненты
  private isLogged: boolean = false;


  constructor(private http: HttpClient) {
    this.isLogged = !!localStorage.getItem(this.accessTokenKey); //!! даст булевое значение вместо строкового
  }

  login(email: string, password: string): Observable<LoginResponseType> {
    return this.http.post<LoginResponseType>(environment.apiHost + 'login', {
      email,
      password,
    })
      .pipe(
        tap((data: LoginResponseType) => {
          if (data.fullName && data.userId && data.accessToken && data.refreshToken && data.email) {
            this.setUserInfo({
              fullName: data.fullName,
              userId: data.userId,
            });
            this.setTokens(data.accessToken, data.refreshToken);
            this.setUserEmail(data.email);
          }
        })
      );
  }

  signup(name: string, lastName: string, email: string, password: string): Observable<SignupResponseType> {
    return this.http.post<SignupResponseType>(environment.apiHost + 'signup', {
      name,
      lastName,
      email,
      password
    });
  }

  logout(): Observable<LogoutResponseType> {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
    return this.http.post<LogoutResponseType>(environment.apiHost + 'logout', {refreshToken});
  }

  public getLoggedIn(): boolean {
    return this.isLogged; //функция для проверки извне (header) состояния авторизации
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLogged = true;
    this.isLogged$.next(true); //меняем состояние obs для слушателей в других компонентах
  }

  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLogged = false;
    this.isLogged$.next(false); //меняем состояние obs для слушателей в других компонентах
  }

  public setUserInfo(info: UserInfoType): void {
    localStorage.setItem(this.userInfoKey, JSON.stringify(info)); //хранить объект в localStorage нельзя, поэтому преобразуем пользователя в строку
  }

  public removeUserInfo(): void {
    localStorage.removeItem(this.userInfoKey);
  }

  public getUserInfo(): UserInfoType | null {
    const userInfo: string | null = localStorage.getItem(this.userInfoKey);
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    return null;
  }

  public getTokens(): {accessToken: string | null, refreshToken: string | null} {

    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey)
    }
  }
  public setUserEmail(email: string | undefined): void { // дописывал сам
    if (email) {
      localStorage.setItem(this.userEmail, email);
    } else {
      localStorage.setItem(this.userEmail, 'none'); //если email не пришел, запишем в localStorage 'none'
    }
  }

  public getUserEmail(): string | null { // дописывал сам
    const userEmail = localStorage.getItem(this.userEmail);
    if (userEmail) {
      return userEmail;
    }
    return null;
  }
}
