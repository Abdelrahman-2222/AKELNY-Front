// TypeScript
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;
  private connectionEstablished = new BehaviorSubject<boolean>(false);

  private orderRequestSubject = new BehaviorSubject<any>(null);
  private orderAcceptedSubject = new BehaviorSubject<any>(null);
  private orderRejectedSubject = new BehaviorSubject<any>(null);
  private orderPaidSubject = new BehaviorSubject<any>(null);
  private orderPaymentCancelledSubject = new BehaviorSubject<any>(null);
  private orderStatusUpdateSubject = new BehaviorSubject<any>(null);

  // Track joined groups to rejoin after reconnect
  private joinedChefGroups = new Set<string>();
  private joinedCustomerGroups = new Set<string>();

  constructor() {
    this.createConnection();
    this.startConnection();
    this.registerSignalREvents();
    this.registerConnectionLifecycle();
  }

  private createConnection(): void {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7045/orderHub', {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .build();
  }

  private startConnection(): void {
    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connection established');
        this.connectionEstablished.next(true);
      })
      .catch(err => {
        console.error('Error establishing SignalR connection:', err);
        this.connectionEstablished.next(false);
      });
  }

  private registerConnectionLifecycle(): void {
    this.hubConnection.onreconnecting(err => {
      console.warn('SignalR reconnecting:', err);
      this.connectionEstablished.next(false);
    });

    this.hubConnection.onreconnected(id => {
      console.log('SignalR reconnected:', id);
      this.connectionEstablished.next(true);
      this.rejoinGroups();
    });

    this.hubConnection.onclose(err => {
      console.warn('SignalR closed:', err);
      this.connectionEstablished.next(false);
    });
  }

  private rejoinGroups(): void {
    this.joinedChefGroups.forEach(id => {
      this.hubConnection.invoke('JoinChefGroup', id).catch(e => console.error('Rejoin chef group failed:', e));
    });
    this.joinedCustomerGroups.forEach(id => {
      this.hubConnection.invoke('JoinCustomerGroup', id).catch(e => console.error('Rejoin customer group failed:', e));
    });
  }

  private registerSignalREvents(): void {
    this.hubConnection.on('ReceiveOrderRequest', (orderData) => {
      console.log('Received order request:', orderData);
      this.orderRequestSubject.next(orderData);
    });

    this.hubConnection.on('OrderAccepted', (response) => {
      console.log('Order accepted:', response);
      this.orderAcceptedSubject.next(response);
    });

    this.hubConnection.on('OrderRejected', (response) => {
      console.log('Order rejected:', response);
      this.orderRejectedSubject.next(response);
    });

    this.hubConnection.on('OrderPaid', (notification) => {
      console.log('Order paid:', notification);
      this.orderPaidSubject.next(notification);
    });

    this.hubConnection.on('OrderPaymentCancelled', (notification) => {
      console.log('Order payment cancelled:', notification);
      this.orderPaymentCancelledSubject.next(notification);
    });

    this.hubConnection.on('OrderStatusUpdate', (update) => {
      console.log('Order status update:', update);
      this.orderStatusUpdateSubject.next(update);
    });
  }

  // Observables
  getOrderRequests(): Observable<any> {
    return this.orderRequestSubject.asObservable();
  }
  getOrderAccepted(): Observable<any> {
    return this.orderAcceptedSubject.asObservable();
  }
  getOrderRejected(): Observable<any> {
    return this.orderRejectedSubject.asObservable();
  }
  getOrderPaidNotifications(): Observable<any> {
    return this.orderPaidSubject.asObservable();
  }
  getOrderPaymentCancelledNotifications(): Observable<any> {
    return this.orderPaymentCancelledSubject.asObservable();
  }
  getOrderStatusUpdates(): Observable<any> {
    return this.orderStatusUpdateSubject.asObservable();
  }
  getConnectionStatus(): Observable<boolean> {
    return this.connectionEstablished.asObservable();
  }

  // Group management
  joinChefGroup(chefId: string): void {
    if (!chefId) return;
    this.joinedChefGroups.add(chefId);

    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('JoinChefGroup', chefId)
        .catch(err => console.error('Error joining chef group:', err));
    } else {
      const sub = this.connectionEstablished.subscribe(ok => {
        if (ok) {
          this.hubConnection.invoke('JoinChefGroup', chefId)
            .catch(err => console.error('Error joining chef group after connect:', err));
          sub.unsubscribe();
        }
      });
    }
  }

  leaveChefGroup(chefId: string): void {
    if (!chefId) return;
    this.joinedChefGroups.delete(chefId);

    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('LeaveChefGroup', chefId)
        .catch(err => console.error('Error leaving chef group:', err));
    }
  }

  joinCustomerGroup(customerId: string): void {
    if (!customerId) return;
    this.joinedCustomerGroups.add(customerId);

    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('JoinCustomerGroup', customerId)
        .catch(err => console.error('Error joining customer group:', err));
    } else {
      const sub = this.connectionEstablished.subscribe(ok => {
        if (ok) {
          this.hubConnection.invoke('JoinCustomerGroup', customerId)
            .catch(err => console.error('Error joining customer group after connect:', err));
          sub.unsubscribe();
        }
      });
    }
  }

  leaveCustomerGroup(customerId: string): void {
    if (!customerId) return;
    this.joinedCustomerGroups.delete(customerId);

    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('LeaveCustomerGroup', customerId)
        .catch(err => console.error('Error leaving customer group:', err));
    }
  }

  // // Server invocations (rename to match your hub methods)
  // acceptOrder(orderId: string | number): Promise<void> {
  //   return this.hubConnection.invoke('AcceptOrder', orderId);
  // }
  // rejectOrder(orderId: string | number): Promise<void> {
  //   return this.hubConnection.invoke('RejectOrder', orderId);
  // }
  // updateOrderStatus(orderId: string | number, status: string): Promise<void> {
  //   return this.hubConnection.invoke('UpdateOrderStatus', { orderId, status });
  // }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          console.log('SignalR connection stopped');
          this.connectionEstablished.next(false);
        })
        .catch(err => console.error('Error stopping connection:', err));
    }
  }
}
