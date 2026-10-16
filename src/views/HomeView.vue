<template>
  <div class="page flex a-center j-center">
    <button @click="start" class="fixed t-10 l-10">start</button>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      :viewBox="`0 0 ${width} ${height}`"
    >
      <path
        ref="path"
        fill="url(#grad)"
        stroke-opacity="0"
        stroke="#ff7b00"
        stroke-width="1"
        d="
    M 100,20 
    Q 120,70 150,50 
    Q 130,90 170,100 
    Q 130,110 150,150 
    Q 120,130 100,180 
    Q 80,130 50,150 
    Q 70,110 30,100 
    Q 70,90 50,50 
    Q 80,70 100,20 Z"
      />
      <circle
        v-for="(prop, index) in c"
        :r="prop.r"
        :cx="prop.cx"
        :cy="prop.cy"
        :key="index"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-opacity="0.3"
      >
        <!-- <line :x1="prop.cx" :x2="prop.cx + prop.r" :y1="prop.cy" :y2="prop.cy + prop.r"></line> -->
      </circle>
      <path fill="url(#grad)" stroke="currentColor" stroke-width="1" :d="d" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

const width = 200
const height = 200
const centerX = width / 2
const centerY = height / 2

const path = useTemplateRef<SVGPathElement>('path')
const N = ref<number>(50)
const xn = ref<{ x: number; y: number }[]>([])
const xk = ref<{ amp: number; re: number; im: number; phase: number }[]>([])

function calXn(): void {
  if (!path.value) return

  for (let t = 0; t <= 1; t += 1 / N.value) {
    const pathLength = path.value.getTotalLength()
    const dist = t * pathLength
    const point = path.value.getPointAtLength(dist)
    xn.value.push({ x: point.x - centerX, y: point.y - centerY })
  }
}

function dft(): void {
  for (let k = -N.value / 2; k < N.value / 2; k++) {
    let amp = 0
    let re = 0
    let im = 0
    let phase = 0
    for (let n = 0; n < N.value; n++) {
      const phi = (2 * Math.PI * k * n) / N.value
      const x = xn.value[n]!.x
      const y = xn.value[n]!.y
      re += x * Math.cos(phi) + y * Math.sin(phi)
      im += y * Math.cos(phi) - x * Math.sin(phi)
    }
    re /= N.value
    im /= N.value
    amp = Math.sqrt(re * re + im * im)
    phase = Math.atan2(im, re)
    xk.value.push({ amp, re, im, phase })
  }
}

const c = ref<{ r: number; cx: number; cy: number; angle: number }[]>([])
const dt = (2 * Math.PI) / N.value / 10
let t = 0
const d = ref<string>(`M `)

function animate(): void {
  let prevCx = centerX
  let prevCy = centerY
  for (let k = 0; k < N.value; k++) {
    const r = xk.value[k]!.amp
    const phase = (k - N.value / 2) * t + xk.value[k]!.phase
    const cx = prevCx + r * Math.cos(phase)
    const cy = prevCy + r * Math.sin(phase)
    const angle = (phase * 180) / Math.PI

    c.value[k] = { r: r, cx: prevCx, cy: prevCy, angle: angle }

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
