import md5 from "../../utils/md5.js"
Page({
  data: {

  },
  register: function (e) {
    if(!e.detail.userInfo){
      console.log(e)
      return
    }
    console.log(wx)
    wx.$http.post("/api/user-wx", {
      openId: wx.getStorageSync("openId"),
      userName: e.detail.userInfo.nickName,
      province: e.detail.userInfo.province,
      city: e.detail.userInfo.city,
      gender: e.detail.userInfo.gender,
      avatarUrl: e.detail.userInfo.avatarUrl
    }).then((res) => {
      if (!res.errCode) {
        wx.setStorageSync("user", res.data);
        wx.showToast({
          title: '登录成功',
          icon: 'success', 
          duration: 3000,
          success: function () {
            wx.switchTab({
              url: '../home/home'
            })
          }
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: res.errMsg,
          duration: 2500
        })
      }
    })
  }
})