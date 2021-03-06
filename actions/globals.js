import { isEmpty } from 'lodash';

import * as types from './types';

import * as Api from '../api/ApiDelegate'

export function getGlobals() {
  return (dispatch: () => void, getState) => {
    dispatch({
      type: types.GET_GLOBALS_REQUEST
    });
    const { connection, api } = getState();
    const query = {
      json: true,
      code: 'eosio',
      scope: 'eosio',
      table: 'global'
    };
    api.request(connection, Api.GET_TABLE_ROWS, {query}).then((results) => dispatch({
      type: types.GET_GLOBALS_SUCCESS,
      payload: { results }
    })).catch((err) => dispatch({
      type: types.GET_GLOBALS_FAILURE,
      payload: { err },
    }));
  };
}

export function getCurrencyStats(contractName = "eosio.token", symbolName = "EOS") {
  const account = contractName.toLowerCase();
  const symbol = symbolName.toUpperCase();
  return (dispatch: () => void, getState) => {
    dispatch({
      type: types.GET_CURRENCYSTATS_REQUEST
    });
    const { connection } = getState();
    api.request(connection, Api.GET_CURRENCY_STATES, {account, symbol}).then((results) => {
      if (isEmpty(results)) {
        return dispatch({
          type: types.GET_CURRENCYSTATS_FAILURE,
          payload: {
            account,
            symbol
          },
        });
      }
      return dispatch({
        type: types.GET_CURRENCYSTATS_SUCCESS,
        payload: {
          account,
          results,
          symbol
        }
      });
    }).catch((err) => dispatch({
      type: types.GET_CURRENCYSTATS_FAILURE,
      payload: {
        account,
        err,
        symbol
      },
    }));
  };
}



export default {
  getCurrencyStats,
  getGlobals
};
