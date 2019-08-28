const http = require('../../utils/http.js')
import Toast from 'vant-weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null,
    tabList:[
      { title: '所有', status: '' },
      { title: '待付款', status: 'all' },
      { title: '已付款', status: 'all' },
      { title: '待评价', status: 'all' },
    ],
    status:'',
    pageNum:1,
    orderList:null,
    noOrder:false,
    flag:false
  },
  // tab切换
  changeTab:function(e){
    this.setData({
      status:this.data.tabList[e.detail.index].status
    })
    this.getOrderList(this.data.tabList[e.detail.index].status)
  },
  // 获取订单
  getOrderList:function(status,isFirst=false){
    // if(!userId){
    //   Toast.fail('用户获取失败')
    // }
    // 设置节流阀
    if(this.data.flag){
      return
    }
    this.setData({
      flag : true
    })

    // 加载提示
    Toast.loading({
      title:'加载中',
      loadingType:'spinner',
      duration:0
    })
    // 传入 isFirst   是否加载第一页
    if(isFirst){
      this.data.pageNum = 1
    }
    var pageParams={
      criteria:JSON.stringify({
        userId: this.data.userId,
        status: status
      }),
      pageSize:10,
      pageNum:this.data.pageNum,
      // userId:this.data.userId,
      // status:status
    }
    http.get('/api/orders-page',pageParams).then(res=>{
      if(!res.errcode){
        // 初次加载直接覆盖原有数据
        if(isFirst){
          this.data.orderList = res.data
        }else{
          this.data.orderList = [...this.data.orderList,...res.data]
        }

        Toast.clear()

        this.setData({
          orderList:this.data.orderList,
          pageCount: res.pageParams.total,
          pageNum:this.data.pageNum
        })
        // 暂无图片展示
        if (this.data.orderList.length == 0) {
          this.setData({
            noOrder: true
          })
        }
        //  可以再次加载
        this.setData({
          flag: false
        })
      }else{
        Toast.clear()
        Toast.fail('加载失败')
        this.setData({
          flag: false
        })
      }
    })
  },

  //取消订单
  cancelOrder: function (e) {
    wx.showModal({
      title: '取消订单',
      content: '确认取消订单吗',
      success: res => {
        if (res.confirm) {
          http.put(`/api/orders/${e.target.dataset.id}`, {
            status: 'cancel'
          }).then(res => {
            wx.showToast({
              title: '取消订单成功',
              icon: 'success',
              duration: 2500
            });
            this.data.orderList[e.currentTarget.dataset.index].status = 'cancel'
            this.setData({
              orderList: this.data.orderList
            })
          })
        }
      }
    })

  },
  
  // 支付
  payOrder: function (e) {

    wx.showModal({
      title: '发起支付',
      content: '确认支付该订单吗',
      success: res => {
        if (res.confirm) {
          let index = e.target.dataset.index

          let user = wx.getStorageSync('user')
          http.post("/api/wx-pay-order", {
            deviceInfo: "WEB",
            body: `${this.data.orderList[index].name}`,
            outTradeNo: this.data.orderList[index].number,
            totalFee: this.data.orderList[index].totalFee,
            tradeType: "JSAPI",
            openid: user.openId,
            remark: this.data.orderList[index].remark ? this.data.orderList[index].remark : '该成员未描述他的户外经验'
          }).then(res => {
            wx.requestPayment({
              timeStamp: res.data.timeStamp,
              nonceStr: res.data.nonceStr,
              package: res.data.packageValue,
              signType: res.data.signType,
              paySign: res.data.paySign,
              success: (res) => {
                this.getOrders()
                wx.showToast({
                  title: '您已成功报名',
                  duration: 2000,
                  icon: 'none'
                })
              },
              fail: (err) => {
              }
            })
          })
        }
      }
    })
  },

  // 获取客服电话
  getServicePhone: function () {
    http.get(`/api/about`).then(res => {
      this.setData({
        servivePhone: res.data[0].phone
      })
    })
  },
  // 拨打客服电话
  callService: function () {
    wx.showModal({
      title: '客服',
      content: '是否拨打客服电话',
      success: res => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: this.data.servivePhone,
          })
        }
      }
    })
  },
  //取消订单
  cancelOrder: function (e) {
    wx.showModal({
      title: '取消订单',
      content: '确认取消订单吗',
      success: res => {
        if (res.confirm) {
          http.put(`/api/orders/${e.target.dataset.id}`, {
            status: 'cancel'
          }).then(res => {
            this.setData({
              orderList: []
            })
            this.getlist(this.data.status, true)
            wx.showToast({
              title: '取消成功',
              icon: 'success',
              duration: 2500
            });
          })
        }
      }
    })
  },

  // 支付
  payOrder: function (e) {
    wx.showModal({
      title: '发起支付',
      content: '确认支付该订单吗',
      success: res => {
        if (res.confirm) {
          let index = e.target.dataset.index
          let user = wx.getStorageSync('user')
          http.post("/api/wx-pay-order", {
            deviceInfo: "WEB",
            body: `${this.data.orderList[index].name}`,
            outTradeNo: this.data.orderList[index].number,
            totalFee: this.data.orderList[index].totalFee,
            tradeType: "JSAPI",
            openid: user.openId,
            remark: this.data.orderList[index].remark ? this.data.orderList[index].remark : '该成员未描述他的户外经验'
          }).then(res => {
            wx.requestPayment({
              timeStamp: res.data.timeStamp,
              nonceStr: res.data.nonceStr,
              package: res.data.packageValue,
              signType: res.data.signType,
              paySign: res.data.paySign,
              success: (res) => {
                this.setData({
                  orderList: []
                })
                this.getlist(this.data.status, true)
                wx.showToast({
                  title: '您已成功报名',
                  duration: 2000,
                  icon: 'success'
                })
              },
              fail: (err) => {
                // if (err) {
                //   wx.redirectTo({
                //     url: '../myOrder/myOrder'
                //   })
                // }
              }
            })
          })
        }
      }
    })
  },
  onLoad: function (options) {
    this.setData({
      userId:wx.getStorageSync('user')? wx.getStorageSync('user').userId : null
    })
    this.getServicePhone()
  },

 
  onShow: function () {
    this.getOrderList('',true)
  },

  
  onPullDownRefresh: function () {
    this.getOrderList(this.data.status, true)
  },


  onReachBottom: function () {
    // 判断是否还有更多
    if(this.data.orderList.length<this.data.pageCount){
      this.getOrderList(this.data.status)
    }
  },

  onShareAppMessage: function () {

  }
})