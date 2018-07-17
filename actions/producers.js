import * as types from './types';
import sortBy from 'lodash/sortBy';
import concat from 'lodash/concat';

import * as Api from '../api/ApiDelegate'

export function clearProducerCache() {
  return (dispatch: () => void) => {
    dispatch({
      type: types.CLEAR_PRODUCER_CACHE
    });
  };
}

export function getProducers(previous = false) {
  return (dispatch: () => void, getState) => {
    dispatch({
      type: types.GET_PRODUCERS_REQUEST
    });
    const { connection, api } = getState();
    const query = {
      json: true,
      code: 'eosio',
      scope: 'eosio',
      table: 'producers',
      limit: 1000,
    };
    if (previous) {
      query.lower_bound = previous[previous.length - 1].owner;
    }
    api.request(connection, Api.GET_TABLE_ROWS, {query}).then((results) => {
      let { rows } = results;
      // If previous rows were returned
      if (previous) {
        // slice last element to avoid dupes
        previous.pop();
        // merge arrays
        rows = concat(previous, rows);
      }
      // if there are missing results
      if (results.more) {
        // recurse
        return dispatch(getProducers(rows));
      }
      const { globals } = getState();
      const { current } = globals;
      let backupMinimumPercent = false;
      let tokensToProducersForVotes = false;
      const { contract } = globals;
      if (contract && contract['eosio.token']) {
        const supply = parseFloat(contract['eosio.token'].EOS.supply);
        // yearly inflation
        const inflation = 0.04879;
        // Tokens per year
        const tokensPerYear = supply * inflation;
        // Tokens per day
        const tokensPerDay = tokensPerYear / 365;
        // 1/5th of inflation
        const tokensToProducers = tokensPerDay * 0.2;
        // 75% rewards based on votes
        tokensToProducersForVotes = tokensToProducers * 0.75;
        // Percentage required to earn 100 tokens/day (break point for backups)
        backupMinimumPercent = 100 / tokensToProducersForVotes;
      }
      const data = rows
        .filter((p) => (p.producer_key !== 'EOS1111111111111111111111111111111114T1Anm'))
        .map((producer) => {
          const votes = parseInt(producer.total_votes, 10);
          const percent = votes / current.total_producer_vote_weight;
          const isBackup = (backupMinimumPercent && percent > backupMinimumPercent);
          return Object.assign({}, {
            isBackup,
            key: `${producer.owner}-${producer.total_votes}`,
            last_produced_block_time: producer.last_produced_block_time,
            owner: producer.owner,
            percent,
            producer_key: producer.producer_key,
            url: producer.url,
            votes
          });
        });
      const list = sortBy(data, 'votes').reverse();
      return dispatch({
        type: types.GET_PRODUCERS_SUCCESS,
        payload: {
          list
        }
      });
    }).catch((err) => dispatch({
      type: types.GET_PRODUCERS_FAILURE,
      payload: { err },
    }));
  };
}

export default {
  getProducers
};
