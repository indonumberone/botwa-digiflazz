import axios from 'axios';
export const getCsrf = async () => {
  try {
    const data = {};
    const Cookie = process.env.KIOSGAMER;
    const headers = {
      Host: 'kiosgamer.co.id',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const response = await axios.post(
      'https://kiosgamer.co.id/api/preflight',
      data,
      {
        headers: {
          ...headers,
          Cookie: 'session_key=' + Cookie,
        },
      },
    );
    const setCookieHeader = response.headers['set-cookie'][0];
    const csrfToken = setCookieHeader.match(/__csrf__=([^;]+)/)[1];
    console.log(csrfToken);
    return csrfToken;
  } catch (error) {
    throw new Error('error');
  }
};
