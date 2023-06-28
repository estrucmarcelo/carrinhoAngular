export interface Product {
    quantity: number;
    id: number,
    productName: string,
    categoryId: number,
    cost: number,
    discount: number,
    specialDayDiscount: number,
    addedToCart: boolean;
    totalPrice?: number,
    categoryName?: string
    puchasedTimeStamp?: number
}
