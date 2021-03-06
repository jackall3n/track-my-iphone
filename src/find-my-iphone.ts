import { CookieJar } from "request";
import request, { RequestPromiseAPI } from "request-promise";

var util = require("util");

class FindMyiPhone {
  jar?: CookieJar;
  request!: RequestPromiseAPI;
  base_path!: string;

  constructor(private apple_id: string, private password: string) {
  }

  get client() {
    return request.defaults({
      jar: this.jar,
      headers: {
        "Origin": "https://www.icloud.com"
      }
    });
  }

  async init() {
    const login = !this.jar;

    if (login) {
      this.jar = request.jar();
    }

    this.request = request.defaults({
      jar: this.jar,
      headers: {
        "Origin": "https://www.icloud.com"
      }
    });

    if (login) {
      await this.login();
    } else {
      await this.checkSession();
    }
  }

  async login() {
    const login_response = await this.request.post({
      url: "https://setup.icloud.com/setup/ws/1/login",
      json: {
        "apple_id": this.apple_id,
        "password": this.password,
        "extended_login": true
      }
    });

    this.base_path = login_response?.webservices?.findme?.url;
  }


  async checkSession() {
    try {


    } catch (e) {
      this.jar = request.jar();

      await this.login();
    }
  }

  async devices() {

    const { content } = await this.request.post({
      url: `${this.base_path}/fmipservice/client/web/initClient`,
      json: {
        "clientContext": {
          "appName": "iCloud Find (Web)",
          "appVersion": "2.0",
          "timezone": "US/Eastern",
          "inactiveTime": 3571,
          "apiVersion": "3.0",
          "fmly": false  // Only your devices, not family members'!
        }
      }
    });

    return content;
  }

  async device(id: string): Promise<any> {
    const devices = await this.devices();

    return devices.find((d: any) => d.id === id);
  }
}

//
// var findmyphone = {
//   login: function (callback) {
//
//     var options = {
//       url: "https://setup.icloud.com/setup/ws/1/login",
//       json: {
//         "apple_id": findmyphone.apple_id,
//         "password": findmyphone.password,
//         "extended_login": true
//       }
//     };
//
//     findmyphone.iRequest.post(options, function (error, response, body) {
//
//       if (!response || response.statusCode != 200) {
//         return callback("Login Error");
//       }
//
//       findmyphone.onLogin(body, function (err, resp, body) {
//         return callback(err, resp, body);
//       });
//
//     });
//   },
//   checkSession: function (callback) {
//
//     var options = {
//       url: "https://setup.icloud.com/setup/ws/1/validate",
//     };
//
//     findmyphone.iRequest.post(options, function (error, response, body) {
//
//       if (!response || response.statusCode != 200) {
//         return callback("Could not refresh session");
//       }
//
//       findmyphone.onLogin(JSON.parse(body), function (err, resp, body) {
//         return callback(err, resp, body);
//       });
//
//     });
//   },
//   onLogin: function (body, callback) {
//
//     if (body.hasOwnProperty("webservices") && body.webservices.hasOwnProperty("findme")) {
//       findmyphone.base_path = body.webservices.findme.url;
//
//       options = {
//         url: findmyphone.base_path + "/fmipservice/client/web/initClient",
//         json: {
//           "clientContext": {
//             "appName": "iCloud Find (Web)",
//             "appVersion": "2.0",
//             "timezone": "US/Eastern",
//             "inactiveTime": 3571,
//             "apiVersion": "3.0",
//             "fmly": false  // Only your devices, not family members'!
//           }
//         }
//       };
//
//       findmyphone.iRequest.post(options, callback);
//     } else {
//       return callback("cannot parse webservice findme url");
//     }
//   },
//   getDevices: function (callback) {
//
//     findmyphone.init(function (error, response, body) {
//
//       if (!response || response.statusCode != 200) {
//         return callback(error);
//       }
//
//       var devices = [];
//
//       // Retrieve each device on the account
//       body.content.forEach(function (device) {
//         devices.push({
//           id: device.id,
//           name: device.name,
//           deviceModel: device.deviceModel,
//           modelDisplayName: device.modelDisplayName,
//           deviceDisplayName: device.deviceDisplayName,
//           batteryLevel: device.batteryLevel,
//           isLocating: device.isLocating,
//           lostModeCapable: device.lostModeCapable,
//           location: device.location
//         });
//       });
//
//       callback(error, devices);
//     });
//   },
//   alertDevice: function (deviceId, callback) {
//     var options = {
//       url: findmyphone.base_path + "/fmipservice/client/web/playSound",
//       json: {
//         "subject": "Amazon Echo Find My iPhone Alert",
//         "device": deviceId
//       }
//     };
//     findmyphone.iRequest.post(options, callback);
//   },
//   getLocationOfDevice: function (device, callback) {
//
//     if (!device.location) {
//       return callback("No location in device");
//     }
//
//     var googleUrl = "http://maps.googleapis.com/maps/api/geocode/json" +
//       "?latlng=%d,%d&sensor=true";
//
//     googleUrl =
//       util.format(googleUrl,
//         device.location.latitude, device.location.longitude);
//
//     var req = {
//       url: googleUrl,
//       json: true
//     };
//
//     request(req, function (err, response, json) {
//       if (!err && response.statusCode == 200) {
//         if (Array.isArray(json.results) &&
//           json.results.length > 0 &&
//           json.results[0].hasOwnProperty("formatted_address")) {
//
//           return callback(err, json.results[0].formatted_address);
//         }
//       }
//       return callback(err);
//     });
//
//   },
//   getDistanceOfDevice: function (device, myLatitude, myLongitude, callback) {
//     if (device.location) {
//
//       var googleUrl = "http://maps.googleapis.com/maps/api/distancematrix/json" +
//         "?origins=%d,%d&destinations=%d,%d&mode=driving&sensor=false";
//
//       googleUrl =
//         util.format(googleUrl, myLatitude, myLongitude,
//           device.location.latitude, device.location.longitude);
//
//       var req = {
//         url: googleUrl,
//         json: true
//       };
//
//       request(req, function (err, response, json) {
//         if (!err && response.statusCode == 200) {
//           if (json && json.rows && json.rows.length > 0) {
//             return callback(err, json.rows[0].elements[0]);
//           }
//           return callback(err);
//         }
//       });
//
//     } else {
//       callback("No location found for this device");
//     }
//   }
// };
//
// // legacy
// var find_my_iphone = function (apple_id, password, device_name, callback) {
//
//   findmyphone.apple_id = apple_id;
//   findmyphone.password = password;
//
//   findmyphone.getDevices(function (error, devices) {
//     if (error) {
//       throw error;
//     }
//
//     var device;
//     if (devices.length > 0) {
//       if (device_name) {
//         devices.forEach(function (d) {
//           if (device_name) {
//             if (device_name == d.name && d.lostModeCapable) {
//               device = d;
//             }
//           } else {
//             if (!device && d.lostModeCapable) {
//               device = d;
//             }
//           }
//         });
//       }
//     }
//
//     if (device) {
//       findmyphone.alertDevice(device.id, function (err) {
//         if (err) {
//           throw err;
//         }
//         if (callback) {
//           callback(err);
//         }
//       });
//     } else {
//       throw "Device [" + device_name + "] not found";
//     }
//   });
// };
//

export default FindMyiPhone;
