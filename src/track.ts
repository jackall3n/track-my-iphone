import 'dotenv-flow/config';

import FindMyiPhone from './find-my-iphone';

import credentials from "./creds";

const find = new FindMyiPhone(credentials.email, credentials.password);

(async () => {
  await find.init();

  setInterval(async () => {
    const device = await find.device('/UNm01d39xacCGMaY3288C0n7MKGcIM7i7mxiFvihSk=');

    console.log(`Your iPhone is here: ${device.location.latitude},${device.location.longitude}`, device.location)
  }, 10000);

})();

