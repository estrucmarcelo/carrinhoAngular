import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

import { Product } from '../models/product';
import { Category } from '../models/categories';
import { Constants } from '../constants';
import * as Categories from '../json-data/delivery-amount.json';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})

export class CartComponent implements OnInit, OnDestroy {
  cartItems: Product[] = [];
  options = Constants.quantityOptions;
  additionalBenfits = Constants.additionalbenfits;
  totalItemsPrice: number = 0;
  categories: Category[] = (Categories as any).default;
  specialDayDate = Constants.specialDayDate;
  specialDay: boolean = false;
  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cartItems = localStorage.getItem('user-items') ? JSON.parse(localStorage.getItem('user-items') as string) : [];
    this.arrangeData();
  }

  ngOnDestroy(): void {
    if (this.cartItems.length > 0) {
      localStorage.setItem('user-items', JSON.stringify(this.cartItems))
    } else {
      localStorage.removeItem('user-items')
    }
  }

  //re arraging cart items with price,category..etc & checking for special day
  arrangeData() {
    let date = new Date().getDate();
    let month = new Date().getMonth();
    // date = 15; month = 7;
    console.log(date, month, 49);
    let actualDiscount = 1;
    this.cartItems.map((item: any) => {
      if (this.specialDayDate.date === date && this.specialDayDate.month === month) {
        actualDiscount = (item.discount + item.specialDayDiscount);
        this.specialDay = true;
      } else {
        actualDiscount = item.discount;
        this.specialDay = false;

      }
      let findInd: any = this.categories.findIndex((item2: any) => item2.id === item.categoryId);
      item.categoryName = this.categories[findInd].category;
      item.totalPrice = ((item.cost * item.quantity) - ((item.cost * item.quantity * actualDiscount) / 100));
      return item;
    });
    this.calculateTotalCost();
  }

  //total cost of all items
  calculateTotalCost() {
    let totalAmt: any = this.cartItems.length > 0 ? this.cartItems.map(item => item.totalPrice).reduce((prev: any, next: any) => prev + next) : 0;
    this.totalItemsPrice = totalAmt;
  }

  //on quantity changes arranging cart items
  handleQuantitySelect(eve: any, item: any, type: string) {
    if (type == 'add') {
      this.cartItems.map((data: any) => {
        if (data.id === item.id) {
          data.quantity = parseInt(eve)
        }
        return data;
      });
    } else {
      let findInd = this.cartItems.findIndex(data => data.id === item.id);
      this.cartItems.splice(findInd, 1);
    }
    this.arrangeData();
  }

  handleButtonClick(type: string) {
    if (type === 'add') {
      this.router.navigate(['/'])
    } else {
      this.generateBill();
    }
  }

  //generate bill
  generateBill() {
    let charges: number = 0, additionalBenfitsPrice: number = 0;
    //charges
    let categoriesList = [...new Set(this.cartItems.map(item => item.categoryId))];
    categoriesList.map(item => {
      let ite = this.categories.find(obj => obj.id === item);
      if (ite) { charges = charges + ite.charge }
    })

    //total amount after 
    if ((this.totalItemsPrice + charges) > this.additionalBenfits.totalItemsPrice) {
      additionalBenfitsPrice = (((this.totalItemsPrice + charges) * this.additionalBenfits.additionalDiscount) / 100)
    }

    let docDefinition: any = {
      content: [
        {
          text: 'Hi,Your Billing Details',
          fontSize: 16,
          alignment: 'center',
          color: '#047886',
        },
        {
          text: 'Your Bill',
          fontSize: 14,
          bold: true,
          alignment: 'center',
          decoration: 'underline',
          color: 'skyblue',
        },
        {
          text: `Date: ${new Date().toLocaleString()}`,
          alignment: 'right',
        },
        {
          text: `Bill No : ${(Math.random() * 1000).toFixed(0)}`,
          alignment: 'left',
        },
        {
          text: 'Order Details',
          style: 'sectionHeader',
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Product', 'Category', 'Quantity', 'Cost per unit (₹)', 'Discount %', 'Special Day Discount %', 'Total Price (₹)'],
              ...this.cartItems.map((item: any) => {
                let specialDayDiscount = this.specialDay ? item.specialDayDiscount : '-'
                return [item.productName.toUpperCase(), item.categoryName, item.quantity, item.cost, item.discount, specialDayDiscount, item.totalPrice.toFixed(2)]
              }),
              [
                { text: 'Shipping Charges (₹)', colSpan: 3 },
                {}, {}, {}, {}, {}, (charges).toFixed(2)
              ],
              [
                { text: 'Total Items Price (₹)', colSpan: 3 },
                {}, {}, {}, {}, {}, (this.totalItemsPrice + charges).toFixed(2)
              ],
              [
                { text: 'Additional Discounts on purchasing more than  ₹' + this.additionalBenfits.totalItemsPrice, colSpan: 4 },
                {},
                {},
                {},
                { text: additionalBenfitsPrice ? this.additionalBenfits.additionalDiscount : '-' },
                {},
                { text: additionalBenfitsPrice ? additionalBenfitsPrice : '-' },
              ],
              [
                { text: 'Total Amount (₹)', colSpan: 3 }, {}, {}, {}, {}, {},
                (((this.totalItemsPrice + charges) - additionalBenfitsPrice)).toFixed(2),
              ],
            ],
          },
        },
        {
          columns:
            [{ text: 'Signature', style: 'signaturestyle' }],
        },
        {
          columns:
            [{ text: 'Thank you,shop again! ', style: 'footerContent' }],
        },
      ],
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15, 0, 15],
        },
        signaturestyle: {
          margin: [0, 50, 0, 50],
          alignment: 'right',
          italics: true,
        },
        footerContent: {
          position: 'fixed',
          bottom: '10px',
          alignment: 'center'
        }
      },
    };
    pdfMake.createPdf(docDefinition).download();
    this.makeCartEmpty();
  }

  //saving purchased items  
  makeCartEmpty() {
    let puchasedTimeStamp = Date.now();
    this.cartItems.map((item: any) => {
      item.purchasedOn = {
        date: new Date().getDate(),
        month: (new Date().getMonth()).toString().length < 10 ? (new Date().getMonth()) + 1 : (new Date().getMonth()),
        year: new Date().getFullYear()
      }
      item.puchasedTimeStamp = puchasedTimeStamp;
      return item;
    });
    let getDataofPurchasedItems = JSON.parse(localStorage.getItem('user-items-purchased') as string), newItems: any = [];
    if (getDataofPurchasedItems) {
      newItems = newItems.concat(getDataofPurchasedItems)
    }
    newItems = newItems.concat(this.cartItems)
    localStorage.removeItem('user-items');
    localStorage.setItem('user-items-purchased', JSON.stringify(newItems));
    this.cartItems = [];
  }

  //navigate
  goToDashboard() {
    this.router.navigate(['/dashboard'])
  }
}
