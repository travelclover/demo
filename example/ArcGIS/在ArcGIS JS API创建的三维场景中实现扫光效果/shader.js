/*
 * @Description: 着色器
 * @Author: travelclover(travelclover@163.com)
 * @Date: 2023-08-04 16:47:12
 */
// 顶点着色器
export const vertexShaderSource = `#version 300 es
in vec3 aPosition;
in vec3 aColor;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
out vec4 vColor;

void main() {
  gl_PointSize = 10.0;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1);
  vColor = vec4(aColor, 1);
}
`;

// 片元着色器
export const fragmentShaderSource = `#version 300 es
precision highp float;

in vec4 vColor;
out vec4 outColor;

void main() {
  outColor = vColor;
}
`;

// 圆的顶点着色器
export const circleVertexShaderSource = `#version 300 es
in vec3 aPosition;
in vec4 aColor;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
out vec4 vColor;

void main() {
  gl_PointSize = 10.0;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1);
  vColor = vec4(aColor);
}
`;

// 圆的片元着色器
export const circleFragmentShaderSource = `#version 300 es
precision highp float;

in vec4 vColor;
out vec4 outColor;

void main() {
  outColor = vColor;
}
`;
