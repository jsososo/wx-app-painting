function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 公用的修改颜色
function changeColor(e, _this) {
  let tempData = {};
  tempData[e.target.dataset.color] = e.detail.value;
  _this.setData({
    ...tempData,
    eraser: false,
  });
}

// 公用的修改画笔宽度
function changeWidth(e, _this, canvasHeight, pageType) {
  let c = {};
  if (pageType === 1) {
    c.canvasHeight = canvasHeight;
  } else {
    c.canvasHeightLen = canvasHeight;
  }
  _this.setData({
    w: e.detail.value,
    eraser: false,
    ...c,
  })
}

// 点击按钮触发的事件
function tapBtn(e, _this, pageType) {
  let btnType = e.target.dataset.type;

  let c = {};

  switch (btnType) {
    // 画笔宽度
    case 'width':
      if (pageType === 1) {
        c.canvasHeight = (!_this.data.width) ? 130 + _this.data.w : 50;
      } else if (pageType === 2) {
        c.canvasHeightLen = (!_this.data.width) ? Math.min(_this.data.canvasHeight, _this.data.windowHeight - _this.data.w - 130) : 0;
      } else if (pageType === 3) {
        c.canvasHeight = 130;
      }
      _this.setData({
        width: !_this.data.width,
        color: false,
        clear: false,
        ...c,
      });
      return;
    // 画笔颜色
    case 'color':
      if (pageType === 1) {
        c.canvasHeight = (!_this.data.color) ? 205 + _this.data.w : 50;
        if (_this.data.pageType === 'whiteBoard') {
          c.canvasHeight += 64;
        }
      } else if (pageType === 2) {
        c.canvasHeightLen = (!_this.data.color) ? Math.min(_this.data.canvasHeight, _this.data.windowHeight - _this.data.w - 205) : 0;
      }
      _this.setData({
        width: false,
        color: !_this.data.color,
        clear: false,
        ...c,
      });
      return;
    // 清空按钮
    case 'clear':
      if (pageType === 1) {
        c.canvasHeight = (!_this.data.clear) ? 120 + _this.data.w : 50;
      } else if (pageType === 2) {
        c.canvasHeightLen = (!_this.data.clear) ? Math.min(_this.data.canvasHeight, _this.data.windowHeight - _this.data.w - 120) : 0;
      }
      _this.setData({
        width: false,
        color: false,
        clear: !_this.data.clear,
        ...c,
      })
      return;
    // 保存
    case 'save':
      saveImg(_this, pageType);
      return;
    default:
      return;
  }
}

function saveImg(_this, pageType) {
  let c = {};
  if (pageType === 1) {
    c.canvasHeight = 50;
  } else if (pageType === 2) {
    c.canvasHeightLen = 0;
  }
  // 查看授权
  if (!_this.data.scope) {
    wx.showModal({
      title: '需要授权',
      content: '保存图片需要获取您的授权',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              if (res.authSetting['scope.writePhotosAlbum']) {
                _this.setData({
                  scope: true,
                })
              }
            }
          });
        }
      }
    })
  }
  // 已经获得授权且不在保存中
  if (_this.data.scope && !_this.data.saving) {
    wx.showLoading({
      title: '保存中',
      mask: true,
    })
    // 关闭所有的操作栏
    _this.setData({
      width: false,
      color: false,
      clear: false,
      saving: true,
      ...c,
    })

    if (pageType === -1) {
      /*
      * 对于涂鸦照片，一共分为四步：
      * 1、将画的内容先保存出来
      * 2、然后再将照片先画在canvas上
      * 3、将画的内容覆盖的画在canvas上
      * 4、最终保存
       */
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        success: function (res) {
          // 把单纯用户画的内容存好了
          let src = res.tempFilePath;
          let ctx = wx.createCanvasContext('myCanvas');
          // 照片
          ctx.drawImage(_this.data.background, 0, 0, _this.data.canvasWidth, _this.data.canvasHeight);
          // 覆盖上画的内容
          ctx.drawImage(src, 0, 0, _this.data.canvasWidth, _this.data.canvasHeight);
          ctx.draw();

          _canvaseSaveToImg(_this);
        }
      });
    } else {
      _canvaseSaveToImg(_this);
    }
  }
}

function _canvaseSaveToImg(_this) {
  // 调用微信canvas存为图片
  wx.canvasToTempFilePath({
    canvasId: 'myCanvas',
    success: function (res) {
      // 转图片成功，继续调用存储相册接口
      wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        // 存储成功
        success: function (r) {
          wx.hideLoading();
          wx.showToast({
            title: '保存成功',
          })
          _this.setData({
            saving: false,
          })
        },
        // 失败弹窗
        fail: function (res) {
          wx.hideLoading();
          wx.showToast({
            title: '保存失败',
            icon: 'loading',
          })
          _this.setData({
            saving: false,
          })
        }
      })
    },
    fail: function (res) {
      // canvas转图片失败
      wx.hideLoading();
      wx.showToast({
        icon: 'loading',
        title: '保存失败',
      })
    }
  })
}

function setEraser(_this) {
  _this.setData({
    eraser: !_this.data.eraser,
    clear: false,
    canvasHeight: 50
  });
}

module.exports = {
  formatTime: formatTime,
  changeColor: changeColor,
  changeWidth: changeWidth,
  tapBtn: tapBtn,
  setEraser: setEraser,
}
