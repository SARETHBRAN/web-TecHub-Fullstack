import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 10 },
    { duration: '30s', target: 10 },
    { duration: '15s', target: 0 },
  ],
};

export default function () {
  let res = http.get('http://localhost:3001/api/products');
  check(res, {
    'status es 200': (r) => r.status === 200,
    'tiene productos': (r) => JSON.parse(r.body).length > 0,
  });
  sleep(1);
}