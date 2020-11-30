const http = require('../../utils/http.js')
import Toast from '@vant/weapp/toast/toast';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null,
    tabList: [
      { title: '全部', status: '' },
      { title: '待付款', status: 'unpaid' },
      { title: '待发货', status: 'unDelivered' },
      { title: '配送中', status: 'delivered' },
      { title: '已完成', status: 'completed' },
      { title: '退款/售后', status: 'refund' },
    ],
    status: '',
    pageNum: 1,
    orderList: null,
    noOrder: false,
    loading: false,
    active: 0
  },
  openPopup(e) {
    this.setData({
      popupBool: true,
      expressIndex:e.currentTarget.dataset.index
    })
    this.getExpress(e.currentTarget.dataset.index)

  },
  getExpress(index) {
    http.get('/api/get-express-info/' + this.data.orderList[index].id).then(res => {
      if (!res.errCode) {
        var express = JSON.parse(res.data)
        express.Traces = express.Traces.reverse()
        this.setData({
          express
        })
      }
    })
  },
  showPopup: function (e) {
    this.setData({
      popupBool: !this.data.popupBool
    })
  },

  //再来一单
  agianOrder(e) {

    console.log('orderList', this.data.orderList)
    console.log('再来一单', e)
    let index = e.currentTarget.dataset.index
    let product = this.data.orderList[index].orderProductList
    console.log('product', product)
    for (let i = 0; i < product.length; i++) {
      product[i].shopCheck = true
      product[i].discountPrice = product[i].price
      product[i].status = ''
      // product.taste = product.productAttrList[this.data.choiceIdx].taste;
      http.post("/api/cart", product[i]).then(res => {
        console.log('添加购物车', res)
        if (!res.errCode) {
          product[i].id = res.data
          console.log('ID', product[i].id)
          wx.setStorageSync('productList', product)
        }
      })
    }

    wx.navigateTo({
      url: '../checkOrder/checkOrder?type=cart&againOrderType=true',
    })
  },

  goDetail(e) {
    // let orderType = this.data.orderList[e.currentTarget.dataset.index].type
    // let status = this.data.orderList[e.currentTarget.dataset.index].status
    // if (orderType == "shop") {
    //   wx.navigateTo({
    //     url: '../orderDetail/orderDetail?orderId=' + this.data.orderList[e.currentTarget.dataset.index].id,
    //   })
    // } else {
    //   console.log('111111111', status)
    //   if (status == 'unDelivered' || status == 'grouping' || status == 'Failure') {
    //     console.log(this.data.orderList[e.currentTarget.dataset.index].groupId)
    //     wx.navigateTo({
    //       url: '../pintuanDetail/pintuanDetail?groupId=' + this.data.orderList[e.currentTarget.dataset.index].groupId,
    //     })
    //   } else {
        wx.navigateTo({
          url: '../orderDetail/orderDetail?orderId=' + this.data.orderList[e.currentTarget.dataset.index].id,
        })
      // }
    // }
  },
  // tab切换
  changeTab: function (e) {
    this.setData({
      orderList: [],
      status: this.data.tabList[e.detail.index].status
    })
    this.getOrderList(this.data.tabList[e.detail.index].status, true)
  },
  // 获取订单
  getOrderList: function (status, isFirst = false) {
    // if(!userId){
    //   Toast.fail('用户获取失败')
    // }
    // 设置节流阀
    if (this.data.loading) {
      return
    }
    this.setData({
      loading: true
    })

    // 传入 isFirst   是否加载第一页
    if (isFirst) {
      this.data.pageNum = 1
    }
    var pageParams = {
      // criteria:JSON.stringify({
      userId: this.data.userId,
      status: status,
      // }),
      pageSize: 8,
      pageNum: this.data.pageNum,
      type:'shop'
      // userId:this.data.userId,
      // status:status
    }
    return http.get('/api/orders-mini-page', pageParams).then(res => {
      if (!res.errcode) {
        console.log('获取订单', res)
        // 初次加载直接覆盖原有数据
        if (isFirst) {
          this.data.orderList = res.data
        } else {
          this.data.orderList = [...this.data.orderList, ...res.data]
        }

        Toast.clear()

        this.setData({
          orderList: this.data.orderList,
          pageCount: res.pageParams.total,
          pageNum: this.data.pageNum
        })
        // 暂无图片展示
        if (this.data.orderList.length == 0) {
          this.setData({
            noOrder: true
          })
        }
        //  可以再次加载
        this.setData({
          loading: false
        })
      } else {
        Toast.clear()
        Toast.fail('加载失败')
        this.setData({
          loading: false
        })
      }
    }).catch(err => {
      Toast.clear()
      // Toast.fail('系统繁忙')
      wx.redirectTo({
        url: '../login/login',
      })
      console.log(err)
      this.setData({
        loading: false
      })
    })
  },


  // 支付
  payOrder: function (e) {
    wx.showModal({
      title: '发起支付',
      content: '确认支付该订单吗',
      success: res => {
        if (res.confirm) {
          console.log('11111111111', e)
          let index = e.target.dataset.index

          let user = wx.getStorageSync('user')
          console.log('支付的订单', this.data.orderList)
          http.post("/api/wx-pay-order", {
            deviceInfo: "WEB",
            body: `${this.data.orderList[index].name}`,
            outTradeNo: this.data.orderList[index].number,
            totalFee: this.data.orderList[index].totalFee,
            tradeType: "JSAPI",
            openid: wx.getStorageSync("openId"),
            remark: this.data.orderList[index].remark ? this.data.orderList[index].remark : '该成员未描述他的户外经验'
          }).then(res => {
            console.log('支付的回调', res)
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
                this.getOrderList(this.data.status, true)
                wx.showToast({
                  title: '支付成功',
                  duration: 2000,
                })
              },
              fail: (err) => { }
            })
          })
        }
      }
    })
  },

  // // 获取客服电话
  // getServicePhone: function () {
  //   http.get(`/api/about`).then(res => {
  //     this.setData({
  //       servivePhone: res.data[0].phone
  //     })
  //   })
  // },
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
    console.log('取消订单', e)
    wx.showModal({
      title: '取消订单',
      content: '确认取消订单吗',
      success: res => {
        if (res.confirm) {
          http.put(`/api/orders`, {
            id: e.target.dataset.id ,
            status: 'cancel'
          }).then(res => {

            this.getOrderList(this.data.status, true)
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
  closeLogin(){
    this.setData({
      showBool:fals
    
    })
    wx.navigateBack({
      
    })
  },
  load(){
    this.getOrderList(this.data.status, true)

  },
  onLoad: function (options) {
    

    this.setData({
      userId: wx.getStorageSync('user') ? wx.getStorageSync('user').userId : null,
      status: options.status,
      active: this.data.tabList.findIndex(item => { return item.status == options.status})
    })
    if(this.data.userId){
      this.setData({
        showBool:true
      })
      return
    }
    this.getOrderList(this.data.status, true)
    
    // http.get('/api/get-express-info/631892519071776768').then(res=>{
    //   console.log(res)
    // })
  },


  onShow: function () {
  },


  onPullDownRefresh: function () {
    this.setData({
      orderList: []
    })
    this.getOrderList(this.data.status, true).then(res => {
      wx.stopPullDownRefresh()
    })
  },


  onReachBottom: function () {
    // 判断是否还有更多
    if (this.data.orderList.length < this.data.pageCount) {
      this.data.pageNum++
      this.getOrderList(this.data.status)
    }
  },

  onShareAppMessage: function () {

  }
})