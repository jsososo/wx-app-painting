
const App = getApp();
const recordPoints = App.globalData.recordPoints;

// 记录一条线的起始点，顺便记录一下这条线的颜色和为宽度
export const startTouch = (e, color, width) => {
  recordPoints.push([{
    x: e.touches[0].x,
    y: e.touches[0].y,
    color,
    width,
  }]);
};

// 记录一条线内的每个点
export const recordPointsFun = (e, _this) => {
  const l = recordPoints.length;
  recordPoints[l-1].push({
    x: e.touches[0].x,
    y: e.touches[0].y,
  });
  // reDraw(_this)
};

// 绘制过程
export const reDraw = (_this) => {
  const ctx = wx.createCanvasContext('myCanvas');
  ctx.rect(-100, -100, 10000, 10000);
  ctx.setFillStyle('white');
  ctx.fill();
  
  recordPoints.forEach(line => {
    // 线的宽度
    ctx.lineWidth = line[0].width;
    // 线的颜色
    ctx.strokeStyle = line[0].color;
    // 起始位置
    ctx.moveTo(line[0].x, line[0].y);
    // 这些样式就默认了
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    console.log(ctx.lineWidth);

    line.forEach((p, i) => {
      if (i && line[i+1]) {
        // 让曲线更加平滑
        ctx.quadraticCurveTo(p.x, p.y, (p.x + line[i+1].x) / 2, (p.y + line[i+1].y) / 2);
      }
    });
    ctx.imageSmoothingEnabled = true;
    ctx.stroke();
  });

  ctx.draw();

  _this.setData({
    prevPosition: [-1, -1]
  });
};

// 后退
export const drawBack = (_this) => {
  recordPoints.pop();
  reDraw(_this);
};

// 清空globalData里的点数据
export const clearPoints = () => {
  recordPoints.length = 0;
};

export const clearDraw = (e, _this) => {
  const ctx = wx.createCanvasContext('myCanvas');
  const { x, y } = e.touches[0];
  ctx.clearRect(x, y, 20, 20);
  ctx.draw();
}