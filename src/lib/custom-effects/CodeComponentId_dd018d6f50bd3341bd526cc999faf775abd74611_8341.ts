// @ts-nocheck

// Property metadata is only used in Figma Design, so this is a no-op.
function defineProperties(
  _component: unknown,
  _properties: unknown,
): void {}

export default function Effect() { }
function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}
function numberParam(params, name, fallback) {
    return finiteNumber(params[name], fallback);
}
function writeColorParam(data, offset, params, name, fallbackR, fallbackG, fallbackB, fallbackA) {
    const value = params[name] || {};
    data[offset] = finiteNumber(value.r, fallbackR);
    data[offset + 1] = finiteNumber(value.g, fallbackG);
    data[offset + 2] = finiteNumber(value.b, fallbackB);
    data[offset + 3] = finiteNumber(value.a, fallbackA);
}
function writeUniformsIfChanged(device, buffer, data, lastData) {
    let changed = false;
    for (let i = 0; i < data.length; i++) {
        if (!Object.is(data[i], lastData[i])) {
            changed = true;
            break;
        }
    }
    if (changed) {
        device.queue.writeBuffer(buffer, 0, data);
        lastData.set(data);
    }
}
export function setup(device, frame) {
    const colorAdjustWGSL = `
struct Uniforms {
  outputWidth: f32,
  outputHeight: f32,
  outputPad: f32,
  inputWidth: f32,
  inputHeight: f32,
  inputPad: f32,
  exposure: f32,
  contrast: f32,
  blackPoint: f32,
  whitePoint: f32,
  highlights: f32,
  shadows: f32,
  gamma: f32,
  temperature: f32,
  tint: f32,
  vibrance: f32,
  colorFilter: vec4f,
  saturation: f32,
  brilliance: f32,
  definition: f32,
  pad0: f32,
};
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var inputTex: texture_2d<f32>;

struct VsIn {
  @location(0) pos: vec2f,
  @location(1) uv: vec2f,
};
struct VsOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

fn sampleInput(p: vec2f) -> vec4f {
  // p is input-relative (0..1 over the content rect). The bound input texture
  // is the upstream padded output, with the content inset by inputPad on every
  // side, so map content UV -> texture UV before sampling. For a stand-alone
  // effect inputPad is 0 and this reduces to clamp(p).
  let inputDims = max(vec2f(u.inputWidth, u.inputHeight), vec2f(1.0));
  let texCoord =
    (vec2f(u.inputPad) + clamp(p, vec2f(0.0), vec2f(1.0)) * inputDims) /
    (inputDims + vec2f(2.0 * u.inputPad));
  return textureSampleLevel(inputTex, samp, texCoord, 0.0);
}

// Achromatic tone chain, luma-only. Matches fs_main's scaled locals, so a
// neighbor sample and the center land in the same space and flat regions
// cancel in the high-pass. Exposure is applied in sRGB-luma domain as an
// approximation — it's not physically exact, but center and neighbors get the
// same treatment, which is what the local-contrast signal actually needs.
//
// contrast is the linear factor (1 + p/100) and gamma is the resolved exponent
// (exp2(p/100)); both are passed pre-resolved from fs_main so neutral (p == 0)
// is an exact identity here too.
fn toneLuma(srgb: vec3f, exposure: f32, contrast: f32, blackPoint: f32,
            whitePoint: f32, highlights: f32, shadows: f32, gamma: f32) -> f32 {
  var l = dot(srgb, vec3f(0.2126, 0.7152, 0.0722));
  l = l * exp2(exposure);
  l = (l - 0.5) * contrast + 0.5;
  l = clamp((l - blackPoint) / max(whitePoint - blackPoint, 1e-5), 0.0, 1.0);
  let hm = smoothstep(0.5, 1.0, l);
  let sm = smoothstep(0.5, 0.0, l);
  l = clamp(l + highlights * hm + shadows * sm, 0.0, 1.0);
  l = pow(max(l, 0.0), 1.0 / gamma);
  return l;
}

@vertex fn vs_main(in: VsIn) -> VsOut {
  var out: VsOut;
  out.position = vec4f(in.pos, 0.0, 1.0);
  out.uv = in.uv;
  return out;
}

@fragment fn fs_main(@location(0) outputUv: vec2f) -> @location(0) vec4f {
  let dims = max(vec2f(u.outputWidth, u.outputHeight), vec2f(1.0));
  let inputDims = max(vec2f(u.inputWidth, u.inputHeight), vec2f(1.0));
  let fragPx = outputUv * dims;
  let contentOriginPx = vec2f(u.inputPad + u.outputPad);
  let uv = (fragPx - contentOriginPx) / inputDims;
  // --- Raw control values (signed-percent UI, neutral at 0) ---
  let exposureRaw = u.exposure;
  let contrastRaw = u.contrast;
  let blackPointRaw = u.blackPoint;
  let whitePointRaw = u.whitePoint;
  let highlightsRaw = u.highlights;
  let shadowsRaw = u.shadows;
  let gammaRaw = u.gamma;
  let temperatureRaw = u.temperature;
  let tintRaw = u.tint;
  let colorFilter = u.colorFilter;
  let vibranceRaw = u.vibrance;
  let saturationRaw = u.saturation;
  let brillianceRaw = u.brilliance;
  let definitionRaw = u.definition;

  let inputColor = sampleInput(uv);

  // Neutral early-out: when nothing is touched, return the source untouched so
  // an unedited image is bit-exact (no sRGB round-trip rounding, no level/gamma
  // drift). A white or fully-transparent color filter is also neutral.
  let cfNeutral = (colorFilter.a == 0.0) ||
                  (colorFilter.r == 1.0 && colorFilter.g == 1.0 && colorFilter.b == 1.0);
  let neutral =
    exposureRaw == 0.0 &&
    contrastRaw == 0.0 &&
    blackPointRaw == 0.0 &&
    whitePointRaw == 0.0 &&
    highlightsRaw == 0.0 &&
    shadowsRaw == 0.0 &&
    gammaRaw == 0.0 &&
    temperatureRaw == 0.0 &&
    tintRaw == 0.0 &&
    cfNeutral &&
    vibranceRaw == 0.0 &&
    saturationRaw == 0.0 &&
    brillianceRaw == 0.0 &&
    definitionRaw == 0.0;
  if (neutral) {
    return inputColor;
  }

  // --- Resolve UI values into working factors ---
  // contrast/saturation: 1 + p/100  -> -100 = 0x, 0 = 1x (identity), +100 = 2x.
  // gamma: exp2(p/100)              -> -100 ~ 0.5, 0 = 1.0 (identity), +100 ~ 2.0.
  // exposure: ±100 maps to ±4 stops; 0 = identity.
  let exposure = exposureRaw / 100.0 * 4.0;
  let contrast = 1.0 + contrastRaw / 100.0;
  // Levels: signed ±100 around neutral. Black point raises (>0) or lifts (<0)
  // the shadow floor; white point clips (>0) or compresses (<0) the highlight
  // ceiling.
  let blackPoint = blackPointRaw / 100.0 * 0.5;
  let whitePoint = 1.0 - whitePointRaw / 100.0 * 0.5;
  let highlights = highlightsRaw / 100.0;
  let shadows = shadowsRaw / 100.0;
  let gamma = exp2(gammaRaw / 100.0);
  let temperature = temperatureRaw / 100.0;
  let tint = tintRaw / 100.0;
  let vibrance = vibranceRaw / 100.0;
  let saturation = 1.0 + saturationRaw / 100.0;
  let brilliance = brillianceRaw / 100.0;
  let definition = definitionRaw / 100.0;

  // --- sRGB linearize helper (applied to sampled color) ---
  // inputColor is already sampled; linearize it
  let srgbC = inputColor.rgb;
  let linR = select(srgbC.x / 12.92, pow((srgbC.x + 0.055) / 1.055, 2.4), srgbC.x > 0.04045);
  let linG = select(srgbC.y / 12.92, pow((srgbC.y + 0.055) / 1.055, 2.4), srgbC.y > 0.04045);
  let linB = select(srgbC.z / 12.92, pow((srgbC.z + 0.055) / 1.055, 2.4), srgbC.z > 0.04045);
  var rgb = vec3f(linR, linG, linB);
  // 1. White Balance (linear light) — Temperature (blue/orange) + Tint (green/magenta)
  rgb.x *= 1.0 + temperature * 0.3;
  rgb.z *= 1.0 - temperature * 0.3;
  rgb.y *= 1.0 + tint * 0.3;
  // 2. Exposure (linear light)
  rgb *= exp2(exposure);
  // 3. Color Filter (linear light) — blend tint by its alpha
  rgb = mix(rgb, rgb * colorFilter.rgb, colorFilter.a);
  // --- switch to perceptual: encode to sRGB gamma ---
  let cR = select(rgb.x * 12.92, pow(max(rgb.x, 0.0), 1.0/2.4) * 1.055 - 0.055, rgb.x > 0.0031308);
  let cG = select(rgb.y * 12.92, pow(max(rgb.y, 0.0), 1.0/2.4) * 1.055 - 0.055, rgb.y > 0.0031308);
  let cB = select(rgb.z * 12.92, pow(max(rgb.z, 0.0), 1.0/2.4) * 1.055 - 0.055, rgb.z > 0.0031308);
  var c = vec3f(cR, cG, cB);
  // 4. Contrast
  c = (c - 0.5) * contrast + 0.5;
  // 5. Levels
  c = clamp((c - blackPoint) / max(whitePoint - blackPoint, 1e-5), vec3f(0.0), vec3f(1.0));
  // 6. Highlights & Shadows
  var luma = dot(c, vec3f(0.2126, 0.7152, 0.0722));
  let highlightMask = smoothstep(0.5, 1.0, luma);
  let shadowMask = smoothstep(0.5, 0.0, luma);
  c = clamp(c + highlights * highlightMask + shadows * shadowMask, vec3f(0.0), vec3f(1.0));
  // 7. Gamma
  c = pow(max(c, vec3f(0.0)), vec3f(1.0 / gamma));
  // 8. Brilliance — positive adds pop: deepen shadows, lift highlights
  let bLuma = dot(c, vec3f(0.2126, 0.7152, 0.0722));
  let shadowDeepen = -brilliance * smoothstep(0.5, 0.0, bLuma) * 0.4;
  let highlightBoost = brilliance * smoothstep(0.5, 1.0, bLuma) * 0.4;
  c = clamp(c + shadowDeepen + highlightBoost, vec3f(0.0), vec3f(1.0));
  // 9. Vibrance
  luma = dot(c, vec3f(0.2126, 0.7152, 0.0722));
  let currentSat = max(c.x, max(c.y, c.z)) - min(c.x, min(c.y, c.z));
  let effective = vibrance * (1.0 - currentSat);
  c = clamp(mix(vec3f(luma), c, 1.0 + effective), vec3f(0.0), vec3f(1.0));
  // 10. Saturation
  luma = dot(c, vec3f(0.2126, 0.7152, 0.0722));
  c = mix(vec3f(luma), c, saturation);
  // 11. Definition / Clarity — local contrast from a tone-consistent neighborhood
  if (definitionRaw != 0.0) {
    let aspect = inputDims.x / max(inputDims.y, 1.0);
    let defFrac = 0.006;
    let off = vec2f(defFrac, defFrac * aspect);
    let dN = toneLuma(sampleInput(clamp(uv + vec2f(0.0, -off.y), vec2f(0.0), vec2f(1.0))).rgb, exposure, contrast, blackPoint, whitePoint, highlights, shadows, gamma);
    let dS = toneLuma(sampleInput(clamp(uv + vec2f(0.0,  off.y), vec2f(0.0), vec2f(1.0))).rgb, exposure, contrast, blackPoint, whitePoint, highlights, shadows, gamma);
    let dE = toneLuma(sampleInput(clamp(uv + vec2f( off.x, 0.0), vec2f(0.0), vec2f(1.0))).rgb, exposure, contrast, blackPoint, whitePoint, highlights, shadows, gamma);
    let dW = toneLuma(sampleInput(clamp(uv + vec2f(-off.x, 0.0), vec2f(0.0), vec2f(1.0))).rgb, exposure, contrast, blackPoint, whitePoint, highlights, shadows, gamma);
    let localLuma = (dN + dS + dE + dW) * 0.25;
    let lumaCtr = toneLuma(inputColor.rgb, exposure, contrast, blackPoint, whitePoint, highlights, shadows, gamma);
    let midtoneMask = 1.0 - abs(lumaCtr - 0.5) * 2.0;
    let boost = definition * (lumaCtr - localLuma) * midtoneMask;
    c += boost;
  }
  // Preserve the original final clamp even when Definition is neutral.
  c = clamp(c, vec3f(0.0), vec3f(1.0));
  return vec4f(c, inputColor.a);
}
`;
    frame.state.module = device.createShaderModule({ code: colorAdjustWGSL });
    frame.state.pipeline = null;
    frame.state.pipelineFormat = null;
    frame.state.vertexBuffers = [{
            arrayStride: 16,
            attributes: [
                { shaderLocation: 0, format: "float32x2", offset: 0 },
                { shaderLocation: 1, format: "float32x2", offset: 8 },
            ],
        }];
    frame.state.quad = device.createBuffer({
        size: 6 * 4 * 4,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(frame.state.quad.getMappedRange()).set([
        -1, -1, 0, 1,
        1, -1, 1, 1,
        -1, 1, 0, 0,
        -1, 1, 0, 0,
        1, -1, 1, 1,
        1, 1, 1, 0,
    ]);
    frame.state.quad.unmap();
    frame.state.uniformBuf = device.createBuffer({
        size: 96,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    frame.state.uniformData = new Float32Array(24);
    frame.state.lastUniformData = new Float32Array(24);
    frame.state.lastUniformData.fill(Number.NaN);
    frame.state.sampler = device.createSampler({
        magFilter: "linear",
        minFilter: "linear",
        addressModeU: "clamp-to-edge",
        addressModeV: "clamp-to-edge",
    });
    frame.state.placeholder = device.createTexture({
        size: [1, 1, 1],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    device.queue.writeTexture({ texture: frame.state.placeholder }, new Uint8Array([0, 0, 0, 0]), { bytesPerRow: 4 }, { width: 1, height: 1, depthOrArrayLayers: 1 });
    frame.state.placeholderView = frame.state.placeholder.createView();
    frame.state.inputTexture = frame.state.placeholder;
    frame.state.inputView = frame.state.placeholderView;
    frame.state.outputTexture = null;
    frame.state.outputView = null;
    frame.state.bindGroup = null;
}
export function render(device, frame) {
    const params = frame.params || {};
    const output = frame.output || {};
    const width = Math.max(1, finiteNumber(output.width, 1));
    const height = Math.max(1, finiteNumber(output.height, 1));
    const outputPad = finiteNumber(frame.outputPadding, 0);
    const inputPad = finiteNumber(frame.inputPadding, 0);
    const inputWidth = Math.max(1, width - 2 * outputPad);
    const inputHeight = Math.max(1, height - 2 * outputPad);
    const uniformData = frame.state.uniformData;
    uniformData[0] = width;
    uniformData[1] = height;
    uniformData[2] = outputPad;
    uniformData[3] = inputWidth;
    uniformData[4] = inputHeight;
    uniformData[5] = inputPad;
    uniformData[6] = numberParam(params, "exposure", 0);
    uniformData[7] = numberParam(params, "contrast", 0);
    uniformData[8] = numberParam(params, "blackPoint", 0);
    uniformData[9] = numberParam(params, "whitePoint", 0);
    uniformData[10] = numberParam(params, "highlights", 0);
    uniformData[11] = numberParam(params, "shadows", 0);
    uniformData[12] = numberParam(params, "gamma", 0);
    uniformData[13] = numberParam(params, "temperature", 0);
    uniformData[14] = numberParam(params, "tint", 0);
    uniformData[15] = numberParam(params, "vibrance", 0);
    writeColorParam(uniformData, 16, params, "colorFilter", 1, 1, 1, 1);
    uniformData[20] = numberParam(params, "saturation", 0);
    uniformData[21] = numberParam(params, "brilliance", 0);
    uniformData[22] = numberParam(params, "definition", 0);
    uniformData[23] = 0;
    writeUniformsIfChanged(device, frame.state.uniformBuf, uniformData, frame.state.lastUniformData);
    const inputTexture = frame.input != null
        ? frame.input
        : frame.state.placeholder;
    if (frame.state.inputTexture !== inputTexture) {
        frame.state.inputTexture = inputTexture;
        frame.state.inputView = inputTexture === frame.state.placeholder
            ? frame.state.placeholderView
            : inputTexture.createView();
        frame.state.bindGroup = null;
    }
    if (frame.state.outputTexture !== frame.output) {
        frame.state.outputTexture = frame.output;
        frame.state.outputView = frame.output.createView();
    }
    const outputFormat = frame.output.format;
    if (frame.state.pipeline == null || frame.state.pipelineFormat !== outputFormat) {
        frame.state.pipeline = device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: frame.state.module,
                entryPoint: "vs_main",
                buffers: frame.state.vertexBuffers,
            },
            fragment: {
                module: frame.state.module,
                entryPoint: "fs_main",
                targets: [{ format: outputFormat }],
            },
            primitive: { topology: "triangle-list" },
        });
        frame.state.pipelineFormat = outputFormat;
        frame.state.bindGroup = null;
    }
    if (frame.state.bindGroup == null) {
        frame.state.bindGroup = device.createBindGroup({
            layout: frame.state.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: frame.state.uniformBuf } },
                { binding: 1, resource: frame.state.sampler },
                { binding: 2, resource: frame.state.inputView },
            ],
        });
    }
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        colorAttachments: [{
                view: frame.state.outputView,
                loadOp: "clear",
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                storeOp: "store",
            }],
    });
    pass.setPipeline(frame.state.pipeline);
    pass.setBindGroup(0, frame.state.bindGroup);
    pass.setVertexBuffer(0, frame.state.quad);
    pass.draw(6);
    pass.end();
    device.queue.submit([encoder.finish()]);
}
defineProperties(Effect, {
    "exposure": {
        type: "number",
        label: "Exposure",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "contrast": {
        type: "number",
        label: "Contrast",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "blackPoint": {
        type: "number",
        label: "Black point",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "whitePoint": {
        type: "number",
        label: "White point",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "shadows": {
        type: "number",
        label: "Shadows",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "highlights": {
        type: "number",
        label: "Highlights",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "gamma": {
        type: "number",
        label: "Gamma",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "temperature": {
        type: "number",
        label: "Temperature",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "tint": {
        type: "number",
        label: "Tint",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "colorFilter": {
        type: "color",
        label: "Color filter",
        defaultValue: { "r": 1, "g": 1, "b": 1, "a": 1 },
    },
    "vibrance": {
        type: "number",
        label: "Vibrance",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "saturation": {
        type: "number",
        label: "Saturation",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "brilliance": {
        type: "number",
        label: "Brilliance",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
    "definition": {
        type: "number",
        label: "Definition",
        defaultValue: 0,
        control: "slider",
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
    },
});

export const manifest = {
  "name": "Color adjust",
  "version": 3,
  "isAnimated": false,
  "usesMouse": false,
  "renderScaleAware": true
}
