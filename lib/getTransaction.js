import axios from 'axios';
import {getCsrf} from './getCsrf';
const getTransaction = async () => {
  try {
    const csrf = await getCsrf();
    const headers = {
      Host: 'kiosgamer.co.id',
      Cookie: `session_key=${process.env.KIOSGAMER}; _csrf_=${csrf};`,
      'X-Csrf-Token': csrf,
      'Content-Type': application / json,
    };
    const data = {
      service: 'pc',
      app_id: 100067,
      packed_role_id: 0,
      channel_id: 208070,
      item_id: 1,
      channel_data: {otp_code: '037684', garena_uid: 501764314},
      player_id: '1565059862',
      experiment: {},
      revamp_experiment: {},
    };

    const response = await axios.post(
      'https://kiosgamer.co.id/api/shop/pay/init?language=id&region=CO.ID',
      data,
      {
        headers: {
          ...headers,
        },
      },
    );
    console.log(response.data);
  } catch (error) {
    console.error('error' + error);
    throw error;
  }
};
getTransaction();
