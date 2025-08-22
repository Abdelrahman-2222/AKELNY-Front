import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private hubConnection!: signalR.HubConnection;
  private connectionEstablished = new BehaviorSubject<boolean>(false);

  private orderRequestSubject = new BehaviorSubject<any>(null);
  private orderAcceptedSubject = new BehaviorSubject<any>(null);
  private orderRejectedSubject = new BehaviorSubject<any>(null);
  private orderPaidSubject = new BehaviorSubject<any>(null);
  private orderPaymentCancelledSubject = new BehaviorSubject<any>(null);
  private orderStatusUpdateSubject = new BehaviorSubject<any>(null);

  private joinedChefGroups = new Set<string>();
  private joinedCustomerGroups = new Set<string>();

  constructor() {
    this.createConnection();
    this.startConnection();
    this.registerSignalREvents();
    this.registerConnectionLifecycle();

    window.addEventListener('storage', (e) => {
      if (e.key === 'token' || e.key === 'authToken') {
        this.restartWithNewToken();
      }
    });
  }

  private getToken(): string | null {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('authToken')
    );
  }

  private createConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalrUrl}/orderHub`, {
        accessTokenFactory: () => this.getToken() || ''
      })
      .withAutomaticReconnect()
      .build();
  }

  private startConnection(): void {
    this.hubConnection
      .start()
      .then(() => this.connectionEstablished.next(true))
      .catch(() => this.connectionEstablished.next(false));
  }

  private restartWithNewToken(): void {
    if (!this.hubConnection) return;
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) return;
    this.createConnection();
    this.startConnection();
  }

  private registerConnectionLifecycle(): void {
    this.hubConnection.onreconnecting(() => this.connectionEstablished.next(false));
    this.hubConnection.onreconnected(() => {
      this.connectionEstablished.next(true);
      this.rejoinGroups();
    });
    this.hubConnection.onclose(() => this.connectionEstablished.next(false));
  }

  private rejoinGroups(): void {
    this.joinedChefGroups.forEach(id => {
      this.hubConnection.invoke('JoinChefGroup', id).catch(console.error);
    });
    this.joinedCustomerGroups.forEach(id => {
      this.hubConnection.invoke('JoinCustomerGroup', id).catch(console.error);
    });
  }

  private registerSignalREvents(): void {
    this.hubConnection.on('ReceiveOrderRequest', (orderData) => this.orderRequestSubject.next(orderData));
    this.hubConnection.on('OrderAccepted', (r) => {
      this.orderAcceptedSubject.next(r);
      const id = r?.orderId ?? r?.id;
      if (id) this.orderStatusUpdateSubject.next({ orderId: id, status: 'accepted' });
    });
    this.hubConnection.on('OrderRejected', (r) => {
      this.orderRejectedSubject.next(r);
      const id = r?.orderId ?? r?.id;
      if (id) this.orderStatusUpdateSubject.next({ orderId: id, status: 'rejected' });
    });
    this.hubConnection.on('OrderPaid', (n) => {
      this.orderPaidSubject.next(n);
      const id = n?.orderId ?? n?.id;
      if (id) this.orderStatusUpdateSubject.next({ orderId: id, status: 'paid' });
    });
    this.hubConnection.on('OrderPaymentCancelled', (n) => {
      this.orderPaymentCancelledSubject.next(n);
      const id = n?.orderId ?? n?.id;
      if (id) this.orderStatusUpdateSubject.next({ orderId: id, status: 'cancelled' });
    });
    this.hubConnection.on('OrderStatusUpdate', (u) => this.orderStatusUpdateSubject.next(u));
  }

  getOrderRequests(): Observable<any> { return this.orderRequestSubject.asObservable(); }
  getOrderAccepted(): Observable<any> { return this.orderAcceptedSubject.asObservable(); }
  getOrderRejected(): Observable<any> { return this.orderRejectedSubject.asObservable(); }
  getOrderPaidNotifications(): Observable<any> { return this.orderPaidSubject.asObservable(); }
  getOrderPaymentCancelledNotifications(): Observable<any> { return this.orderPaymentCancelledSubject.asObservable(); }
  getOrderStatusUpdates(): Observable<any> { return this.orderStatusUpdateSubject.asObservable(); }
  getConnectionStatus(): Observable<boolean> { return this.connectionEstablished.asObservable(); }

  joinChefGroup(chefId: string): void {
    if (!chefId) return;
    this.joinedChefGroups.add(chefId);
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('JoinChefGroup', chefId).catch(console.error);
    } else {
      const sub = this.connectionEstablished.subscribe(ok => {
        if (ok) {
          this.hubConnection.invoke('JoinChefGroup', chefId).catch(console.error);
          sub.unsubscribe();
        }
      });
    }
  }

  leaveChefGroup(chefId: string): void {
    if (!chefId) return;
    this.joinedChefGroups.delete(chefId);
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('LeaveChefGroup', chefId).catch(console.error);
    }
  }

  joinCustomerGroup(customerId: string): void {
    if (!customerId) return;
    this.joinedCustomerGroups.add(customerId);
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('JoinCustomerGroup', customerId).catch(console.error);
    } else {
      const sub = this.connectionEstablished.subscribe(ok => {
        if (ok) {
          this.hubConnection.invoke('JoinCustomerGroup', customerId).catch(console.error);
          sub.unsubscribe();
        }
      });
    }
  }

  leaveCustomerGroup(customerId: string): void {
    if (!customerId) return;
    this.joinedCustomerGroups.delete(customerId);
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('LeaveCustomerGroup', customerId).catch(console.error);
    }
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => this.connectionEstablished.next(false))
        .catch(console.error);
    }
  }
}
