class ViewLink {
  _views = []; // 视图列表
  _linkedIndex = []; // 已经关联的视图的索引值数组
  _watchEvents = []; // watch监听事件列表
  _targetView = null;
  _isInteracting = false; // 是否正在交互
  _isAnimating = false; // 是否正在动画
  _isUpdating = false; // 是否正在更新视图

  constructor(properties) {
    const { views } = properties;
    this._views = views;
  }

  /**
   * 地图场景数组
   *
   * @memberof ViewLink
   */
  get views() {
    return this._views;
  }
  set views(views) {
    this._views = views;
    this.cancelLink(); // 取消所有关联
  }

  /**
   * 已经关联的地图场景
   *
   * @readonly
   * @memberof ViewLink
   */
  get linkedViews() {
    const views = [];
    this._linkedIndex.forEach((index) => {
      views.push(this.views[index]);
    });
    return views;
  }

  /**
   * 已经关联的地图场景索引值
   *
   * @readonly
   * @memberof ViewLink
   */
  get linkedViewsIndex() {
    return [...this._linkedIndex];
  }

  /**
   * 关联视图
   * @param indexs 需要关联的视图索引值
   */
  link(indexs = []) {
    const unlinked = [];
    let viewIndexs = typeof indexs === 'number' ? [indexs] : indexs;
    this._views.map((view, index) => {
      if (viewIndexs.length === 0) {
        viewIndexs = this._views.map((item, index) => index);
      }
      if (
        this._linkedIndex.indexOf(index) < 0 &&
        viewIndexs.indexOf(index) > -1
      ) {
        unlinked.push(index);
      }
    });
    const linkedIndex = [...this._linkedIndex, ...unlinked];
    linkedIndex.sort((a, b) => a - b);
    this._linkedIndex = linkedIndex;
    this._addWatchEvents(); // 添加watch事件
  }

  /**
   * 取消关联
   * @param viewIndexs 需要取消关联的视图索引值
   */
  cancelLink(indexs = []) {
    let viewIndexs = typeof indexs === 'number' ? [indexs] : indexs;
    if (!viewIndexs || viewIndexs?.length === 0) {
      this._linkedIndex = [];
    } else {
      const linkedIndex = this._linkedIndex.filter(
        (index) => viewIndexs.indexOf(index) < 0
      );
      linkedIndex.sort((a, b) => a - b);
      this._linkedIndex = linkedIndex;
    }
    this._addWatchEvents(); // 添加watch事件
  }

  /**
   * 销毁
   */
  destory() {
    this.cancelLink();
  }

  /**
   * 清空所有监听事件
   */
  _clearWatchEvents() {
    this._watchEvents.forEach((item) => {
      if (item.remove) {
        item.remove();
      }
    });
    this._watchEvents = [];
  }
  /**
   * 给所有关联的视图添加监听事件
   */
  _addWatchEvents() {
    this._clearWatchEvents();
    const watchEvents = [];
    this._linkedIndex.forEach((index) => {
      const view = this._views[index];
      watchEvents.push(
        view.watch(
          ['interacting', 'animation'],
          (newValue, oldValue, propertyName) => {
            if (this._targetView && this._targetView !== view && newValue) {
              this._targetView = view;
            }
            if (propertyName === 'interacting') {
              this._isInteracting = newValue;
              if (newValue && !this._isUpdating) {
                this._targetView = view;
                window.requestAnimationFrame(this._update.bind(this, view));
              } else if (!newValue && !this._isAnimating) {
                this._targetView = null;
                this._isUpdating = false;
              }
            } else if (propertyName === 'animation') {
              this._isAnimating = newValue;
              if (newValue && !this._isUpdating) {
                this._targetView = view;
                window.requestAnimationFrame(this._update.bind(this, view));
              } else if (!newValue && !this._isInteracting) {
                this._targetView = null;
                this._isUpdating = false;
              }
            }
          }
        )
      );
    });
    this._watchEvents = watchEvents;
  }

  /**
   * 同步更新view视图
   */
  _update(view) {
    this._isUpdating = true;
    let views = [];
    this._linkedIndex.forEach((index) => {
      views.push(this._views[index]);
    });
    views.forEach((view) => {
      if (view !== this._targetView) {
        let camera = this._targetView?.camera.clone();
        if (camera) {
          view.camera = camera;
        }
      }
    });
    if (!this._targetView) {
      this._isUpdating = false;
      return;
    }
    window.requestAnimationFrame(this._update.bind(this, view));
  }
}

export default ViewLink;
