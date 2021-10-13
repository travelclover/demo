class Grid {
  constructor(data, particleCount, view) {
    this.view = view;
    let header = data[0].header;
    let { nx, ny, lo1, la1, dx, dy } = header;
    this.minLot = lo1; // 最小经度
    this.maxLat = la1; // 最大纬度
    this.maxLot = lo1 + (nx - 1) * dx; // 最大经度
    this.minLat = la1 - (ny - 1) * dy; // 最小纬度
    this.colNum = nx; // 列数
    this.rowNum = ny; // 行数
    this.dx = dx;
    this.dy = dy;
    this.lo1 = lo1;
    this.la1 = la1;

    // 创建棋盘
    this.createGrid(data);

    // 生成粒子
    this.createParticles(particleCount);
  }

  // 创建棋盘
  createGrid(data) {
    let uData = data[0].data;
    let vData = data[1].data;

    // 生成棋盘
    let grid = [];
    let index = 0;
    for (let i = 0; i < this.rowNum; i++) {
      let row = [];
      for (let j = 0; j < this.colNum; j++, index++) {
        let u = uData[index];
        let v = vData[index];
        let lot = this.lo1 + this.dx * j; // 计算经度
        let lat = this.la1 - this.dy * i; // 计算纬度
        row.push(new DataPoint(lot, lat, u, v));
      }
      grid.push(row);
    }
    this.grid = grid;
  }

  // 生成粒子组
  createParticles(particleCount) {
    let particles = []; // 粒子数组

    for (let i = 0; i < particleCount; i++) {
      let lot = this.minLot + Math.random() * (this.maxLot - this.minLot); // 随机经度
      let lat = this.minLat + Math.random() * (this.maxLat - this.minLat); // 随机纬度
      let speed = this.getSpeedByLotLat(lot, lat);
      particles.push(new Particle(lot, lat, speed, this.view));
    }
    this.particles = particles;
  }

  // 通过坐标获取速度
  getSpeedByLotLat(lot, lat) {
    let minX = Math.floor((lot - this.lo1) / this.dx);
    let maxX = minX + 1;
    let minY = Math.floor((this.la1 - lat) / this.dy);
    let maxY = minY + 1;

    try {
      let o1 = this.grid[minY][minX];
      let o2 = this.grid[minY][maxX];
      let o3 = this.grid[maxY][minX];
      let o4 = this.grid[maxY][maxX];

      let speed1_u = o1.speed.u;
      let speed1_v = o1.speed.v;
      let speed2_u = o2.speed.u;
      let speed2_v = o2.speed.v;
      let speed3_u = o3.speed.u;
      let speed3_v = o3.speed.v;
      let speed4_u = o4.speed.u;
      let speed4_v = o4.speed.v;

      // 计算
      let r1_u =
        ((lot - o1.lot) * (speed2_u - speed1_u) -
          speed1_u * (o2.lot - o1.lot)) /
        (o2.lot - o1.lot);
      let r1_v =
        ((lot - o1.lot) * (speed2_v - speed1_v) -
          speed1_v * (o2.lot - o1.lot)) /
        (o2.lot - o1.lot);
      let r2_u =
        ((lot - o3.lot) * (speed4_u - speed3_u) -
          speed3_u * (o4.lot - o3.lot)) /
        (o4.lot - o3.lot);
      let r2_v =
        ((lot - o3.lot) * (speed4_v - speed3_v) -
          speed3_v * (o4.lot - o3.lot)) /
        (o4.lot - o3.lot);
      let p_u =
        ((lat - o1.lat) * (r2_u - r1_u) - r1_u * (o3.lat - o1.lat)) /
        (o3.lat - o1.lat);
      let p_v =
        ((lat - o1.lat) * (r2_v - r1_v) - r1_v * (o3.lat - o1.lat)) /
        (o3.lat - o1.lat);

      // if (p_v < 0) {
      //   console.log(o1, o2, o3, o4, lot, lat);
      // }

      return new Speed(p_u, p_v);
    } catch (err) {
      return false;
    }

  }

  // 更新粒子数组
  updateParticles() {
    this.particles.forEach((particle) => {
      let speed = this.getSpeedByLotLat(particle.nextLot, particle.nextLat);
      particle.update(speed); // 调用粒子实例的更新方法
      if (!speed || particle.lifetime < 0) {
        // 如果粒子的生命周期小于0，则重新随机位置
        let lot = this.minLot + Math.random() * (this.maxLot - this.minLot); // 随机经度
        let lat = this.minLat + Math.random() * (this.maxLat - this.minLat); // 随机纬度
        let speed = this.getSpeedByLotLat(lot, lat);
        particle.reset(lot, lat, speed);
      }
    });
  }
}

class DataPoint {
  constructor(lot, lat, u, v) {
    this.lot = lot; // 经度
    this.lat = lat; // 纬度
    this.speed = new Speed(u, v);
  }
}

// 粒子类
class Particle {
  constructor(lot, lat, speed, view) {
    this.view = view;
    this.reset(lot, lat, speed);
  }

  // 更新粒子的方法
  update(speed) {
    this.lot = this.nextLot;
    this.lat = this.nextLat;
    this.x = this.nextX; // 更新x坐标
    this.y = this.nextY; // 更新y坐标
    this.speedX = (speed.u / 200) * this.speedRate; // 速度在x方向上的增量
    this.speedY = (speed.v / 200) * this.speedRate; // 速度在y方向上的增量
    this.nextLot = this.lot + this.speedX; // 接下来粒子的经度
    this.nextLat = this.lat + this.speedY; // 接下来粒子的纬度
    // this.nextLot = this.lot + 0.01; // 接下来粒子的经度
    // this.nextLat = this.lat + 0.001; // 接下来粒子的纬度
    this.lifetime--; // 生命周期减1
    // 将地图点转换为屏幕点
    let mapPoint = {
      x: this.nextLot,
      y: this.nextLat,
      spatialReference: {
        wkid: 4326,
      },
    };
    const screenPoint = this.view.toScreen(mapPoint);
    this.nextX = screenPoint.x; // 坐标x值
    this.nextY = screenPoint.y; // 坐标y值
  }

  reset(lot, lat, speed) {
    this.lot = lot;
    this.lat = lat;
    this.speed = speed;
    this.speedRate = 0.04; // 速率，用来控制粒子流动的快慢
    this.speedX = (speed.u / 200) * this.speedRate; // 速度在x方向上的增量
    this.speedY = (speed.v / 200) * this.speedRate; // 速度在y方向上的增量
    this.lifetime = 1 + Math.random() * 800; // 粒子生命周期，每次更新都会减小
    this.nextLot = lot + this.speedX; // 接下来粒子的经度
    this.nextLat = lat + this.speedY; // 接下来粒子的纬度

    // 将地图点转换为屏幕点
    let mapPoint = {
      x: lot,
      y: lat,
      spatialReference: {
        wkid: 4326,
      },
    };
    const screenPoint = this.view.toScreen(mapPoint);
    this.x = screenPoint.x; // 坐标x值
    this.y = screenPoint.y; // 坐标y值
    let mapPoint1 = {
      x: this.nextLot,
      y: this.nextLat,
      spatialReference: {
        wkid: 4326,
      },
    };
    const screenPoint1 = this.view.toScreen(mapPoint1);
    this.nextX = screenPoint1.x; // 接下来粒子的x坐标
    this.nextY = screenPoint1.y; // 接下来粒子的y坐标
  }
}

// 速度
class Speed {
  constructor(u, v) {
    this.u = u; // u分量
    this.v = v; // v分量
    this.uv = Math.sqrt(u * u + v * v);
  }
}

export default Grid;
