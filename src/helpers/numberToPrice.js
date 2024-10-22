import { store } from 'redux/store';

export default function numberToPrice(number = 0, symbol, position) {
  const defaultCurrency = store.getState()?.currency?.defaultCurrency;
  const price = Number(number)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, '$&,');
  const currencySymbol = symbol || defaultCurrency?.symbol || '$';
  const currencyPosition = position || defaultCurrency?.position || 'before';

  return currencyPosition === 'after'
    ? `${price} ${currencySymbol}`
    : `${currencySymbol} ${price}`;
}
