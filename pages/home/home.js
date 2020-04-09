const http =require('../../utils/http.js')
import Toast from 'vant-weapp/toast/toast';

Page({


  data: {

  },
  // 获取轮播图
  getCarousel: function () {

    http.get('/api/carousel-picture', {
      type: 'home'
    }).then(res => {
      if(!res.errCode){
        this.setData({
          carouselList: res.data
        })
      }
    })
  },

  onLoad: function (options) {


  },


  onReady: function () {

  },


  onShow: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },


  onShareAppMessage: function () {

  }
})