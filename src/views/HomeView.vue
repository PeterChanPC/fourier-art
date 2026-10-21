<template>
  <div class="page flex a-center j-center">
    <button @click="start" class="fixed t-10 l-10">start</button>
    <div ref="svgContainer" v-html="svg" v-show="false"></div>
    <svg
      class="overflow-v"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      :viewBox="`0 0 ${viewboxWidth} ${viewboxHeight}`"
    >
      <g transform="scale(0.1)">
        <circle
          v-for="(prop, index) in circles"
          :r="prop.r"
          :cx="prop.cx"
          :cy="prop.cy"
          :key="index"
          fill="none"
          stroke="currentColor"
          stroke-width="0.2"
          stroke-opacity="0.3"
        ></circle>
        <line
          v-for="(prop, index) in circles"
          :x1="prop.cx"
          :x2="prop.cx + prop.r * Math.cos(prop.phase)"
          :y1="prop.cy"
          :y2="prop.cy + prop.r * Math.sin(prop.phase)"
          :key="index"
          stroke="currentColor"
          stroke-width="0.2"
          stroke-opacity="0.5"
        ></line>
        <path fill="url(#grad)" stroke="currentColor" stroke-width="0.2" :d="d" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import svg from '@/assets/flower.svg?raw'
import { ref, useTemplateRef } from 'vue'

const viewboxWidth = 200
const viewboxHeight = 200
const viewboxCenterX = viewboxWidth / 2
const viewboxCenterY = viewboxHeight / 2

const svgContainer = useTemplateRef<HTMLDivElement>('svgContainer')
const xn = ref<{ x: number; y: number }[]>([])
const N = ref<number>(100) // Number of Samples/Circles/Frequencies

function calXn(): void {
  if (!svgContainer.value) return

  const path = svgContainer.value.querySelector('path')

  // extract Xn out of svg path element into a list of N elements
  for (let t = 0; t <= 1; t += 1 / N.value) {
    const pathLength = path!.getTotalLength()
    const dist = t * pathLength
    const point = path!.getPointAtLength(dist)
    xn.value.push({ x: point.x - viewboxCenterX, y: point.y - viewboxCenterY })
  }
}

// k = frequency
const xk = ref<{ A: number; re: number; im: number; phase: number }[]>([])

// Xk = (1 / N) * Sum(xn * exp(i * 2 * pi * k * n / N)) from n = 0 to N - 1
// Amplitude = |Xk| = sqrt(real part ** 2 + imaginary part ** 2)
// Phase = arctan(imaginary part, real part)
function dft(): void {
  for (let k = -N.value / 2; k < N.value / 2; k++) {
    let re = 0 // Real part
    let im = 0 // Imaginary part
    let A = 0 // Amplitude
    let phase = 0 // Phase

    // Summing over n = 0 to N - 1
    for (let n = 0; n < N.value; n++) {
      const phi = (2 * Math.PI * k * n) / N.value
      const x = xn.value[n]!.x
      const y = xn.value[n]!.y
      re += x * Math.cos(phi) + y * Math.sin(phi)
      im += y * Math.cos(phi) - x * Math.sin(phi)
    }

    // devided by N
    re /= N.value
    im /= N.value

    A = Math.sqrt(re * re + im * im)
    phase = Math.atan2(im, re)
    xk.value.push({ A, re, im, phase })
  }
}

const speed = 0.1
const circles = ref<{ r: number; cx: number; cy: number; phase: number }[]>([])
const dt = ((2 * Math.PI) / N.value) * speed
const d = ref<string>(`M `)

let t = 0

function animate(): void {
  let prevCx = viewboxCenterX
  let prevCy = viewboxCenterY

  for (let k = -N.value / 2; k < N.value / 2; k++) {
    const index = k + N.value / 2
    const r = xk.value[index]!.A
    const phase = k * t + xk.value[index]!.phase
    const cx = prevCx + r * Math.cos(phase)
    const cy = prevCy + r * Math.sin(phase)

    circles.value[index] = { r: r, cx: prevCx, cy: prevCy, phase: phase }

    prevCx = cx
    prevCy = cy
  }

  d.value += `${prevCx} ${prevCy} `

  t += dt

  if (t <= 2.01 * Math.PI) {
    requestAnimationFrame(animate)
  }
}

const isStarted = ref<boolean>(false)
function start(): void {
  if (isStarted.value) return

  calXn()
  dft()

  isStarted.value = true
  animate()
}
</script>

<style scoped></style>
