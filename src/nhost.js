
import { NhostClient } from '@nhost/react';

console.log('subdomain:', process.env.REACT_APP_NHOST_SUBDOMAIN)
console.log('region:', process.env.REACT_APP_NHOST_REGION)
const nhost = new NhostClient({
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN ,
  region: process.env.REACT_APP_NHOST_REGION ,
});

export { nhost };