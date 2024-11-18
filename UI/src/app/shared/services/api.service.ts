import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject, map } from 'rxjs';
import { Book, BookCategory, Login, Order, User, UserType } from '../../models/models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  baseUrl: string = 'http://localhost:5152/api/Library/';
  userStatus: Subject<string> = new Subject();

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    //this.jwtHelper = localStorage.getItem("access_token");
  }

  register(user: any) {
    return this.http.post(this.baseUrl + 'Register', user, {
      responseType: 'text',
    });
  }

  login(info: Login) {

    console.log("info : ",info);

    
    return this.http.post<any>('http://localhost:5152/api/Library/Login',info);
 
  }

  isLoggedIn(): boolean {
    if (
      localStorage.getItem('access_token') != null &&
      !this.jwtHelper.isTokenExpired()
    )
      return true;
    return false;
  }

  getUserInfo(): User | null {
    //if (!this.isLoggedIn()) return null;
    const token:any = localStorage.getItem('access_token');
    console.log(token);
    var decodedToken = this.jwtHelper.decodeToken(token);
    console.log(decodedToken);
    var user: User = {
      id: decodedToken.id,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName,
      email: decodedToken.email,
      mobileNumber: decodedToken.mobileNumber,
      userType: UserType[decodedToken.userType as keyof typeof UserType],
      accountStatus: decodedToken.accountStatus,
      createdOn: decodedToken.createdOn,
      password: '',
    };
    return user;
  }

  logOut() {
    localStorage.removeItem('access_token');
    this.userStatus.next('loggedOff');
  }

  getBooks() {
    return this.http.get<Book[]>(this.baseUrl + 'GetBooks');
  }

  orderBook(book: Book) {
    let userId = this.getUserInfo()!.id;
    let params = new HttpParams()
      .append('userId', userId)
      .append('bookId', book.id);

    return this.http.post(this.baseUrl + 'OrderBook', null, {
      params: params,
      responseType: 'text',
    });
  }

  getOrdersOfUser(userId: number) {
    let params = new HttpParams().append('userId', userId);
    return this.http
      .get<any>(this.baseUrl + 'GetOrdersOfUser', {
        params: params,
      })
      .pipe(
        map((orders) => {
          let newOrders = orders.map((order: any) => {
            let newOrder: Order = {
              id: order.id,
              userId: order.userId,
              userName: order.user.firstName + ' ' + order.user.lastName,
              bookId: order.bookId,
              bookTitle: order.book.title,
              orderDate: order.orderDate,
              returned: order.returned,
              returnDate: order.returnDate,
              finePaid: order.finePaid,
            };
            return newOrder;
          });
          return newOrders;
        })
      );
  }

  getFine(order: Order) {
    let today = new Date();
    let orderDate = new Date(Date.parse(order.orderDate));
    orderDate.setDate(orderDate.getDate() + 10);
    if (orderDate.getTime() < today.getTime()) {
      var diff = today.getTime() - orderDate.getTime();
      let days = Math.floor(diff / (1000 * 86400));
      return days * 50;
    }
    return 0;
  }

  addNewCategory(category: BookCategory) {
    return this.http.post(this.baseUrl + 'AddCategory', category, {
      responseType: 'text',
    });
  }

  getCategories() {
    return this.http.get<BookCategory[]>(this.baseUrl + 'GetCategories');
  }

  addBook(book: Book) {
    return this.http.post(this.baseUrl + 'AddBook', book, {
      responseType: 'text',
    });
  }

  deleteBook(id: number) {
    return this.http.delete(this.baseUrl + 'DeleteBook', {
      params: new HttpParams().append('id', id),
      responseType: 'text',
    });
  }

  returnBook(userId: string, bookId: string, fine: number) {
    return this.http.get(this.baseUrl + 'ReturnBook', {
      params: new HttpParams()
        .append('userId', userId)
        .append('bookId', bookId)
        .append('fine', fine),
      responseType: 'text',
    });
  }

  getUsers() {
    return this.http.get<User[]>(this.baseUrl + 'GetUsers');
  }

  
  approveRequest(userId: number) {
    return this.http.get(this.baseUrl + 'ApproveRequest', {
      params: new HttpParams().append('userId', userId),
      responseType: 'text',
    });
  }

  getOrders() {
    return this.http.get<any>(this.baseUrl + 'GetOrders').pipe(
      map((orders) => {
        let newOrders = orders.map((order: any) => {
          let newOrder: Order = {
            id: order.id,
            userId: order.userId,
            userName: order.user.firstName + ' ' + order.user.lastName,
            bookId: order.bookId,
            bookTitle: order.book.title,
            orderDate: order.orderDate,
            returned: order.returned,
            returnDate: order.returnDate,
            finePaid: order.finePaid,
          };
          return newOrder;
        });
        return newOrders;
      })
    );
  }

  sendEmail() {
    return this.http.get(this.baseUrl + 'SendEmailForPendingReturns', {
      responseType: 'text',
    });
  }

  blockUsers() {
    return this.http.get(this.baseUrl + 'BlockFineOverdueUsers', {
      responseType: 'text',
    });
  }

  unblock(userId: number) {
    return this.http.get(this.baseUrl + "Unblock", {
      params: new HttpParams().append("userId", userId),
      responseType: "text",
    });
  }
}
