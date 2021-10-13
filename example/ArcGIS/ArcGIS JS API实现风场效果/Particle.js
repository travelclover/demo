class Particle {
  constructor(x, y) {
    this.x = x; // 坐标x值
    this.y = y; // 坐标y值
    this.speedRate = 0.4; // 速率，用来控制粒子流动的快慢
    this.speedX = 0; // 速度在x方向上的增量
    this.speedY = 0; // 速度在y方向上的增量
    this.lifetime = 1 + Math.random() * 800; // 粒子生命周期，每次更新都会减小
    this.nextX = x + this.speedX; // 接下来粒子的x坐标
    this.nextY = y + this.speedY; // 接下来粒子的y坐标
  }

  // 更新粒子的方法
  update() {
    this.x = this.nextX; // 更新x坐标
    this.y = this.nextY; // 更新y坐标
    this.speedX += (Math.random() * 2 - 1) * this.speedRate; // x方向增量
    this.speedY += (Math.random() * 2 - 1) * this.speedRate; // y方向增量
    this.nextX = this.x + this.speedX; // 计算接下来粒子的x坐标
    this.nextY = this.y + this.speedY; // 计算接下来粒子的y坐标
    this.lifetime--; // 生命周期减1
  }
}

export default Particle;
