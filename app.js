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
    // authPromise();
    let locationPromise = function () {
      return new Promise(function (resolve, reject) {
        auth.getUserLocation(resolve, reject);
      })
    }
    this.globalData.locationPromise = locationPromise;
  },
  getLocation:function(resolve){
    wx.getLocation({
      success: res=>{
        resolve(res)
      },
      fail: function () {
        wx.getSetting({
          success: function (res) {
            var statu = res.authSetting;
            if (!statu['scope.userLocation']) {
              wx.showModal({
                title: '是否授权当前位置',
                content: '需要获取您的地理位置，请确认授权，否则无法使用地图功能',
                success: function (tip) {
                  if (tip.confirm) {
                    wx.openSetting({
                      success: function (data) {
                        if (data.authSetting["scope.userLocation"] === true) {
                          wx.showToast({
                            title: '授权成功',
                            icon: 'success',
                            duration: 1000
                          })
                          //getLocation获取信息
                          wx.getLocation({
                            success: function(res) {
                              resolve(res)
                            },
                          })
                        } else {
                          wx.showToast({
                            title: '授权失败',
                            icon: 'success',
                            duration: 1000
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          },
          fail: function (res) {
            wx.showToast({
              title: '调用授权窗口失败',
              icon: 'success',
              duration: 1000
            })
          }
        })
      }
    })
  },
  globalData: {
    user: null,
    community: null,
    authPromise: null,
    locationPromise: null,
    roomSelected: null
  }
})