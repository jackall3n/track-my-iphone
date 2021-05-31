import 'dotenv-flow/config';
import firebase from 'firebase-admin';
import FindMyiPhone from './find-my-iphone';
import fastify from "fastify";

import credentials from "./creds";

console.log(!!process.env.FIREBASE_CREDENTIALS)

const firebase_credentials = JSON.parse(JSON.parse(`"${process.env.FIREBASE_CREDENTIALS}"`));

console.log(Object.keys(firebase_credentials))

const app = firebase.initializeApp({
  credential: firebase.credential.cert(firebase_credentials)
})

const find = new FindMyiPhone(credentials.email, credentials.password);

let last_location: any;

const server = fastify({ logger: true });

server.get('/', (request, reply) => {
  reply.type('application/json').status(200)

  return last_location
});

server.listen(process.env.PORT || 3030, (error, address) => {
  if (error) {
    throw error;
  }

  console.log(address);
});

(async () => {
  await find.init();

  async function check() {
    let location: any;

    try {
      const device = await find.device('/UNm01d39xacCGMaY3288C0n7MKGcIM7i7mxiFvihSk=');

      location = device.location;

    } catch (e) {
      console.error(e);
      await find.init();
      return;
    }

    if (location) {
      console.log(`Your iPhone is here: ${location.latitude},${location.longitude}`, location);
      const ref = app.firestore().collection('locations').doc(String(location.timeStamp));
      await ref.set(location);
      last_location = location;
    } else {
      console.log('no location found');
    }


  }

  try {
    await check();
  } catch (e) {
    console.error(e);
  }

  setInterval(async () => {
    try {
      await check();
    } catch (e) {
      console.error(e);
    }
  }, 10000);

})();

