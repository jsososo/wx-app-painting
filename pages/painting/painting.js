// painting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prevPosition: [0, 0],
    btnInfo: [
      {
        type: 'width',
        background: 'url("../src/img/bg1.jpg"); background-size: 30px 30px;'
      },
      {
        type: 'color',
        background: 'url("../src/img/bg2.jpg") white no-repeat; background-size: 24px 24px;background-position: 3px 3px;'
      },
      {
        type: 'clear',
        background: 'url("../src/img/bg3.jpg") white no-repeat; background-size: 20px 20px;background-position: 5px 5px;'
      },
      {
        type: 'save',
        background: 'url("../src/img/bg6.png") white no-repeat; background-size: 20px 20px;background-position: 5px 5px;'
      }
    ],
    width: false,
    color: false,
    clear: false,
    r: 33,
    g: 33,
    b: 33,
    w: 2,
    eraser: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  touchStart: function (e) {
    this.setData({
      prevPosition: [e.touches[0].x, e.touches[0].y]
    })
  },

  touchMove: function (e) {
    let ctx = wx.createCanvasContext('myCanvas');

    if (!this.data.eraser) {
      ctx.setStrokeStyle("rgb(" + this.data.r + ', ' + this.data.g + ', ' + this.data.b + ')');
      ctx.setLineWidth(this.data.w);
    } else {
      ctx.setStrokeStyle('white');
      ctx.setLineWidth(10);
    }
    ctx.setLineCap('round');
    ctx.setLineJoin('round');
    ctx.moveTo(this.data.prevPosition[0], this.data.prevPosition[1]);
    ctx.lineTo(e.touches[0].x, e.touches[0].y);
    ctx.stroke();
    ctx.draw(true);

    this.setData({
      prevPosition: [e.touches[0].x, e.touches[0].y]
    })
  },

  tapBtn: function (e) {
    let btnType = e.target.dataset.type;

    if (btnType == 'width') {
      this.setData({
        width: !this.data.width,
        color: false,
        clear: false
      })
    } else if (btnType == 'color') {
      this.setData({
        width: false,
        color: !this.data.color,
        clear: false
      })
    } else if (btnType == 'clear') {
      this.setData({
        width: false,
        color: false,
        clear: !this.data.clear
      })
    } else if (btnType == 'save') {
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        success: function (res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function (res) {
              console.log(res)
            }
          })
        }
      })
    }
  },

  changeColor: function (e) {
    if (e.target.dataset.color == 'r') {
      this.setData({
        r: e.detail.value
      })
    } else if (e.target.dataset.color == 'g') {
      this.setData({
        g: e.detail.value
      })
    } else if (e.target.dataset.color == 'b') {
      this.setData({
        b: e.detail.value
      })
    }
  },

  changeWidth: function (e) {
    this.setData({
      w: e.detail.value
    })
  },

  clearCanvas: function () {
    let ctx = wx.createCanvasContext('myCanvas');
    ctx.draw();
  },

  chooseEraser: function () {
    this.setData({
      eraser: !this.data.eraser
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})