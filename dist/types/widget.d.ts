import { globalThis } from "./polyfills";
import { MuxVideoElementExt } from "./video-api";
export type GroundBreakWidgetProps = {
    widgets?: string;
    aspectRatio: number;
};
export type WidgetAttributes = {
    type: "LINK" | "CALENDLY" | "TEXT" | "SHAPE";
    href?: string;
    label?: string;
    spawnTime?: number;
    duration?: number;
    style?: any;
};
type WidgetVisibleInfo = {
    id: number;
    isVisible: boolean;
    duration: number;
    spawnTime: number;
};
declare class GroundWidget extends globalThis.HTMLElement {
    #private;
    static template: HTMLTemplateElement;
    widgetsVisibleInfo: Array<WidgetVisibleInfo>;
    constructor();
    get media(): MuxVideoElementExt | null | undefined;
    get widgets(): any;
    get aspectRatio(): number;
    /**
     *
     * @parm  info:WidgetVisibleInfo
     * @param currentTime :number // seconds
     * @returns true if widget is visible
     */
    isVisible(info: WidgetVisibleInfo, currentTime: number): boolean;
    createWidget(widget: WidgetAttributes, id: number): any;
}
export default GroundWidget;
