
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
export const recordPointsFun = (move, draw) => {
  const l = recordPoints.length;
  recordPoints[l-1].push({ move, draw });
};

// 绘制过程
export const reDraw = (_this) => {
  const ctx = wx.createCanvasContext('myCanvas');

  recordPoints.forEach(line => {
    const { width, color, x, y } = line[0];
    // 线的宽度
    ctx.setLineWidth(width);
    // 线的颜色
    ctx.setStrokeStyle(color);
    // 起始位置
    ctx.moveTo(x, y);
    // 这些样式就默认了
    ctx.setLineCap('round');
    ctx.setLineJoin('round');

    console.log(line);
    line.forEach((p, i) => {
      if (i === 0) {
        return;
      }
      ctx.moveTo(...p.move);
      ctx.quadraticCurveTo(...p.draw);
      ctx.stroke();
      ctx.draw(true);
    });
  });

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