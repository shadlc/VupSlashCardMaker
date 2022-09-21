import { withCtx } from "vue"

import { h } from "vue"

import { withCtx } from "vue"

export class Canvas {
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  constructor(canvas: HTMLCanvasElement, width = 0, height = 0) {
    this.cvs = canvas;
    this.ctx = this.cvs.getContext("2d") as CanvasRenderingContext2D;
    this.cvs.width = width;
    this.cvs.height = height;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
  }
  resize(w: number, h: number) {
    const ratio = w / this.cvs.width;
    let temp_cvs = new Canvas(document.createElement("canvas") as HTMLCanvasElement, w, h);
    temp_cvs.ctx.drawImage(this.cvs, 0, 0, w, h);
    this.ctx.drawImage(temp_cvs.cvs, 0, 0, this.cvs.width, this.cvs.height);
  }
}
