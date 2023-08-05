/*
 * @Description: 工具方法
 * @Author: travelclover(travelclover@163.com)
 * @Date: 2023-08-04 15:07:32
 */

/**
 * 根据圆半径和分段数获取构成圆的顶点列表
 * @param {number} radius 半径
 * @param {number} segments 分段数
 * @returns 返回顶点坐标列表
 */
export function calculateCircleVertices(radius, segments) {
  const vertices = [];

  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);

    vertices.push([x, y, 0]);
  }

  return vertices;
}

/**
 * 计算一个点到另一个点的向量
 * @param {number[]} startPoint 起始点坐标 [x, y, z]
 * @param {number[]} endPoint 结束点坐标 [x, y, z]
 * @returns 返回向量
 */
export function vectorFromPoints(startPoint, endPoint) {
  const point1 = glMatrix.vec3.fromValues(...startPoint);
  const point2 = glMatrix.vec3.fromValues(...endPoint);
  const vector = glMatrix.vec3.subtract(glMatrix.vec3.create(), point2, point1);
  return vector;
}

/**
 * 计算一个点到另一个点的变换矩阵
 * @param {number[]} startPoint 起始点坐标 [x, y, z]
 * @param {number[]} endPoint 结束点坐标 [x, y, z]
 * @returns 返回变换矩阵
 */
export function transformationMatrixFromPoints(startPoint, endPoint) {
  const p1 = glMatrix.vec3.fromValues(...startPoint);
  const p2 = glMatrix.vec3.fromValues(...endPoint);

  // 创建变换矩阵
  const transformationMatrix = glMatrix.mat4.create();

  // 计算平移向量
  const translationVector = glMatrix.vec3.subtract(
    glMatrix.vec3.create(),
    p2,
    p1
  );

  // 应用平移变换
  glMatrix.mat4.translate(
    transformationMatrix,
    transformationMatrix,
    translationVector
  );

  return transformationMatrix;
}

/**
 * 计算一个向量到另一个向量的旋转矩阵
 * @param {number[]} v1 向量1
 * @param {number[]} v2 向量2
 * @returns 返回矩阵
 */
export function transformationMatrixFromVectors(v1, v2) {
  // 计算旋转轴
  const axis = glMatrix.vec3.cross(glMatrix.vec3.create(), v1, v2);
  glMatrix.vec3.normalize(axis, axis);

  // 计算旋转角度
  const angle = Math.acos(
    glMatrix.vec3.dot(v1, v2) /
      (glMatrix.vec3.length(v1) * glMatrix.vec3.length(v2))
  );

  // 创建一个存储旋转矩阵的4x4矩阵
  const rotationMatrix = glMatrix.mat4.create();

  // 构建旋转矩阵
  glMatrix.mat4.fromRotation(rotationMatrix, angle, axis);

  return rotationMatrix;
}
