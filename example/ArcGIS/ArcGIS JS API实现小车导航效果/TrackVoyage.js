/*
 * @Description: 轨迹航行
 * @Author: dengdong(travelclover@163.com)
 * @Date: 2023-06-29 11:05:39
 */

/**
 * 包含坐标x、y的点对象类型
 * @typedef {Object} Point
 * @property {number} x - x坐标
 * @property {number} y - y坐标
 */

/**
 * @typedef {Object} Feature - 更新的feature对象
 * @property {Point} geometry - 几何对象
 * @property {Object.<string, *>} attributes - 属性对象
 */

class TrackVoyage {
  #updateInterval = 1000 / 24;
  #previousTimeStamp = 0; // 上次更新时间戳
  layer = null; // StreamLayer实例
  #speed = 40; // 速度
  #following = false; // 相机是否跟随
  #followingTrackId = null; // 跟随的trackId
  #features = {}; // 用于保存添加过的features
  #track = null; // 轨道路径
  #trackLine = null; // 轨道路径-加密后
  #moving = false; // 是否正在移动
  #movingIndex = 0; // 点位的索引值
  #objectIdCounter = 0; // objectId

  constructor(props) {
    const {
      view, // 实例化的地图场景SceneView
      model, // 模型
      objectIdField = 'OBJECTID', // objectId字段， 默认为 OBJECTID
      trackIdField = 'TRACKID', // trackId字段，默认为 TRACKID
      track = null, // 轨道路径
      fields = [], // 图层字段
      speed = 40, // 速度
      dependencies, // 所用到的依赖
    } = props;
    const { StreamLayer, geometryEngine } = dependencies;
    this.view = view;
    this.model = model;
    this.objectIdField = objectIdField;
    this.trackIdField = trackIdField;
    this.fields = fields;
    this.#speed = speed;
    this.StreamLayer = StreamLayer;
    this.geometryEngine = geometryEngine;
    this.track = track;

    this.init();
  }

  /**
   * 设置轨道路径
   * @param {__esri.Polyline} line - 轨道路径
   */
  set track(line) {
    this.#track = line;
    this.densifyTrackLine();
  }

  /**
   * 获取轨道路径
   * @returns {__esri.Polyline} 返回轨道路径geometry
   */
  get track() {
    return this.#track;
  }

  /**
   * 设置模型移动速度
   */
  set speed(num) {
    this.#speed = num;
    if (this.#trackLine) {
      const percent = this.#movingIndex / this.#trackLine.paths[0].length; // 记录行驶路程的百分比
      this.densifyTrackLine();
      this.#movingIndex = Math.floor(percent * this.#trackLine.paths[0].length); // 根据百分比设置新的索引值
    }
  }

  /**
   * 获取模型移动速度
   * @returns {number} 返回模型移动速度
   */
  get speed() {
    return this.#speed;
  }

  /**
   * 获取致密化后的轨道路径
   * @returns {__esri.Polyline} 获取致密化后的轨道路径geometry
   */
  get trackDensified() {
    return this.#trackLine;
  }

  /**
   * 增加轨道线的点密度
   */
  densifyTrackLine() {
    const maxSegmentLength = this.#speed / (1000 / this.#updateInterval); // 分段最大长度
    const maxSegmentLengthUnit = 'meters'; // 最大分段长度单位 "meters"|"feet"|"kilometers"|"miles"|"nautical-miles"|"yards"|Number
    this.#trackLine = this.geometryEngine.densify(
      this.#track,
      maxSegmentLength,
      maxSegmentLengthUnit
    );
  }

  // 初始化
  init() {
    if (this.layer && this.view) this.view.map.remove(this.layer);

    this.layer = new this.StreamLayer({
      objectIdField: this.objectIdField, // required
      fields:
        this.fields.length > 0
          ? this.fields
          : [
              {
                name: 'OBJECTID', // required
                alias: 'ObjectId',
                type: 'oid',
              },
              {
                name: 'TRACKID',
                alias: 'TrackId',
                type: 'long',
              },
            ],
      timeInfo: {
        trackIdField: this.trackIdField, // required
      },
      geometryType: 'point', // required
      updateInterval: this.#updateInterval,
      popupEnabled: false,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'point-3d',
          symbolLayers: [
            {
              type: 'object',
              resource: this.model
                ? {
                    href: this.model,
                  }
                : {
                    primitive: 'sphere',
                  },
            },
          ],
        },
        // 视觉变量
        visualVariables: [
          {
            type: 'size',
            axis: 'height',
            field: 'height',
            valueUnit: 'meters',
          },
          // {
          //   type: 'size',
          //   axis: 'width',
          //   field: 'width',
          //   valueUnit: 'meters',
          // },
          // {
          //   type: 'size',
          //   axis: 'depth',
          //   field: 'depth',
          //   valueUnit: 'meters',
          // },
          {
            type: 'rotation',
            axis: 'heading', //
            field: 'heading',
            rotationType: 'arithmetic', // geographic：从正北方向顺时针方向旋转  arithmetic：从正东方向逆时针旋转
          },
        ],
      },
    });

    if (this.view) view.map.add(this.layer);
  }

  /**
   * 获取是否正在运动
   */
  get moving() {
    return this.#moving;
  }

  /**
   * 更新模型运动
   * @param {number} timestamp 表示 requestAnimationFrame() 开始执行回调函数的时刻
   */
  #updateMoving(timestamp) {
    if (timestamp - this.#previousTimeStamp >= this.#updateInterval) {
      this.#previousTimeStamp = timestamp;

      const line = this.#trackLine;
      const pointsLength = line.paths[0].length;
      let index = (this.#movingIndex % pointsLength) + 1;
      if (index > pointsLength - 2) {
        index = 0;
      }
      const point = {
        x: line.paths[0][index + 1][0],
        y: line.paths[0][index + 1][1],
      };
      this.#movingIndex = index;

      this.updateFeatures([
        {
          attributes: {
            TRACKID: 1,
            OBJECTID: this.#objectIdCounter++,
            height: 10,
            // width: 10,
            // heading: angle,
          },
          geometry: {
            x: point.x,
            y: point.y,
          },
        },
      ]);
    }
    if (this.#moving) {
      window.requestAnimationFrame(this.#updateMoving.bind(this));
    }
  }

  /**
   * 更新跟随视角
   * @param {Point} p1 - 第1个点坐标
   * @param {Point} p2 - 第2个点坐标
   */
  #updateCamera(p1, p2) {
    const angle = TrackVoyage.calculateAngle(p1, p2);
    const height = this.view.camera.position.z; // 相机高度
    const tilt = this.view.camera.tilt; // 相机倾斜角度
    const { x, y } = TrackVoyage.calculateCameraPosition(p1, p2, height, tilt);
    const camera = this.view.camera.clone();
    camera.position.x = x;
    camera.position.y = y;
    camera.heading = -(angle + 90) + 180; // heading为正北方向逆时针旋转，所以需要从正东方向的角度转成从正北方向逆时针旋转的角度
    this.view.goTo(camera);
  }

  /**
   * 开始播放
   * @param {number} index 开始的索引值
   */
  play(index) {
    if (this.#trackLine) {
      this.#moving = true;
      this.#movingIndex = index || this.#movingIndex;
      window.requestAnimationFrame(this.#updateMoving.bind(this));
    }
  }

  /**
   * 停止播放
   */
  stop() {
    this.#moving = false;
  }

  /**
   * 更新要素
   * @param {Array<Feature>} features - 更新的要素列表
   */
  updateFeatures(features) {
    if (features.length === 0) return;
    const trackIdField = this.trackIdField; // trackId字段
    features.forEach((item) => {
      const lastFeatures = this.#features[item.attributes[trackIdField]] || [];
      let point1 = item.geometry;
      if (lastFeatures.length > 0) {
        point1 = lastFeatures[0].geometry;
      }
      const point2 = item.geometry;
      const angle = TrackVoyage.calculateAngle(point1, point2);
      item.attributes.heading = angle;
      lastFeatures.unshift(item);
      this.#features[item.attributes[trackIdField]] = lastFeatures.slice(0, 2);
    });

    if (this.layer) {
      this.layer.sendMessageToClient({
        type: 'features',
        features: features,
      });
    }

    // 跟随视角
    if (this.#following) {
      const trackId =
        this.#followingTrackId || features[0].attributes[trackIdField];
      const list = this.#features[trackId];
      if (list.length > 1) {
        const p1 = list[1].geometry;
        const p2 = list[0].geometry;
        this.#updateCamera(p1, p2);
      }
    }
  }

  /**
   * 根据trackId删除要素
   * @param {Array<number>} trackIds 要删除要素的trackId
   */
  deleteFeatures(trackIds) {
    if (this.layer) {
      this.layer.sendMessageToClient({
        type: 'delete',
        trackIds,
      });

      trackIds.forEach((id) => {
        if (this.#followingTrackId === id) this.#followingTrackId = null;
        delete this.#features[id];
      });
    }
  }

  /**
   * 清除全部features
   */
  clearFeatures() {
    if (this.layer) {
      this.layer.sendMessageToClient({
        type: 'clear',
      });

      if (this.#followingTrackId) this.#followingTrackId = null;
    }
  }

  /**
   * 相机跟随
   * @param {number} trackId 要跟随的trackId
   */
  cameraFollowing(trackId) {
    this.#following = true;
    const trackIds = Object.keys(this.#features);
    if (trackIds.includes(trackId)) {
      this.#followingTrackId = trackId;
    } else if (trackIds.length > 0) {
      this.#followingTrackId = trackIds[0];
    }
  }

  /**
   * 停止相机跟随
   */
  stopCameraFollowing() {
    this.#following = false;
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.layer && this.view) this.view.map.remove(this.layer);

    Object.setPrototypeOf(this, null);

    this.view = null;
    this.model = null;
    this.StreamLayer = null;
    this.geometryEngine = null;
    this.layer = null;
  }

  /**
   * 算夹角
   * @param {Point} p1 - 点1的坐标
   * @param {Point} p2 - 点2的坐标
   * @returns {number} 返回角度的度数 -180到180
   */
  static calculateAngle(p1, p2) {
    // 计算线段的斜率
    let slope = (p2.y - p1.y) / (p2.x - p1.x);
    // 计算反正切值，得到弧度制的角度
    let angleRad = Math.atan(slope);
    // 将弧度制转换为角度制
    let angleDeg = (angleRad * 180) / Math.PI;
    // 如果线段在第二、三象限，则加上180度
    if (p2.x < p1.x) {
      angleDeg += 180;
    }
    // 如果角度超出-180度到180度的范围，则减去360度或加上360度
    if (angleDeg > 180) {
      angleDeg -= 360;
    } else if (angleDeg < -180) {
      angleDeg += 360;
    }
    // 返回夹角
    return angleDeg;
  }

  /**
   * 计算倾斜后相机位置
   * @param {Point} p1 - 第1个点坐标
   * @param {Point} p2 - 第2个点坐标
   * @param {number} h - 相机高度
   * @param {number} tilt - 相机倾斜角度
   * @returns {Point} 返回相机x,y坐标
   */
  static calculateCameraPosition(p1, p2, h, tilt) {
    const distance = Math.tan((tilt / 180) * Math.PI) * h; // 距离
    const d = Math.sqrt(
      (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
    );
    const ratio = d / (d + distance);
    const x = (p1.x - p2.x) / ratio + p2.x;
    const y = (p1.y - p2.y) / ratio + p2.y;
    return { x, y };
  }
}
