import { globalThis, document } from "./polyfills";
import { stylePropsToString } from "./utils";
import { MuxVideoElementExt } from "./video-api";

export type GroundBreakWidgetProps = {
  widgets?: string;
  aspectRatio: number;
};

export type WidgetAttributes = {
  type: "LINK" | "CALENDLY" | "TEXT" | "SHAPE";
  href?: string;
  label?: string;
  spawnTime?: number; //milliseconds
  duration?: number; // milliseconds
  style?: any;
};

type WidgetVisibleInfo = {
  id: number;
  isVisible: boolean;
  duration: number; //milliseconds
  spawnTime: number; // milliseconds
};
const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      position: absolute; 
      left:0; 
      right:0; 
      width: 100%; 
      height: 100%; 
      z-index: 99999; 
      pointer-events: none !important;
      opacity: 1!important;
    }


    .close {
      background: none;
      color: inherit;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;
      outline: inherit;
      width: 28px;
      height: 28px;
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
  </style>

  <div id="groundbreak-widget-container" style="position: absolute; margin: auto; left:0; right:0; width: 100%; height: 100%; z-index: 99999; pointer-events: none">
  </div>
`;

class GroundWidget extends globalThis.HTMLElement {
  static template: HTMLTemplateElement = template;

  widgetsVisibleInfo: Array<WidgetVisibleInfo> = [];
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot?.appendChild(
      (this.constructor as any).template.content.cloneNode(true)
    );

    this.media?.addEventListener("timeupdate", (event: Event) => {
      this.#updateVisibility();
    });

    window.addEventListener("resize", (event: Event) => {
      this.#resize();
    });

    this.#render();
  }

  //
  // warning: beware that mux-video element exists in the parent element
  // (which means groundbreak-widget and mux-video elements are same-level child of media-theme)
  //
  get media(): MuxVideoElementExt | null | undefined {
    return this.parentElement?.querySelector("mux-video");
  }

  get widgets() {
    try {
      return JSON.parse(this.getAttribute("widgets") ?? "[]");
    } catch (e) {
      return [];
    }
  }

  get aspectRatio(): number {
    return (this.getAttribute("aspect-ratio") ?? 0.5625) as number;
  }

  #resize() {
    // resize the widgets container width and height
    if (!this.media) return;

    if (!this.shadowRoot) return;

    const containerDOM = this.shadowRoot.getElementById(
      "groundbreak-widget-container"
    );

    if (!containerDOM) return;

    const width = `${
      this.media.getBoundingClientRect().height * this.aspectRatio
    }px`;

    containerDOM.style.width = width;
  }

  #render() {
    const widgets: Array<WidgetAttributes> = this.widgets;

    // add widgets and get initial visibility status of widgets
    const initialWidgetVisibleInfo = widgets.map((widget, index) => {
      // create a new widget and append it to the shadow room
      const dom = this.createWidget(widget, index);
      this.shadowRoot
        ?.getElementById("groundbreak-widget-container")
        ?.appendChild(dom);

      // return the initial
      return {
        id: index,
        isVisible: true,
        spawnTime: widget.spawnTime ?? 0,
        duration: widget.duration ?? 0,
      };
    });

    this.widgetsVisibleInfo = initialWidgetVisibleInfo;

    this.#updateVisibility();

    setTimeout(() => this.#resize(), 100);
  }

  #updateVisibility() {
    for (let info of this.widgetsVisibleInfo) {
      const isVisibleNew = this.isVisible(info, this.media?.currentTime ?? 0);
      if (info.isVisible === isVisibleNew) continue;
      info.isVisible = isVisibleNew;

      let dom = this.shadowRoot?.getElementById(
        `ground-widget-components-${info.id}`
      );
      if (!dom) continue;

      dom.style.display = isVisibleNew === true ? "block" : "none";
    }
  }

  /**
   *
   * @parm  info:WidgetVisibleInfo
   * @param currentTime :number // seconds
   * @returns true if widget is visible
   */
  isVisible(info: WidgetVisibleInfo, currentTime: number): boolean {
    //
    // note: spawnTime and duration are in milliseconds, currentTime is in seconds
    //
    if (
      info.spawnTime <= currentTime * 1000 &&
      info.spawnTime + info.duration >= currentTime * 1000
    ) {
      return true;
    }

    return false;
  }

  createWidget(widget: WidgetAttributes, id: number): any {
    let dom;
    switch (widget.type) {
      case "TEXT":
        dom = document.createElement("p");
        dom.setAttribute("style", stylePropsToString(widget?.style) ?? "");
        dom.setAttribute("id", `ground-widget-components-${id}`);
        dom.innerText = widget.label ?? "";
        break;
      case "LINK":
        dom = document.createElement("a");
        dom.setAttribute("style", stylePropsToString(widget?.style) ?? "");
        dom.setAttribute("id", `ground-widget-components-${id}`);
        dom.innerText = widget.label ?? "";
        dom.href = widget.href ?? "";
        dom.target = "_blank";
        break;
      default:
        dom = document.createElement("div");
        break;
    }
    return dom;
  }
}

if (!globalThis.customElements.get("groundbreak-widget")) {
  globalThis.customElements.define("groundbreak-widget", GroundWidget);
  (globalThis as any).GroundWidget = GroundWidget;
}

export default GroundWidget;
