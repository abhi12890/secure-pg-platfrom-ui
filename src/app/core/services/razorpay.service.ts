import { Injectable, inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { PaymentInitiateResponse, RazorpayOptions } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class RazorpayService {
  private readonly api = inject(ApiService);
  private scriptLoaded = false;

  payInvoice(invoiceId: string, description: string, email: string): Observable<void> {
    return this.api.initiatePayment(invoiceId).pipe(
      switchMap((init) => this.loadScript().then(() => init)),
      switchMap((init) => from(this.openCheckout(init, description, email)))
    );
  }

  private loadScript(): Promise<void> {
    if (this.scriptLoaded) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = environment.razorpayCheckoutScript;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
      document.body.appendChild(script);
    });
  }

  private openCheckout(
    init: PaymentInitiateResponse,
    description: string,
    email: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: RazorpayOptions = {
        key: init.razorpayKeyId,
        amount: init.amountPaisa,
        currency: init.currency,
        name: 'Secure PG Residence',
        description,
        order_id: init.razorpayOrderId,
        prefill: { email },
        theme: { color: '#0f2744' },
        method: { upi: true, card: true, netbanking: false, wallet: true, emi: false },
        handler: () => resolve(),
        modal: {
          confirm_close: true,
          ondismiss: () => reject(new Error('Payment cancelled'))
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }
}
