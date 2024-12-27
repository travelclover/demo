/*
 * @Description: 着色器
 * @Author: travelclover(travelclover@163.com)
 * @Date: 2023-08-04 16:47:12
 */
// 顶点着色器
export const vertexShaderSource = `#version 300 es
in vec3 aPosition;
in vec3 aColor; // 颜色
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform vec3 uLocalOriginRender;
out vec3 vPosition; // 没有经过偏移的原始坐标投影到地表的坐标
out vec4 vColor;

void main() {
  gl_PointSize = 10.0;

  vec3 positionOriginal = aPosition + uLocalOriginRender;
  float len1 = length(positionOriginal); // 点到原点(0,0,0)的距离
  float len2 = length(uLocalOriginRender); // 定义的局部原点到(0,0,0)的距离,可以理解为是地表到地心的距离
  float ratio = len2 / len1;
  vec3 position = ratio * positionOriginal;
  vPosition = position;

  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1);
  vColor = vec4(aColor, 1);
}
`;

// 片元着色器
export const fragmentShaderSource = `#version 300 es
precision highp float;

uniform float uScalingFactor; // 圆的缩放因子
in vec3 vPosition; // 没有经过偏移的原始坐标投影到地表的坐标
in vec4 vColor;
out vec4 outColor;

struct Circle {
  vec3 center; // 中心坐标
  vec3 color; // 颜色
  float radius; // 半径
};

// 颜色叠加, cT前景色 cB背景色
vec4 colorFusion(in vec4 cT, in vec4 cB) {
  float alpha = cT.a + cB.a * (1.0 - cT.a);
  vec4 colorF = (cT * cT.a + cB * cB.a * (1.0 - cT.a)) / alpha;

  return vec4(colorF.rgb, alpha);
}

void main() {
  Circle circles[2];

  for (int i = 0; i < 2; i++) {
    circles[i] = Circle(vec3(-1334039.625, 5324356, 3248416.25), vec3(0, 1, 1), 200.0);
  }

  float radius = 200.0;
  vec3 circleCenter = vec3(-1334039.625, 5324356, 3248416.25);
  float len = length(circleCenter - vPosition);

  float radiusLen = radius * uScalingFactor; // 半径距离

  if (len < radiusLen) {
    float opacity = len / radiusLen; // 计算位置的透明度

    vec4 color = colorFusion(vec4(1, 0, 0, opacity), vColor);
    outColor = color;
  } else {
    outColor = vColor;
  }
}
`;

function generateByTemplate(str) {
  return `#version 300 es
  precision highp float;

  uniform float uScalingFactor; // 圆的缩放因子
  in vec3 vPosition; // 没有经过偏移的原始坐标投影到地表的坐标
  in vec4 vColor;
  out vec4 outColor;

  struct Circle {
    vec3 center; // 中心坐标
    vec3 color; // 颜色
    float radius; // 半径
  };

  // 颜色叠加, cT前景色 cB背景色
  vec4 colorFusion(in vec4 cT, in vec4 cB) {
    float alpha = cT.a + cB.a * (1.0 - cT.a);
    vec4 colorF = (cT * cT.a + cB * cB.a * (1.0 - cT.a)) / alpha;

    return vec4(colorF.rgb, alpha);
  }

  void main() {
    ${str}

    vec4 finalColor = vColor; // 最终颜色

    for (int i = 0; i < circleLength; i++) {
      float radius = circles[i].radius;
      vec3 circleCenter = circles[i].center;
      vec3 color = circles[i].color;
      float len = length(circleCenter - vPosition); // 算两个向量相减的长度

      float radiusLen = radius * uScalingFactor; // 半径距离

      if (len < radiusLen) {
        float opacity = len / radiusLen; // 计算位置的透明度
        finalColor = colorFusion(vec4(color, opacity), finalColor);
      }
    }

    outColor = finalColor;
  }
  `;
}

// 生成片元着色器源码
export function generateFragmentShaderSource(circles) {
  const list = [
    `Circle circles[${circles.length}];`,
    `int circleLength = ${circles.length};`,
  ];

  for (let i = 0; i < circles.length; i++) {
    const centerStr = circles[i].centerRender.join(',');
    const colorStr = circles[i].color.map((i) => i / 255).join(',');
    const radius = Number(circles[i].radius).toFixed(2);
    list.push(
      `circles[${i}] = Circle(vec3(${centerStr}), vec3(${colorStr}), ${radius});`
    );
  }

  const str = list.join(`
  `);

  return generateByTemplate(str);
}

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
