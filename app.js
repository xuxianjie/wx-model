import auth from "./utils/auth.js"
import http from "./utils/http.js"
App({
  onLaunch: function () {
    wx.$http = http;
    let authPromise = function () {
      return new Promise(function (resolve, reject) {
        auth.getOpenId(resolve, reject);
      });
    }
    this.globalData.authPromise = authPromise;
    authPromise();
    let locationPromise = function () {
      return new Promise(function (resolve, reject) {
        auth.getUserLocation(resolve, reject);
      })
    }
    this.globalData.locationPromise = locationPromise;
  },

  globalData: {
    user: null,
    community: null,
    authPromise: null,
    locationPromise: null,
    roomSelected: null
  }
})