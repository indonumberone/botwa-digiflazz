import axios from 'axios';

const cekID = async (id) => {
  try {
    const headers = {
      'X-Datadome-Clientid':
        'HoM_6UQ0xCT2UVrcA94WS4187zTtVPHpm81l5DVcHtSYM2vDQLtmg3x8uD0V4VSS5gsaQZ5e0vZmggA6TvRwVIqC5rdavfFKD3Mw9Suhe9Xidje8RbyOhqbA_STJDYat',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.160 Safari/537.36',
      'Sec-Ch-Ua-Platform': 'Windows',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
    };
    const data = {
      app_id: 100067,
      login_id: `${id}`,
      app_server_id: 0,
    };

    const response = await axios.post(
      'https://kiosgamer.co.id/api/auth/player_id_login',
      data,
      {
        headers: {
          ...headers,
        },
      },
    );
    const results = {
      region: response.data.region,
      nickname: response.data.nickname,
      openid: response.data.open_id,
    };
    return results;
  } catch (error) {
    console.error('error #%d', error);
    throw error;
  }
};
console.log(await cekID(1565059862));
