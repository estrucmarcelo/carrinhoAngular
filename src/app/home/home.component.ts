import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import * as Products from '../json-data/productsdata.json';
import * as CategoriesList from '../json-data/delivery-amount.json';
import { Product } from '../models/product';
import { ToastService } from '../services/toast.service';
import { Constants } from '../constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  items: Product[] = (Products as any).default;
  cartItems: Array<Object> = [];
  cols: any | undefined;
  categories: any = (CategoriesList as any).default
  currentDate: any = { date: new Date().getDate(), month: new Date().getMonth() };
  specialDay: boolean = false;

  constructor(
    private router: Router,
    private toaster: ToastService
  ) {
    if (this.currentDate.date == Constants.specialDayDate.date && this.currentDate.month == Constants.specialDayDate.month) {
      this.specialDay = true;
    } else {
      this.specialDay = false;
    }
    // re arranging the items list if cart items exist
    this.cartItems = localStorage.getItem('user-items') ? JSON.parse(localStorage.getItem('user-items') as string) : [];
    this.items.map((item: any) => {
      let ind = this.cartItems.findIndex((data: any) => data.id === item.id);
      let categoryData = this.categories.find((data: any) => data.id == item.categoryId);
      if (ind > -1) {
        item.addedToCart = true;
      } else {
        item.addedToCart = false;
      }
      if (Object.keys(categoryData).length > 0) {
        item.categoryName = categoryData.category
      }
      item.totalPrice = (item.cost - ((item.cost * item.discount) / 100)).toFixed(2);
      return item;
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.goToCart();
  }

  //handle add cart items
  handleAddToCart(item: any) {
    if (this.cartItems.length > 0) {
      let ind = this.cartItems.findIndex((data: any) => data.id === item.id);
      if (ind > -1) {
        this.toaster.showToast(Constants.addedTocart)
      } else {
        this.pushArrayData(item);
      }
    } else {
      this.pushArrayData(item);
    }
  }

  //adding item to cart
  pushArrayData(item: any) {
    this.items.map((data: any) => {
      if (data.id === item.id) {
        item.addedToCart = true;
      }
      return item;
    })
    this.cartItems.push(item);
    localStorage.setItem('user-items', JSON.stringify(this.cartItems))
  }

  //navigate
  goToCart() {
    if (this.cartItems.length > 0) {
      localStorage.setItem('user-items', JSON.stringify(this.cartItems))
    } else {
      localStorage.removeItem('user-items')
    }
    this.router.navigate(['/cart'])
  }
}
