// @ts-nocheck

// Property metadata is only used in Figma Design, so this is a no-op.
function defineProperties(
  _component: unknown,
  _properties: unknown,
): void {}

export default function Effect() { }
export function setup(device, frame) {
    var SHADER = `
diagnostic(off,derivative_uniformity);
struct Uniforms {
  dimensions: vec4f,
  warpParams: vec4f,
  warpMode: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var inputTex: texture_2d<f32>;

struct VsOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex fn vs_main(@location(0) pos: vec2f, @location(1) uv: vec2f) -> VsOut {
  var out: VsOut;
  out.position = vec4f(pos, 0.0, 1.0);
  out.uv = uv;
  return out;
}

fn computeWarpedUv(outUv: vec2f) -> vec2f {
  let amplitude = u.warpParams.x;
  let warpScale = u.warpParams.y;
  let centerUv = u.warpParams.zw / 100.0;
  let warpMode = i32(u.warpMode + 0.5);
  let uv = outUv;
  let relUv = uv - centerUv;
  let dist = length(relUv);
  let scaledA = amplitude * 5.0;
  let scaledF = warpScale * 2.0;
  let coverR = 0.72;
  var warpedUv: vec2f;

  if (warpMode == 0) {
    let offsetX = (amplitude / 20.0) * sin(6.2831853 * warpScale * relUv.y);
    let offsetY = (amplitude / 20.0) * sin(6.2831853 * warpScale * relUv.x);
    warpedUv = uv + vec2f(offsetX, offsetY);
  } else if (warpMode == 1) {
    let f = clamp(1.0 - dist / coverR, 0.0, 1.0);
    let angle = (scaledA / 100.0) * 6.2831853 * scaledF * f;
    let c = cos(angle);
    let s = sin(angle);
    warpedUv = centerUv + vec2f(relUv.x * c - relUv.y * s, relUv.x * s + relUv.y * c);
  } else if (warpMode == 2) {
    let factor = clamp(1.0 - dist * 2.0 / max(scaledF * 2.0, 0.0001), 0.0, 1.0);
    warpedUv = uv - relUv * (scaledA / 100.0) * factor;
  } else if (warpMode == 3) {
    let factor = clamp(1.0 - dist * 2.0 / max(scaledF * 2.0, 0.0001), 0.0, 1.0);
    warpedUv = uv + relUv * (scaledA / 100.0) * factor;
  } else if (warpMode == 4) {
    let mag = (scaledA / 100.0) * sin(6.2831853 * scaledF * dist);
    var dir: vec2f;
    if (dist < 0.0001) { dir = vec2f(0.0); } else { dir = relUv / dist; }
    warpedUv = uv + dir * mag;
  } else if (warpMode == 5) {
    let offsetX = (scaledA / 100.0) * sin(6.2831853 * scaledF * (relUv.y + relUv.x * 0.3));
    warpedUv = uv + vec2f(offsetX, 0.0);
  } else if (warpMode == 6) {
    let offsetY = -(scaledA / 100.0) * relUv.y * sin(6.2831853 * scaledF * uv.x);
    warpedUv = uv + vec2f(0.0, offsetY);
  } else {
    let f = clamp(1.0 - dist / coverR, 0.0, 1.0);
    let angle = (scaledA / 100.0) * 6.2831853 * scaledF * f * f;
    let c = cos(angle);
    let s = sin(angle);
    warpedUv = centerUv + vec2f(relUv.x * c - relUv.y * s, relUv.x * s + relUv.y * c);
  }
  return warpedUv;
}

fn computeWarpMask(outUv: vec2f) -> f32 {
  let centerUv = u.warpParams.zw / 100.0;
  let warpScale = u.warpParams.y;
  let warpMode = i32(u.warpMode + 0.5);
  let dist = length(outUv - centerUv);
  let scaledF = warpScale * 2.0;
  let coverR = 0.72;
  if (warpMode == 0 || warpMode == 4 || warpMode == 5 || warpMode == 6) { return 1.0; }
  if (warpMode == 1 || warpMode == 7) { return clamp(1.0 - dist / coverR, 0.0, 1.0); }
  return clamp(1.0 - dist * 2.0 / max(scaledF * 2.0, 0.0001), 0.0, 1.0);
}

@fragment fn fs_main(in: VsOut) -> @location(0) vec4f {
  let outUv = in.uv;
  let outputWidth = u.dimensions.x;
  let outputHeight = u.dimensions.y;
  let inputWidth = u.dimensions.z;
  let inputHeight = u.dimensions.w;
  let warpMask = computeWarpMask(outUv);
  if (warpMask == 0.0) { return textureSampleLevel(inputTex, samp, outUv, 0.0); }
  let duvdx = vec2f(1.0 / outputWidth, 0.0);
  let duvdy = vec2f(0.0, 1.0 / outputHeight);
  let wc = computeWarpedUv(outUv);
  let wcx = computeWarpedUv(outUv + duvdx);
  let wcy = computeWarpedUv(outUv + duvdy);
  let gx = (wcx - wc) * vec2f(inputWidth, inputHeight);
  let gy = (wcy - wc) * vec2f(inputWidth, inputHeight);
  let footprint = max(length(gx), length(gy));
  let MAX_GRID = 6;
  let N = clamp(i32(ceil(footprint)), 1, MAX_GRID);
  let fN = f32(N);
  var colorSum = vec4f(0.0);
  var weightSum = 0.0;
  for (var j = 0; j < MAX_GRID; j++) {
    for (var i = 0; i < MAX_GRID; i++) {
      if (i >= N || j >= N) { continue; }
      let sampleOffsetX = (f32(i) + 0.5) / fN - 0.5;
      let sampleOffsetY = (f32(j) + 0.5) / fN - 0.5;
      let sampleUv = outUv + vec2f(sampleOffsetX / outputWidth, sampleOffsetY / outputHeight);
      let sMask = computeWarpMask(sampleUv);
      if (sMask == 0.0) { continue; }
      let texUv = computeWarpedUv(sampleUv);
      let col = textureSampleLevel(inputTex, samp, clamp(texUv, vec2f(0.0), vec2f(1.0)), 0.0);
      colorSum = colorSum + col * sMask;
      weightSum = weightSum + sMask;
    }
  }
  if (warpMask == 1.0) { return colorSum / weightSum; }
  let origColor = textureSampleLevel(inputTex, samp, outUv, 0.0);
  if (weightSum < 0.0001) { return origColor; }
  return mix(origColor, colorSum / weightSum, warpMask);
}
`;
    frame.state.shaderModule = device.createShaderModule({ code: SHADER });
    frame.state.uniformBuf = device.createBuffer({
        size: 48,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    frame.state.sampler = device.createSampler({
        minFilter: "linear",
        magFilter: "linear",
        addressModeU: "clamp-to-edge",
        addressModeV: "clamp-to-edge",
    });
    frame.state.quad = device.createBuffer({
        size: 6 * 4 * 4,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(frame.state.quad.getMappedRange()).set([
        -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 1, 1, 1,
        1, 1, 0,
    ]);
    frame.state.quad.unmap();
}
export function render(device, frame) {
    if (frame.input == null) {
        return;
    }
    var p = frame.params;
    var uniforms = new Float32Array(12);
    uniforms[0] = (frame.output.physicalWidth ?? frame.output.width);
    uniforms[1] = (frame.output.physicalHeight ?? frame.output.height);
    uniforms[2] = (frame.input.physicalWidth ?? frame.input.width);
    uniforms[3] = (frame.input.physicalHeight ?? frame.input.height);
    uniforms[4] = p.amplitude;
    uniforms[5] = p.warpScale;
    uniforms[6] = p.centerPoint.x;
    uniforms[7] = p.centerPoint.y;
    uniforms[8] = p.warpMode;
    device.queue.writeBuffer(frame.state.uniformBuf, 0, uniforms);
    if (frame.state.pipelineFormat !== frame.output.format) {
        frame.state.pipeline = device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: frame.state.shaderModule,
                entryPoint: "vs_main",
                buffers: [
                    {
                        arrayStride: 16,
                        attributes: [
                            { shaderLocation: 0, format: "float32x2", offset: 0 },
                            { shaderLocation: 1, format: "float32x2", offset: 8 },
                        ],
                    },
                ],
            },
            fragment: {
                module: frame.state.shaderModule,
                entryPoint: "fs_main",
                targets: [{ format: frame.output.format }],
            },
            primitive: { topology: "triangle-list" },
        });
        frame.state.pipelineFormat = frame.output.format;
    }
    var bindGroup = device.createBindGroup({
        layout: frame.state.pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: frame.state.uniformBuf } },
            { binding: 1, resource: frame.state.sampler },
            { binding: 2, resource: frame.input.createView() },
        ],
    });
    var encoder = device.createCommandEncoder();
    var pass = encoder.beginRenderPass({
        colorAttachments: [
            {
                view: frame.output.createView(),
                loadOp: "clear",
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                storeOp: "store",
            },
        ],
    });
    pass.setPipeline(frame.state.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, frame.state.quad);
    pass.draw(6);
    pass.end();
    device.queue.submit([encoder.finish()]);
}
defineProperties(Effect, {
    warpMode: {
        type: "number",
        label: "Warp type",
        defaultValue: 0,
        control: "select",
        options: [
            { value: 0, label: "Sine wave" },
            { value: 1, label: "Twist" },
            { value: 2, label: "Bulge" },
            { value: 3, label: "Pinch" },
            { value: 4, label: "Ripple" },
            { value: 5, label: "Flag" },
            { value: 6, label: "Squeeze" },
            { value: 7, label: "Swirl" },
        ],
    },
    amplitude: {
        type: "number",
        label: "Amplitude",
        defaultValue: 3,
        control: "slider",
        min: 0,
        max: 20,
        step: 0.1,
    },
    warpScale: {
        type: "number",
        label: "Warp scale",
        defaultValue: 1,
        control: "slider",
        min: 0,
        max: 5,
        step: 0.05,
    },
    centerPoint: {
        type: "point",
        label: "Center",
        defaultValue: { x: 50, y: 50 },
        control: "point",
        mode: "canvas_and_ui",
        unit: "%",
    },
});

export const manifest = {
  "name": "Warp",
  "version": 3,
  "isAnimated": false,
  "usesMouse": false,
  "renderScaleAware": true
}
