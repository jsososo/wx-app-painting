import utils from "../../utils/util";
import {recordPointsFun, startTouch, drawBack} from "../../utils/paint";
// painting-2.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasChoosedImg: false,
    canvasWidth: 0,
    canvasHeight: 0, // canvas的完整高度
    canvasHeightLen: 0, // canvas的临时高度（用在操作栏影响画布高度时）
    windowHeight: 0, // 屏幕高度
    prevPosition: [0, 0], // 前一个移动所在位置
    movePosition: [0, 0], // 当前移动位置
    background: '', // 背景图片，即导入的图片

    btnInfo: [
      {
        type: 'width',
        background: 'url("http://static.jsososo.com/bmob-cdn-20716.b0.upaiyun.com/2018/10/29/b2caae93401a9be1809edfb314a91159.png") white no-repeat; background-size: 20px 20px;background-position: 2px 2px;'
      },
      {
        type: 'color',
        background: 'url("http://static.jsososo.com/bmob-cdn-20716.b0.upaiyun.com/2018/10/29/a516340a402e93ea8025fe0eb6f2f080.png") white no-repeat; background-size: 18px 18px;background-position: 3px 3px;'
      },
      {
        type: 'clear',
        background: 'url("http://static.jsososo.com/bmob-cdn-20716.b0.upaiyun.com/2018/10/29/466bf6bb400574cf805fdb2fd715caa1.png") white no-repeat; background-size: 18px 18px;background-position: 3px 3px;'
      },
      {
        type: 'save',
        background: 'url("http://static.jsososo.com/bmob-cdn-20716.b0.upaiyun.com/2018/10/29/d2e31f7c40113bdd807256c5a4cb06ae.png") white no-repeat; background-size: 20px 20px;background-position: 2px 2px;'
      }
    ],
    width: false, // 是否开启宽度调整栏
    color: false, // 是否开启颜色调整栏
    r: 33,
    g: 33,
    b: 33,
    w: 10,
    clear: false, // 是否开启清空栏
    eraser: false, // 是否开启橡皮擦
    saving: false, // 是否在保存状态
    scope: false, // 是否有保存图片的权限
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 获取设备信息，canvas高度用
    wx.getSystemInfo({
      success: function(res) {
        console.log(res);
        that.setData({
          canvasWidth: res.windowWidth,
          canvasHeight: res.windowHeight - 50,
          windowHeight: res.windowHeight
        })
      },
    })
    // 选照片
    this.chooseImg();
    // 检查权限，保存时提示弹窗用
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.writePhotosAlbum']) {
          that.setData({
            scope: true,
          })
        }
      }
    })
  },

  tapBtn: function (e) {
    utils.tapBtn(e, this, 2);
  },

  addImg: function (e) {
    this.chooseImg();
  },

  chooseImg() {
    let that = this;
    wx.chooseImage({
      success: function (res) {
        that.setData({
          hasChoosedImg: true,
        })
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function (res) {
            // 获取图片信息，主要为宽高，选择合适的自适应方式（将最大边完整显示）
            let [height, width] = [that.data.canvasWidth / res.width * res.height, that.data.canvasWidth];
            if (height > that.data.windowHeight - 50) {
              height = that.data.windowHeight - 50;
              width = height / res.height * res.width;
            }
            const ctx = wx.createCanvasContext('myCanvas');
            ctx.drawImage(res.path, 0, 0, width, height);
            ctx.draw();
            that.setData({
              canvasHeight: height,
              canvasWidth: width,
              background: res.path
            });
          }
        })
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },

  touchStart: function (e) {
    // 开始画图，隐藏所有的操作栏
    this.setData({
      color: false,
      width: false,
      canvasHeightLen: 0,
      prevPosition: [e.touches[0].x, e.touches[0].y],
      movePosition: [e.touches[0].x, e.touches[0].y],
    });
    const { r, g, b } = this.data;
    let color = `rgb(${r},${g},${b})`;
    let width = this.data.w;
    startTouch(e, color, width);
  },

  touchMove: function (e) {
    const { r, g, b, prevPosition, movePosition, eraser, w, } = this.data;
    // 触摸，绘制中。。
    const ctx = wx.createCanvasContext('myCanvas');
    // 画笔的颜色
    let color = `rgb(${r},${g},${b})`;
    let width = w;
    if (eraser) {
      ctx.clearRect(e.touches[0].x, e.touches[0].y, 30, 30);
      ctx.draw(true);
      return;
    }

    const [pX, pY, cX, cY] = [...prevPosition, e.touches[0].x, e.touches[0].y];
    const drawPosition = [pX, pY, (cX + pX) / 2, (cY + pY) / 2];
    ctx.setLineWidth(width);
    ctx.setStrokeStyle(color);

    ctx.setLineCap('round');
    ctx.setLineJoin('round');
    ctx.moveTo(...movePosition);
    ctx.quadraticCurveTo(...drawPosition);
    ctx.stroke();
    ctx.draw(true);

    recordPointsFun(movePosition, drawPosition)

    this.setData({
      prevPosition: [cX, cY],
      movePosition: [(cX + pX) / 2, (cY + pY) / 2]
    });
  },

  clearCanvas: function () {
    let ctx = wx.createCanvasContext('myCanvas');
    ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
    ctx.draw();
    this.setData({
      clear: false,
      canvasHeightLen: 0
    })
  },

  chooseEraser: function () {
    this.setData({
      eraser: !this.data.eraser,
      clear: false,
      canvasHeightLen: 0
    })
  },

  drawBack() {
    const ctx = wx.createCanvasContext('myCanvas');
    ctx.drawImage(this.data.background, 0, 0, this.data.canvasWidth, this.data.canvasHeight);
    ctx.draw();
    drawBack(this);
  },

  changeColor: function (e) {
    utils.changeColor(e, this);
  },

  changeWidth: function (e) {
    utils.changeWidth(e, this, (this.data.canvasHeightLen + this.data.w - e.detail.value), 2);
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