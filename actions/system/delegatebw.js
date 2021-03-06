import * as types from '../types';
import * as AccountActions from '../accounts';
import * as Api from '../../api/ApiDelegate'

export function delegatebw(delegator, receiver, netAmount, cpuAmount) {
  return (dispatch: () => void, getState) => {
    const {
      connection,
      api
    } = getState();

    dispatch({
      type: types.SYSTEM_DELEGATEBW_PENDING
    });

    return api.request(connection, Api.DELEGATEBW, {delegator, receiver, netAmount, cpuAmount})
    .then((tx) => {
      dispatch(AccountActions.getAccount(delegator));
      return dispatch({
        payload: { tx },
        type: types.SYSTEM_DELEGATEBW_SUCCESS
      });
    }).catch((err) => dispatch({
      payload: { err },
      type: types.SYSTEM_DELEGATEBW_FAILURE
    }));
  };
}

export function delegatebwParams(delegator, receiver, netAmount, cpuAmount) {
  const stakeNetAmount = netAmount || 0;
  const stakeCpuAmount = cpuAmount || 0;

  return {
    from: delegator,
    receiver,
    stake_net_quantity: `${stakeNetAmount.toFixed(4)} EOS`,
    stake_cpu_quantity: `${stakeCpuAmount.toFixed(4)} EOS`,
    transfer: 0
  };
}

export default {
  delegatebw
};
