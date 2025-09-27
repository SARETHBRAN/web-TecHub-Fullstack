import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
  stages: [
    { duration: '15s', target: 10 },
    { duration: '30s', target: 10 },  
    { duration: '15s', target: 0 },  
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],  
  },
};

const BASE_URL = 'http://localhost:3001';

export default function () {

  let res = http.get(`${BASE_URL}/api/products`);
  check(res, {
    'status es 200': (r) => r.status === 200,
    'tiene al menos 1 producto': (r) => JSON.parse(r.body).length >= 1,
  });


  sleep(1);
}