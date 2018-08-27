// 跟绘制有关的一些方法
// 原先采用的是 bindtouchmove 这个方法带来了两个问题：
//    1、性能问题，尤其是性能比较差的手机，当滑动比较快的时候会出现线条断断续续的
//    2、在绘制半透明的时候会出现一些颜色特别重的小点，主要是因为重复调用 ctx.draw()引起
// 所以这里将绘制的一些方法重新整合一下，采用 setInterval 一直记录点，然后进行存储，这种方法也方便撤销

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
export const recordPointsFun = (e) => {
  const l = recordPoints.length;
  recordPoints[l-1].push({
    x: e.touches[0].x,
    y: e.touches[0].y,
  });
};

// 绘制过程
export const reDraw = (_this) => {
  let ctx = wx.createCanvasContext('myCanvas');
  ctx.rect(-10, -10, 10000, 10000);
  ctx.setFillStyle('white');
  ctx.fill();
  
  recordPoints.forEach(line => {
    // 线的宽度
    ctx.setLineWidth(line[0].width);
    // 线的颜色
    ctx.setStrokeStyle(line.color);
    // 起始位置
    ctx.moveTo(line[0].x, line[0].y);
    // 这些样式就默认了
    ctx.setLineCap('round');
    ctx.setLineJoin('round');

    line.forEach((p, i) => {
      // 第一个点就不管了
      if (i === 0) {
        return;
      }
      ctx.lineTo(p.x, p.y);
    })
    ctx.stroke();
  });

  ctx.draw();
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