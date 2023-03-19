'use strict';

import state from "./state.js";
import variables from "./variables.js";
import { renderCurrencyItem } from "./markups.js";

const { success, currentCurrency, currencyList } = variables;

const insertCurrency = (data) => {
  currencyList.insertAdjacentHTML('afterbegin', renderCurrencyItem(data));
};

const insertCurrencies = () => {
  const { currency, currencies } = state;
  const { conversion_rates: rates, base_code: baseCode } = currency;

  currentCurrency.innerHTML = renderCurrencyItem(currency);
  currencyList.innerHTML = '';

  Object.entries(rates).forEach(([code, rate]) => {

    if (code === baseCode || !currencies.includes(code)) return;

    insertCurrency({ ...currency, code, rate });
  });
};

export const fetchLatest = async () => {
  const { url, currency: { code } } = state;

  if (!code) return;

  try {
    const response = await fetch(`${url}/latest/${code}`);
    const data = await response.json();

    if (data.result === success) {
      state.currency = { ...state.currency, ...data };
      insertCurrencies();
    }

  } catch (err) {
    console.log(err)
  }
};

const removeCurrency = (target) => {
  const parent = target.parentElement.parentElement;
  console.log(parent)

  const { item } = parent.dataset;
  console.log(item)
  if (!item) return;

  const element = document.querySelector(`[data-item="${item}"]`);
  element.remove();
};

const changeCurrency = () => {
  currentCurrency.parentElement.classList.add('active');
};

export const handleActionClick = ({ target }) => {
  const { action } = target.dataset;

  if (!action) return;

  const { action: { remove } } = state;

  action === remove ? removeCurrency(target) : changeCurrency();
};

export const handleSingleSelectChange = ({ target }) => {
  console.log(target)
  target.parentElement.classList.remove('active');
  state.currency = { ...state.currency, code: target.value };

  fetchLatest();
};

export const addCurrency = ({ currentTarget }) => {
  currentTarget.parentElement.classList.add('active');
};

export const handleAddCurrency = ({ target }) => {
  const { currency: { conversion_rates: rates, base_code: baseCode } } = state;
  const currency = Object.entries(rates).find(([key]) =>
    key === target.value && key !== baseCode
  );

  if (currency) {
    const [code, amount] = currency;
    insertCurrency({ ...state.currency, code, rate: amount });
  }

  target.parentElement.classList.remove('active');
  target.value = '';
};