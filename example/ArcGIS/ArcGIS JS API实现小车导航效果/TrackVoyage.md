# TrackVoyage类说明文档

实现路径导航效果的工具类。
***
***

## 构造方法
```javascript
new TrackVoyage(properties)
```

### 参数
#### properties [Object]
| 名称   | 类型   | 必填   | 描述   | 
| :---- | :---- | :---- | :---- | 
| view | __esri.SceneView | 是 | 实例化的地图场景SceneView。[更多详情](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-SceneView.html) |
| model | String | 否 | 模型地址，支持后缀为gltf和glb的模型。未传值则默认是个球。 |
| modelSize | Array\<Number\> | 否 | 模型大小，包含三个数字，分别代表[width, depth, height]，单位为米。当只包含一个数字时，表示宽度固定，深度和高度将按照模型比例缩放。默认值为[10]。 |
| track | __esri.Polyline | 否 | 轨道路径。 |
| speed | Number | 否 | 模型移动速度。默认值为40。 |
| dependencies | Object | 是 | 所要用到的ArcGIS API依赖。 |  

<br>  

##### dependencies 参数对象概述
| 名称   | 类型   | 必填   | 描述   | 
| :---- | :---- | :---- | :---- | 
| StreamLayer | __esri.StreamLayer | 是 | ArcGIS API 流图层类。[更多详情](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-StreamLayer.html) | 
| geometryEngine | __esri.geometryEngine | 是 | ArcGIS API 客户端几何引擎，用于测试、测量和分析两个或多个2D几何图形之间的空间关系。[更多详情](https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-geometryEngine.html) |

### 示例
```javascript
const tv = new TrackVoyage({
  view: sceneView,
  model: './Audi_A6.glb',
  track: line,
  dependencies: {
    StreamLayer: StreamLayer,
    geometryEngine: geometryEngine,
  },
});
```
***
***

## 属性
| 名称   | 类型   | 只读 | 描述   | 
| :---- | :---- | :---- | :---- |  
| view | __esri.SceneView | 是 | 实例化的地图场景SceneView。[更多详情](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-SceneView.html) |
| model | String | 是 | 模型地址，为null时，模型为球体。 |
| modelSize | Array\<Number\> | 否 | 模型大小，包含三个数字，分别代表[width, depth, height]，单位为米。当只包含一个数字时，表示宽度固定，深度和高度将按照模型比例缩放。 |
| speed | Number | 否 | 模型移动速度，默认值为40。 |
| moving | Boolean | 是 | 模型是否正在移动。 |
| track | __esri.Polyline | 否 | 轨道路径。 |
| trackDensified | __esri.Polyline | 是 | 致密化后的轨道路径。 |
| layer | __esri.StreamLayer | 是 | 创建的StreamLayer实例。 |

***
***

## 方法
| 方法名称 | 返回类型 | 描述   | 
| :---- | :---- | :---- | 
| play() | undefind | 开始模型移动效果。 |
| stop() | undefind | 停止模型移动效果。 |
| destroy() | undefind | 销毁。 |
| cameraFollowing() | undefind | 视角跟随。 |
| stopCameraFollowing() | undefind | 取消视角跟随。 |

***

### play(index?)
开始模型移动效果。如果没有传入 index，则从致密化后轨道的第一个点开始移动或者从模型当前位置继续移动。如果传入index，则从致密化后轨道的index索引值位置开始移动。
| 参数名称   | 类型   | 必填   | 描述   | 
| :---- | :---- | :---- | :---- | 
| index | Number | 否 | 模型开始移动的点位索引值。 |
***

### stop()
停止模型移动效果。
```javascript
tv.stop();
```
***

### destroy()
销毁实例。
```javascript
tv.destroy()
```
***

### cameraFollowing(trackId?)
对指定实体进行视角跟随。如果没有传入trackId，会随机跟随一个实体。
```javascript
const trackId = 1; // 跟随轨道ID为1的实体
tv.cameraFollowing(trackId); 
```
***

### stopCameraFollowing()
取消视角跟随。
```javascript
tv.stopCameraFollowing(trackId); 
```
***
