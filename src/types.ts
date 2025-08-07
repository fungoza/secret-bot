import Template from "./Template"

export type Pixel = {
    x: number
    y: number
    id: number
}

export type Target = [number, number]

export interface ITargeter {
    get width(): number
    get height(): number
    back(amount: number): void
    setCounter(value: number): void
    nexts(amount: number): Array<Pixel>
    countTargets(): number
    getTemplatePixel(x: number, y: number): number
}

export type SortingFunc = (template: Template) => Array<[number, number]>

export type BasicTargeterBuilder = (tmp: Template) => ITargeter