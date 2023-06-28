import { Component } from '@angular/core';
import { Product } from '../models/product';
import { ToastService } from '../services/toast.service';
import { Constants } from '../constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent {
  userPurchasedItems: Product[] = JSON.parse(localStorage.getItem('user-items-purchased') as string);
  purchasedItems: Product[] = [];
  yearOptions: Array<number> = [];
  monthOptions: Array<number> = [];
  selected = { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
  showDetails: boolean = false;

  constructor(private toaster: ToastService) {
    this.yearOptions = Array(new Date().getFullYear() + 1 - 2000).fill(2000).map((n, i) => {
      return new Date().getFullYear() - i
    });
    this.monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
    this.getSelectedDate('get');
  }

  // filtering puchased items on date selection 
  getSelectedDate(type: string) {
    this.purchasedItems = [];
    this.showDetails = false;
    this.userPurchasedItems?.filter((item: any) => {
      let editedMonth = ((this.selected.month).toString().length < 10 ? '0' + this.selected.month : this.selected.month)
      if (item.purchasedOn.month == editedMonth && item.purchasedOn.year == this.selected.year) {
        this.purchasedItems.push(item)
      }
    })
    if (this.purchasedItems.length == 0 && !type) {
      this.toaster.showToast(Constants.monthNoData)
    }
  }

  //purchased list show/hide
  getDetails() {
    this.showDetails = !this.showDetails;
  }
}
