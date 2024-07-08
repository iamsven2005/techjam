import { type ClassValue, clsx } from "clsx";
import type { shoppingCartItemProps } from "const";
import { twMerge } from "tailwind-merge";

// import _ from 'lodash';
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function currencyFormat(num: number | string) {
	return Number.parseFloat(`${num}`)
		.toFixed(2)
		.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

export function calcCartItemSum(cartItems: shoppingCartItemProps[]) {
	const sum = cartItems.reduce((prev, item) => {
		const qty = item.quantity;
		return prev + qty;
	}, 0);
	return Math.round(sum);
}

export function calcCartItemTotalPrice(cartItems: shoppingCartItemProps[]) {
	const sum = cartItems.reduce((prev, item) => {
		const qty = item.quantity;
		const unitPrice = Number.parseFloat(item.price);
		const total = qty * unitPrice;
		return prev + total;
	}, 0);
	return roundAt2DecimalPlaces(sum);
}

export function roundAt2DecimalPlaces(num: number) {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function roundHalf(num: number) {
	return Math.round(num * 2) / 2;
}

export function isInDesiredForm(str: string) {
	const n = Math.floor(Number(str));
	return n !== Infinity && String(n) === str && n >= 0;
}

export function upperCaseEachWord(str: string) {
	return str.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

export function checkIsValidInteger(str: string) {
	return /^[0-9]+$/.test(str);
}