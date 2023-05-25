var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// src/polyfills/index.ts
var EventTarget = class {
  addEventListener() {
  }
  removeEventListener() {
  }
  dispatchEvent(_event) {
    return true;
  }
};
if (typeof DocumentFragment === "undefined") {
  class DocumentFragment2 extends EventTarget {
  }
  globalThis.DocumentFragment = DocumentFragment2;
}
var HTMLElement2 = class extends EventTarget {
};
var HTMLVideoElement = class extends EventTarget {
};
var customElements2 = {
  get(_name) {
    return void 0;
  },
  define(_name, _constructor, _options) {
  },
  upgrade(_root) {
  },
  whenDefined(_name) {
    return Promise.resolve(HTMLElement2);
  }
};
var _detail;
var CustomEvent2 = class {
  constructor(typeArg, eventInitDict = {}) {
    __privateAdd(this, _detail, void 0);
    __privateSet(this, _detail, eventInitDict == null ? void 0 : eventInitDict.detail);
  }
  get detail() {
    return __privateGet(this, _detail);
  }
  initCustomEvent() {
  }
};
_detail = new WeakMap();
function createElement(_tagName, _options) {
  return new HTMLElement2();
}
var globalThisShim = {
  document: {
    createElement
  },
  DocumentFragment,
  customElements: customElements2,
  CustomEvent: CustomEvent2,
  EventTarget,
  HTMLElement: HTMLElement2,
  HTMLVideoElement
};
var isServer = typeof window === "undefined" || typeof globalThis.customElements === "undefined";
var internalGlobalThis = isServer ? globalThisShim : globalThis;
var internalDocument = isServer ? globalThisShim.document : globalThis.document;

// src/index.ts
import { MediaController } from "media-chrome";
import "media-chrome/dist/experimental/media-captions-selectmenu.js";
import MuxVideoElement, {
  MediaError as MediaError2,
  Attributes as MuxVideoAttributes
} from "@mux/mux-video";
import {
  StreamTypes as StreamTypes3,
  PlaybackTypes,
  addTextTrack,
  removeTextTrack,
  CmcdTypeValues
} from "@mux/playback-core";

// src/video-api.ts
import { VideoEvents } from "@mux/mux-video";

// lang/en.json
var code = "en";
var en_default = { code };

// src/utils.ts
var DEFAULT_LOCALE = "en";
function i18n(str, translate = true) {
  var _a, _b;
  const message = translate ? (_b = (_a = en_default) == null ? void 0 : _a[str]) != null ? _b : str : str;
  const locale = translate ? en_default.code : DEFAULT_LOCALE;
  return new IntlMessageFormat(message, locale);
}
var IntlMessageFormat = class {
  constructor(message, locale = ((_a) => (_a = en_default.code) != null ? _a : DEFAULT_LOCALE)()) {
    this.message = message;
    this.locale = locale;
  }
  format(values) {
    return this.message.replace(/\{(\w+)\}/g, (match, key) => {
      var _a;
      return (_a = values[key]) != null ? _a : "";
    });
  }
  toString() {
    return this.message;
  }
};
function stylePropsToString(props) {
  let style = "";
  Object.entries(props).forEach(([key, value]) => {
    if (value == null)
      return;
    style += `${kebabCase(key)}: ${value}; `;
  });
  return style ? style.trim() : void 0;
}
function kebabCase(name) {
  return name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function camelCase(name) {
  return name.replace(/[-_]([a-z])/g, ($0, $1) => $1.toUpperCase());
}
function toNumberOrUndefined(val) {
  if (val == null)
    return void 0;
  const num = +val;
  return !Number.isNaN(num) ? num : void 0;
}
function toQuery(obj) {
  const params = toParams(obj).toString();
  return params ? "?" + params : "";
}
function toParams(obj) {
  const params = {};
  for (const key in obj) {
    if (obj[key] != null)
      params[key] = obj[key];
  }
  return new URLSearchParams(params);
}
function parseJwt(token) {
  const base64Url = (token != null ? token : "").split(".")[1];
  if (!base64Url)
    return {};
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64).split("").map(function(c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join("")
  );
  return JSON.parse(jsonPayload);
}
var containsComposedNode = (rootNode, childNode) => {
  if (!rootNode || !childNode)
    return false;
  if (rootNode.contains(childNode))
    return true;
  return containsComposedNode(rootNode, childNode.getRootNode().host);
};

// src/helpers.ts
import { StreamTypes } from "@mux/playback-core";
var MUX_VIDEO_DOMAIN = "mux.com";
var getEnvPlayerVersion = () => {
  try {
    return "1.10.1";
  } catch {
  }
  return "UNKNOWN";
};
var player_version = getEnvPlayerVersion();
var getPlayerVersion = () => player_version;
var getSrcFromPlaybackId = (playbackId, { maxResolution, token, domain = MUX_VIDEO_DOMAIN } = {}) => {
  const isSignedUrl = !!token;
  const maxRes = maxResolution ? { max_resolution: maxResolution } : {};
  const query = isSignedUrl ? { token } : { redundant_streams: true, ...maxRes };
  return `https://stream.${domain}/${playbackId}.m3u8${toQuery(query)}`;
};
var getPosterURLFromPlaybackId = (playbackId, { token, thumbnailTime, domain = MUX_VIDEO_DOMAIN } = {}) => {
  const time = token == null ? thumbnailTime : void 0;
  const { aud } = parseJwt(token);
  if (token && aud !== "t") {
    return;
  }
  return `https://image.${domain}/${playbackId}/thumbnail.webp${toQuery({
    token,
    time
  })}`;
};
var getStoryboardURLFromPlaybackId = (playbackId, { token, domain = MUX_VIDEO_DOMAIN } = {}) => {
  const { aud } = parseJwt(token);
  if (token && aud !== "s") {
    return;
  }
  return `https://image.${domain}/${playbackId}/storyboard.vtt${toQuery({
    token,
    format: "webp"
  })}`;
};
var getStreamTypeFromAttr = (streamTypeAttr) => {
  if (!streamTypeAttr)
    return void 0;
  if ([StreamTypes.LIVE, StreamTypes.ON_DEMAND].includes(streamTypeAttr))
    return streamTypeAttr;
  if (streamTypeAttr == null ? void 0 : streamTypeAttr.includes("live"))
    return StreamTypes.LIVE;
  return void 0;
};
var attrToPropNameMap = {
  crossorigin: "crossOrigin",
  playsinline: "playsInline"
};
function toPropName(attrName) {
  var _a;
  return (_a = attrToPropNameMap[attrName]) != null ? _a : camelCase(attrName);
}
var _el, _attr, _tokens;
var AttributeTokenList = class {
  constructor(el, attr) {
    __privateAdd(this, _el, void 0);
    __privateAdd(this, _attr, void 0);
    __privateAdd(this, _tokens, []);
    __privateSet(this, _el, el);
    __privateSet(this, _attr, attr);
  }
  [Symbol.iterator]() {
    return __privateGet(this, _tokens).values();
  }
  get length() {
    return __privateGet(this, _tokens).length;
  }
  get value() {
    var _a;
    return (_a = __privateGet(this, _tokens).join(" ")) != null ? _a : "";
  }
  set value(val) {
    var _a;
    if (val === this.value)
      return;
    __privateSet(this, _tokens, []);
    this.add(...(_a = val == null ? void 0 : val.split(" ")) != null ? _a : []);
  }
  toString() {
    return this.value;
  }
  item(index) {
    return __privateGet(this, _tokens)[index];
  }
  values() {
    return __privateGet(this, _tokens).values();
  }
  keys() {
    return __privateGet(this, _tokens).keys();
  }
  forEach(callback) {
    __privateGet(this, _tokens).forEach(callback);
  }
  add(...tokens) {
    var _a, _b;
    tokens.forEach((t) => {
      if (!this.contains(t))
        __privateGet(this, _tokens).push(t);
    });
    if (this.value === "" && !((_a = __privateGet(this, _el)) == null ? void 0 : _a.hasAttribute(`${__privateGet(this, _attr)}`))) {
      return;
    }
    (_b = __privateGet(this, _el)) == null ? void 0 : _b.setAttribute(`${__privateGet(this, _attr)}`, `${this.value}`);
  }
  remove(...tokens) {
    var _a;
    tokens.forEach((t) => {
      __privateGet(this, _tokens).splice(__privateGet(this, _tokens).indexOf(t), 1);
    });
    (_a = __privateGet(this, _el)) == null ? void 0 : _a.setAttribute(`${__privateGet(this, _attr)}`, `${this.value}`);
  }
  contains(token) {
    return __privateGet(this, _tokens).includes(token);
  }
  toggle(token, force) {
    if (typeof force !== "undefined") {
      if (force) {
        this.add(token);
        return true;
      } else {
        this.remove(token);
        return false;
      }
    }
    if (this.contains(token)) {
      this.remove(token);
      return false;
    }
    this.add(token);
    return true;
  }
  replace(oldToken, newToken) {
    this.remove(oldToken);
    this.add(newToken);
  }
};
_el = new WeakMap();
_attr = new WeakMap();
_tokens = new WeakMap();

// src/logger.ts
var prefix = `[mux-player ${getPlayerVersion()}]`;
function warn(...args) {
  console.warn(prefix, ...args);
}
function error(...args) {
  console.error(prefix, ...args);
}
function devlog(opts) {
  var _a;
  let message = (_a = opts.message) != null ? _a : "";
  if (opts.context) {
    message += ` ${opts.context}`;
  }
  if (opts.file) {
    const githubErrorsBase = "https://github.com/muxinc/elements/blob/main/errors/";
    message += ` ${i18n(`Read more: `)}
${githubErrorsBase}${opts.file}`;
  }
  warn(message);
}

// src/video-api.ts
var AllowedVideoAttributes = {
  AUTOPLAY: "autoplay",
  CROSSORIGIN: "crossorigin",
  LOOP: "loop",
  MUTED: "muted",
  PLAYSINLINE: "playsinline",
  PRELOAD: "preload"
};
var CustomVideoAttributes = {
  VOLUME: "volume",
  PLAYBACKRATE: "playbackrate",
  MUTED: "muted"
};
var emptyTimeRanges = Object.freeze({
  length: 0,
  start(index) {
    const unsignedIdx = index >>> 0;
    if (unsignedIdx >= this.length) {
      throw new DOMException(
        `Failed to execute 'start' on 'TimeRanges': The index provided (${unsignedIdx}) is greater than or equal to the maximum bound (${this.length}).`
      );
    }
    return 0;
  },
  end(index) {
    const unsignedIdx = index >>> 0;
    if (unsignedIdx >= this.length) {
      throw new DOMException(
        `Failed to execute 'end' on 'TimeRanges': The index provided (${unsignedIdx}) is greater than or equal to the maximum bound (${this.length}).`
      );
    }
    return 0;
  }
});
var AllowedVideoEvents = VideoEvents.filter((type) => type !== "error");
var AllowedVideoAttributeNames = Object.values(AllowedVideoAttributes).filter(
  (name) => ![AllowedVideoAttributes.PLAYSINLINE].includes(name)
);
var CustomVideoAttributesNames = Object.values(CustomVideoAttributes);
function initVideoApi(el) {
  el.querySelectorAll(":scope > track").forEach((track) => {
    var _a;
    (_a = el.media) == null ? void 0 : _a.append(track.cloneNode());
  });
  AllowedVideoEvents.forEach((type) => {
    var _a;
    (_a = el.media) == null ? void 0 : _a.addEventListener(type, (evt) => {
      el.dispatchEvent(new Event(evt.type));
    });
  });
}
var VideoApiElement = class extends internalGlobalThis.HTMLElement {
  static get observedAttributes() {
    return [...AllowedVideoAttributeNames, ...CustomVideoAttributesNames];
  }
  constructor() {
    super();
    this.querySelectorAll(":scope > track").forEach((track) => {
      var _a;
      (_a = this.media) == null ? void 0 : _a.append(track.cloneNode());
    });
    const mutationCallback = (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          mutation.removedNodes.forEach((node) => {
            var _a, _b;
            const track = (_a = this.media) == null ? void 0 : _a.querySelector(`track[src="${node.src}"]`);
            if (track)
              (_b = this.media) == null ? void 0 : _b.removeChild(track);
          });
          mutation.addedNodes.forEach((node) => {
            var _a;
            (_a = this.media) == null ? void 0 : _a.append(node.cloneNode());
          });
        }
      }
    };
    const observer = new MutationObserver(mutationCallback);
    observer.observe(this, { childList: true, subtree: true });
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    var _a, _b;
    switch (attrName) {
      case CustomVideoAttributes.MUTED: {
        if (this.media) {
          this.media.muted = newValue != null;
          this.media.defaultMuted = newValue != null;
        }
        return;
      }
      case CustomVideoAttributes.VOLUME: {
        const val = (_a = toNumberOrUndefined(newValue)) != null ? _a : 1;
        if (this.media) {
          this.media.volume = val;
        }
        return;
      }
      case CustomVideoAttributes.PLAYBACKRATE: {
        const val = (_b = toNumberOrUndefined(newValue)) != null ? _b : 1;
        if (this.media) {
          this.media.playbackRate = val;
          this.media.defaultPlaybackRate = val;
        }
        return;
      }
    }
  }
  play() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.play()) != null ? _b : Promise.reject();
  }
  pause() {
    var _a;
    (_a = this.media) == null ? void 0 : _a.pause();
  }
  requestCast(options) {
    var _a;
    return (_a = this.media) == null ? void 0 : _a.requestCast(options);
  }
  get media() {
    var _a;
    return (_a = this.shadowRoot) == null ? void 0 : _a.querySelector("mux-video");
  }
  get paused() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.paused) != null ? _b : true;
  }
  get duration() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.duration) != null ? _b : NaN;
  }
  get ended() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.ended) != null ? _b : false;
  }
  get buffered() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.buffered) != null ? _b : emptyTimeRanges;
  }
  get seekable() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.seekable) != null ? _b : emptyTimeRanges;
  }
  get readyState() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.readyState) != null ? _b : 0;
  }
  get videoWidth() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.videoWidth) != null ? _b : 0;
  }
  get videoHeight() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.videoHeight) != null ? _b : 0;
  }
  get currentTime() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.currentTime) != null ? _b : 0;
  }
  set currentTime(val) {
    if (this.media) {
      this.media.currentTime = Number(val);
    }
  }
  get volume() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.volume) != null ? _b : 1;
  }
  set volume(val) {
    if (this.media) {
      this.media.volume = Number(val);
    }
  }
  get playbackRate() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.playbackRate) != null ? _b : 1;
  }
  set playbackRate(val) {
    if (this.media) {
      this.media.playbackRate = Number(val);
    }
  }
  get defaultPlaybackRate() {
    var _a;
    return (_a = toNumberOrUndefined(this.getAttribute(CustomVideoAttributes.PLAYBACKRATE))) != null ? _a : 1;
  }
  set defaultPlaybackRate(val) {
    if (val != null) {
      this.setAttribute(CustomVideoAttributes.PLAYBACKRATE, `${val}`);
    } else {
      this.removeAttribute(CustomVideoAttributes.PLAYBACKRATE);
    }
  }
  get crossOrigin() {
    return getVideoAttribute(this, AllowedVideoAttributes.CROSSORIGIN);
  }
  set crossOrigin(val) {
    this.setAttribute(AllowedVideoAttributes.CROSSORIGIN, `${val}`);
  }
  get autoplay() {
    return getVideoAttribute(this, AllowedVideoAttributes.AUTOPLAY) != null;
  }
  set autoplay(val) {
    if (val) {
      this.setAttribute(AllowedVideoAttributes.AUTOPLAY, typeof val === "string" ? val : "");
    } else {
      this.removeAttribute(AllowedVideoAttributes.AUTOPLAY);
    }
  }
  get loop() {
    return getVideoAttribute(this, AllowedVideoAttributes.LOOP) != null;
  }
  set loop(val) {
    if (val) {
      this.setAttribute(AllowedVideoAttributes.LOOP, "");
    } else {
      this.removeAttribute(AllowedVideoAttributes.LOOP);
    }
  }
  get muted() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.muted) != null ? _b : false;
  }
  set muted(val) {
    if (this.media) {
      this.media.muted = Boolean(val);
    }
  }
  get defaultMuted() {
    return getVideoAttribute(this, AllowedVideoAttributes.MUTED) != null;
  }
  set defaultMuted(val) {
    if (val) {
      this.setAttribute(AllowedVideoAttributes.MUTED, "");
    } else {
      this.removeAttribute(AllowedVideoAttributes.MUTED);
    }
  }
  get playsInline() {
    return getVideoAttribute(this, AllowedVideoAttributes.PLAYSINLINE) != null;
  }
  set playsInline(val) {
    error("playsInline is set to true by default and is not currently supported as a setter.");
  }
  get preload() {
    return this.media ? this.media.preload : this.getAttribute("preload");
  }
  set preload(val) {
    if (["", "none", "metadata", "auto"].includes(val)) {
      this.setAttribute(AllowedVideoAttributes.PRELOAD, val);
    } else {
      this.removeAttribute(AllowedVideoAttributes.PRELOAD);
    }
  }
};
function getVideoAttribute(el, name) {
  return el.media ? el.media.getAttribute(name) : el.getAttribute(name);
}
var video_api_default = VideoApiElement;

// src/template.ts
import "media-chrome/dist/media-theme-element.js";

// src/styles.css
var styles_default = ':host {\n  --media-control-display: var(--controls);\n  --media-loading-indicator-display: var(--loading-indicator);\n  --media-dialog-display: var(--dialog);\n  --media-play-button-display: var(--play-button);\n  --media-live-button-display: var(--live-button);\n  --media-seek-backward-button-display: var(--seek-backward-button);\n  --media-seek-forward-button-display: var(--seek-forward-button);\n  --media-mute-button-display: var(--mute-button);\n  --media-captions-button-display: var(--captions-button);\n  --media-captions-selectmenu-display: var(\n    --captions-selectmenu,\n    var(--media-captions-button-display)\n  );\n  --media-airplay-button-display: var(--airplay-button);\n  --media-pip-button-display: var(--pip-button);\n  --media-fullscreen-button-display: var(--fullscreen-button);\n  --media-cast-button-display: var(--cast-button);\n  --media-playback-rate-button-display: var(--playback-rate-button);\n  --media-volume-range-display: var(--volume-range);\n  --media-time-range-display: var(--time-range);\n  --media-time-display-display: var(--time-display);\n  --media-duration-display-display: var(--duration-display);\n  --media-title-display-display: var(--title-display);\n\n  display: inline-block;\n  width: 100%;\n}\n\n/* Hide custom elements that are not defined yet */\n:not(:defined) {\n  display: none;\n}\n\na {\n  color: #fff;\n  font-size: 0.9em;\n  text-decoration: underline;\n}\n\nmedia-theme {\n  width: 100%;\n  height: 100%;\n  direction: ltr;\n}\n\n::part(top),\n[part~="top"] {\n  --media-control-display: var(--controls, var(--top-controls));\n  --media-play-button-display: var(--play-button, var(--top-play-button));\n  --media-live-button-display: var(--live-button, var(--top-live-button));\n  --media-seek-backward-button-display: var(\n    --seek-backward-button,\n    var(--top-seek-backward-button)\n  );\n  --media-seek-forward-button-display: var(\n    --seek-forward-button,\n    var(--top-seek-forward-button)\n  );\n  --media-mute-button-display: var(--mute-button, var(--top-mute-button));\n  --media-captions-button-display: var(\n    --captions-button,\n    var(--top-captions-button)\n  );\n  --media-captions-selectmenu-display: var(\n    --captions-selectmenu,\n    var(--media-captions-button-display, var(--top-captions-selectmenu))\n  );\n  --media-airplay-button-display: var(\n    --airplay-button,\n    var(--top-airplay-button)\n  );\n  --media-pip-button-display: var(--pip-button, var(--top-pip-button));\n  --media-fullscreen-button-display: var(\n    --fullscreen-button,\n    var(--top-fullscreen-button)\n  );\n  --media-cast-button-display: var(--cast-button, var(--top-cast-button));\n  --media-playback-rate-button-display: var(\n    --playback-rate-button,\n    var(--top-playback-rate-button)\n  );\n  --media-volume-range-display: var(--volume-range, var(--top-volume-range));\n  --media-time-range-display: var(--time-range, var(--top-time-range));\n  --media-time-display-display: var(--time-display, var(--top-time-display));\n  --media-duration-display-display: var(\n    --duration-display,\n    var(--top-duration-display)\n  );\n  --media-title-display-display: var(--title-display, var(--top-title-display));\n}\n\n::part(center),\n[part~="center"] {\n  --media-control-display: var(--controls, var(--center-controls));\n  --media-play-button-display: var(--play-button, var(--center-play-button));\n  --media-live-button-display: var(--live-button, var(--center-live-button));\n  --media-seek-backward-button-display: var(\n    --seek-backward-button,\n    var(--center-seek-backward-button)\n  );\n  --media-seek-forward-button-display: var(\n    --seek-forward-button,\n    var(--center-seek-forward-button)\n  );\n  --media-mute-button-display: var(--mute-button, var(--center-mute-button));\n  --media-captions-button-display: var(\n    --captions-button,\n    var(--center-captions-button)\n  );\n  --media-captions-selectmenu-display: var(\n    --captions-selectmenu,\n    var(--media-captions-button-display, var(--center-captions-selectmenu))\n  );\n  --media-airplay-button-display: var(\n    --airplay-button,\n    var(--center-airplay-button)\n  );\n  --media-pip-button-display: var(--pip-button, var(--center-pip-button));\n  --media-fullscreen-button-display: var(\n    --fullscreen-button,\n    var(--center-fullscreen-button)\n  );\n  --media-cast-button-display: var(--cast-button, var(--center-cast-button));\n  --media-playback-rate-button-display: var(\n    --playback-rate-button,\n    var(--center-playback-rate-button)\n  );\n  --media-volume-range-display: var(--volume-range, var(--center-volume-range));\n  --media-time-range-display: var(--time-range, var(--center-time-range));\n  --media-time-display-display: var(--time-display, var(--center-time-display));\n  --media-duration-display-display: var(\n    --duration-display,\n    var(--center-duration-display)\n  );\n}\n\n::part(bottom),\n[part~="bottom"] {\n  --media-control-display: var(--controls, var(--bottom-controls));\n  --media-play-button-display: var(--play-button, var(--bottom-play-button));\n  --media-live-button-display: var(--live-button, var(--bottom-live-button));\n  --media-seek-backward-button-display: var(\n    --seek-backward-button,\n    var(--bottom-seek-backward-button)\n  );\n  --media-seek-forward-button-display: var(\n    --seek-forward-button,\n    var(--bottom-seek-forward-button)\n  );\n  --media-mute-button-display: var(--mute-button, var(--bottom-mute-button));\n  --media-captions-button-display: var(\n    --captions-button,\n    var(--bottom-captions-button)\n  );\n  --media-captions-selectmenu-display: var(\n    --captions-selectmenu,\n    var(--media-captions-button-display, var(--bottom-captions-selectmenu))\n  );\n  --media-airplay-button-display: var(\n    --airplay-button,\n    var(--bottom-airplay-button)\n  );\n  --media-pip-button-display: var(--pip-button, var(--bottom-pip-button));\n  --media-fullscreen-button-display: var(\n    --fullscreen-button,\n    var(--bottom-fullscreen-button)\n  );\n  --media-cast-button-display: var(--cast-button, var(--bottom-cast-button));\n  --media-playback-rate-button-display: var(\n    --playback-rate-button,\n    var(--bottom-playback-rate-button)\n  );\n  --media-volume-range-display: var(--volume-range, var(--bottom-volume-range));\n  --media-time-range-display: var(--time-range, var(--bottom-time-range));\n  --media-time-display-display: var(--time-display, var(--bottom-time-display));\n  --media-duration-display-display: var(\n    --duration-display,\n    var(--bottom-duration-display)\n  );\n  --media-title-display-display: var(\n    --title-display,\n    var(--bottom-title-display)\n  );\n}\n\ndiv.center-controls {\n  position: relative;\n  z-index: 9999;\n}\n';

// src/media-theme-mux.html
var media_theme_mux_default = `<!-- prettier-ignore -->
<template id="media-theme-mux">
  <style>
    :host {
      --_primary-color: var(--media-primary-color, white);
      --_secondary-color: var(--media-secondary-color, rgb(0 0 0 / .75));

      --media-icon-color: var(--_primary-color);
      --media-range-thumb-background: var(--_primary-color);
      --media-range-bar-color: var(--_primary-color);
      --media-control-background: var(--_secondary-color);
      --media-control-hover-background: var(--_secondary-color);
      --media-time-buffered-color: rgba(255, 255, 255, 0.4);
      --media-range-track-background:
        linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)),
        linear-gradient(rgba(20, 20, 30, 0.7), rgba(20, 20, 30, 0.7));
      --media-preview-thumbnail-border: 0;
      --media-preview-thumbnail-border-radius: 2px 2px 0 0;
      --media-preview-time-border-radius: 0 0 2px 2px;
      --media-preview-time-margin: 0 0 8px;
      --media-preview-time-text-shadow: none;

      color: var(--_primary-color);
      display: inline-block;
      width: 100%;
      height: 100%;
    }

    :host([audio]) {
      --media-preview-time-border-radius: 3px;
      --media-preview-time-margin: 0 0 5px;
      --media-preview-time-text-shadow: none;
    }

    :host([audio]) ::slotted([slot='media']) {
      height: 0px;
    }

    :host([audio]) media-loading-indicator,
    :host([audio]) ::slotted([slot=poster]) {
      display: none;
    }

    :host([audio]) media-controller {
      background: transparent;
    }

    :host([audio]) media-controller::part(vertical-layer) {
      background: transparent;
    }

    :host([audio]) media-control-bar {
      width: 100%;
    }

    [disabled],
    [aria-disabled='true'] {
      opacity: 60%;
      cursor: not-allowed;
    }

    :host(:not([audio])) media-captions-selectmenu::part(listbox) {
      z-index: 10;
    }

    media-controller:not(:is([media-captions-list], [media-subtitles-list])) media-captions-selectmenu {
      --captions-selectmenu: none;
    }


    /* 0.433s is the transition duration for VTT Regions.
     * Borrowed here, so the captions don't move too fast. */
    media-controller ::slotted([slot='media']) {
      --media-webkit-text-track-transition: transform 0.433s ease-out 0.3s;
    }
    media-controller:is([media-paused],:not([user-inactive])) ::slotted([slot='media']) {
      /* 42px is the height of the control bar and progress bar
       * with an additional 5px as a buffer, to get 47px */
      --media-webkit-text-track-transform: translateY(-47px);
      --media-webkit-text-track-transition: transform 0.15s ease;
    }

    media-captions-selectmenu {
      --media-listbox-background: var(--_secondary-color);
      --media-listbox-selected-background: rgba(255, 255, 255, 0.28);
      --media-listbox-hover-background: none;
      --media-listbox-hover-outline: white solid 1px;
      --media-text-color: white;
    }

    media-volume-range[media-volume-unavailable] {
      --volume-range: none;
    }

    media-airplay-button[media-airplay-unavailable] {
      --airplay-button: none;
    }

    media-fullscreen-button[media-fullscreen-unavailable] {
      --fullscreen-button: none;
    }

    media-cast-button[media-cast-unavailable] {
      --cast-button: none;
    }

    media-pip-button[media-pip-unavailable] {
      --pip-button: none;
    }

    :host media-time-range {
      color: var(--_primary-color);
      --media-range-thumb-opacity: 0;
    }

    :host(:not([audio])) media-time-range {
      --media-range-padding: 0;
      background: transparent;
      z-index: 10;
      height: 10px;
      bottom: -3px;
      width: 100%;
    }

    media-control-bar {
      --media-control-padding: 4px 3px;
    }

    [breakpoint-sm] media-control-bar {
      --media-control-padding: 9px 5px;
    }

    [breakpoint-md] media-control-bar {
      --media-control-padding: 9px 7px;
    }

    media-control-bar :is([role='button'], [role='switch'], button) {
      line-height: 0;
    }

    media-control-bar :is(media-text-display, media-time-display):first-child {
      --media-control-padding: 9px 5px 9px 10px;
    }

    .spacer {
      flex-grow: 1;
      background-color: var(--media-control-background, rgba(20, 20, 30, 0.7));
    }

    /* Add a small space on the right to have the play button and
     * fullscreen button aligned in relation to the progress bar. */
    media-control-bar:not([slot])::after {
      content: '';
      width: 2px;
      height: 100%;
      background-color: var(--media-control-background, rgba(20, 20, 30, 0.7));
    }

    media-control-bar[slot='top-chrome'] {
      min-height: 42px;
      pointer-events: none;
    }

    :host([title]) media-control-bar[slot='top-chrome']::before {
      content: '';
      position: absolute;
      width: 100%;
      padding-bottom: min(160px, 25%);
      background: linear-gradient(rgb(0 0 0 / 0.4), transparent);
    }

    media-control-bar[slot='top-chrome'] > * {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      position: relative;
    }

    media-controller::part(vertical-layer) {
      transition: background-color 1s;
    }

    media-controller:is([media-paused], :not([user-inactive]))::part(vertical-layer) {
      background-color: var(--controls-backdrop-color, var(--controls, transparent));
      transition: background-color 0.25s;
    }

    .center-controls {
      --media-button-icon-width: 100%;
      --media-button-icon-height: auto;
      pointer-events: none;
      width: 100%;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
      paint-order: stroke;
      stroke: rgba(102, 102, 102, 1);
      stroke-width: 0.3px;
      text-shadow: 0 0 2px rgb(0 0 0 / 0.25), 0 0 6px rgb(0 0 0 / 0.25);
    }

    .center-controls media-play-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      padding: 0;
      width: max(43px, min(10%, 55px));
    }

    .center-controls media-seek-backward-button,
    .center-controls media-seek-forward-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      padding: 0;
      margin: 0 2%;
      width: max(33px, min(8%, 40px));
    }

    media-control-bar:not([slot]) media-seek-backward-button {
      padding-right: 5px;
    }

    media-control-bar:not([slot]) media-seek-forward-button {
      padding-left: 5px;
    }

    media-loading-indicator {
      --media-loading-icon-width: 100%;
      --media-button-icon-height: auto;
      display: var(--media-control-display, var(--media-loading-indicator-display, flex));
      pointer-events: none;
      position: absolute;
      width: min(15%, 150px);
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }

    /* Intentionally don't target the div for transition but the children
     of the div. Prevents messing with media-chrome's autohide feature. */
    media-loading-indicator + div * {
      transition: opacity 0.15s;
      opacity: 1;
    }

    media-loading-indicator[media-loading]:not([media-paused]) ~ div > * {
      opacity: 0;
      transition-delay: 400ms;
    }

    media-volume-range {
      width: min(100%, 100px);
    }

    media-time-display {
      white-space: nowrap;
    }

    :is(media-time-display, media-text-display, media-playback-rate-button[role='button']) {
      color: inherit;
      line-height: 24px;
    }

    :is(.title-display, media-live-button) {
      color: inherit;
      font-size: 16px;
      text-shadow: 0 0 2px rgb(0 0 0 / 0.6);
    }

    :host([audio]) .title-display {
      flex-grow: 1;
      font-size: 21px;
    }
  </style>

  <template partial="TitleDisplay">
    <template if="title">
      <media-text-display part="top title display" class="title-display">
        {{title}}
      </media-text-display>
    </template>
  </template>

  <template partial="PlayButton">
    <media-play-button
      part="{{section ?? 'bottom'}} play button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" slot="play">
        <path d="m6.73 20.93 14.05-8.54a.46.46 0 0 0 0-.78L6.73 3.07a.48.48 0 0 0-.73.39v17.07a.48.48 0 0 0 .73.4Z" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" slot="pause">
        <path
          d="M6 19.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-15a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v15ZM14.5 4a.5.5 0 0 0-.5.5v15a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-15a.5.5 0 0 0-.5-.5h-3Z"
        />
      </svg>
    </media-play-button>
  </template>

  <template partial="SeekBackwardButton">
    <media-seek-backward-button
      seek-offset="{{backwardSeekOffset}}"
      part="{{section ?? 'bottom'}} seek-backward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg aria-hidden="true" viewBox="0 0 22 24" slot="backward">
        <path d="M11 6V3L5.37 7 11 10.94V8a5.54 5.54 0 0 1 1.9 10.48v2.12A7.5 7.5 0 0 0 11 6Z" />
        <text class="value" transform="translate(2.5 21)" style="font-size: 8px; font-family: 'ArialMT', 'Arial'">
          {{backwardSeekOffset}}
        </text>
      </svg>
    </media-seek-backward-button>
  </template>

  <template partial="SeekForwardButton">
    <media-seek-forward-button
      seek-offset="{{forwardSeekOffset}}"
      part="{{section ?? 'bottom'}} seek-forward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg aria-hidden="true" viewBox="0 0 22 24" slot="forward">
        <path d="M11 6V3l5.61 4L11 10.94V8a5.54 5.54 0 0 0-1.9 10.48v2.12A7.5 7.5 0 0 1 11 6Z" />
        <text class="value" transform="translate(10 21)" style="font-size: 8px; font-family: 'ArialMT', 'Arial'">
          {{forwardSeekOffset}}
        </text>
      </svg>
    </media-seek-forward-button>
  </template>

  <template partial="MuteButton">
    <media-mute-button part="bottom mute button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg aria-hidden="true" viewBox="0 0 24 24" slot="high">
        <path
          d="m11.14 4.86-4 4a.49.49 0 0 1-.35.14H3.25a.25.25 0 0 0-.25.25v5.5a.25.25 0 0 0 .25.25h3.54a.49.49 0 0 1 .36.15l4 4a.5.5 0 0 0 .85-.36V5.21a.5.5 0 0 0-.86-.35Zm2.74-1.56v1.52A7.52 7.52 0 0 1 19.47 12a7.52 7.52 0 0 1-5.59 7.18v1.52A9 9 0 0 0 21 12a9 9 0 0 0-7.12-8.7Zm3.56 8.7a5.49 5.49 0 0 0-3.56-5.1v1.66a3.93 3.93 0 0 1 0 6.88v1.66a5.49 5.49 0 0 0 3.56-5.1Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" slot="low">
        <path
          d="m11.14 4.853-4 4a.49.49 0 0 1-.35.14H3.25a.25.25 0 0 0-.25.25v5.5a.25.25 0 0 0 .25.25h3.54a.49.49 0 0 1 .36.15l4 4a.5.5 0 0 0 .85-.36V5.203a.5.5 0 0 0-.86-.35Zm6.3 7.14a5.49 5.49 0 0 0-3.56-5.1v1.66a3.93 3.93 0 0 1 0 6.88v1.66a5.49 5.49 0 0 0 3.56-5.1Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" slot="medium">
        <path
          d="m11.14 4.853-4 4a.49.49 0 0 1-.35.14H3.25a.25.25 0 0 0-.25.25v5.5a.25.25 0 0 0 .25.25h3.54a.49.49 0 0 1 .36.15l4 4a.5.5 0 0 0 .85-.36V5.203a.5.5 0 0 0-.86-.35Zm6.3 7.14a5.49 5.49 0 0 0-3.56-5.1v1.66a3.93 3.93 0 0 1 0 6.88v1.66a5.49 5.49 0 0 0 3.56-5.1Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" slot="off">
        <path
          d="m3 4.05 4.48 4.47-.33.33a.49.49 0 0 1-.36.15H3.25a.25.25 0 0 0-.25.25v5.5a.25.25 0 0 0 .25.25h3.54a.49.49 0 0 1 .36.15l4 4a.48.48 0 0 0 .36.15.5.5 0 0 0 .5-.5v-5.75l4.67 4.66a7.71 7.71 0 0 1-2.79 1.47v1.52a9.32 9.32 0 0 0 3.87-1.91L20 21l1-1L4.06 3 3 4.05Zm5.36 5.36 2.39 2.39V17L8 14.26a1.74 1.74 0 0 0-1.24-.51H4.25v-3.5h2.54A1.74 1.74 0 0 0 8 9.74l.36-.33ZM19.47 12a7.19 7.19 0 0 1-.89 3.47l1.11 1.1A8.64 8.64 0 0 0 21 12a9 9 0 0 0-7.12-8.7v1.52A7.52 7.52 0 0 1 19.47 12ZM12 8.88V5.21a.5.5 0 0 0-.5-.5.48.48 0 0 0-.36.15L9.56 6.44 12 8.88ZM15.91 12a4.284 4.284 0 0 1-.07.72l1.22 1.22a5.2 5.2 0 0 0 .38-1.94 5.49 5.49 0 0 0-3.56-5.1v1.66A4 4 0 0 1 15.91 12Z"
        />
      </svg>
    </media-mute-button>
  </template>

  <template partial="PipButton">
    <media-pip-button part="bottom pip button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg aria-hidden="true" viewBox="0 0 26 24" slot="enter">
        <path
          d="M22 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h6.75v-1.25h-6.5V4.25h17.5v6.5H23V4a1 1 0 0 0-1-1Zm0 10h-8a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1Zm-.5 6.5h-7v-5h7v5Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 26 24" slot="exit">
        <path
          d="M22 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h6.75v-1.25h-6.5V4.25h17.5v6.5H23V4a1 1 0 0 0-1-1Zm0 10h-8a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1Zm-.5 6.5h-7v-5h7v5Z"
        />
      </svg>
    </media-pip-button>
  </template>

  <template partial="CaptionsMenuButton">
    <media-captions-selectmenu
      default-showing="{{defaultShowingCaptions}}"
      part="bottom captions selectmenu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg aria-hidden="true" viewBox="0 0 26 24" slot="on">
        <path
          d="M22.832 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.41 10.1a3.63 3.63 0 0 1-1.51.32 4.76 4.76 0 0 1-1.63-.27 4 4 0 0 1-1.28-.83 3.67 3.67 0 0 1-.84-1.26 4.23 4.23 0 0 1-.3-1.63 4.28 4.28 0 0 1 .3-1.64 3.53 3.53 0 0 1 .84-1.21 3.89 3.89 0 0 1 1.29-.8 4.76 4.76 0 0 1 1.63-.27 4.06 4.06 0 0 1 1.35.24c.225.091.44.205.64.34a2.7 2.7 0 0 1 .55.52l-1.27 1a1.79 1.79 0 0 0-.6-.46 2 2 0 0 0-.83-.16 2 2 0 0 0-1.56.69 2.35 2.35 0 0 0-.46.77 2.78 2.78 0 0 0-.16 1c-.009.34.046.68.16 1 .104.283.26.545.46.77.188.21.415.38.67.5a2 2 0 0 0 .84.18 1.87 1.87 0 0 0 .9-.21 1.78 1.78 0 0 0 .65-.6l1.38 1a2.88 2.88 0 0 1-1.22 1.01Zm7.52 0a3.63 3.63 0 0 1-1.51.32 4.76 4.76 0 0 1-1.63-.27 3.89 3.89 0 0 1-1.28-.83 3.55 3.55 0 0 1-.85-1.26 4.23 4.23 0 0 1-.3-1.63 4.28 4.28 0 0 1 .3-1.64 3.43 3.43 0 0 1 .85-1.25 3.75 3.75 0 0 1 1.28-.8 4.76 4.76 0 0 1 1.63-.27 4 4 0 0 1 1.35.24c.225.091.44.205.64.34.21.144.395.32.55.52l-1.27 1a1.79 1.79 0 0 0-.6-.46 2 2 0 0 0-.83-.16 2 2 0 0 0-1.56.69 2.352 2.352 0 0 0-.46.77 3.01 3.01 0 0 0-.16 1c-.003.34.05.678.16 1 .108.282.263.542.46.77.188.21.416.38.67.5a2 2 0 0 0 .84.18 1.87 1.87 0 0 0 .9-.21 1.78 1.78 0 0 0 .65-.6l1.38 1a2.82 2.82 0 0 1-1.21 1.05Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 26 24" slot="off">
        <path
          d="M22.832 5.68a2.58 2.58 0 0 0-2.3-2.5c-1.81-.12-4.67-.18-7.53-.18-2.86 0-5.72.06-7.53.18a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c1.81.12 4.67.18 7.53.18 2.86 0 5.72-.06 7.53-.18a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.137-.21-8.283 0-12.42a1.11 1.11 0 0 1 .91-1.11c1.67-.11 4.43-.18 7.43-.18s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.137.21 8.283 0 12.42ZM10.843 14a1.55 1.55 0 0 1-.76.18 1.57 1.57 0 0 1-.71-.18 1.69 1.69 0 0 1-.57-.42 2.099 2.099 0 0 1-.38-.58 2.47 2.47 0 0 1 0-1.64 2 2 0 0 1 .39-.66 1.73 1.73 0 0 1 .58-.42c.23-.103.479-.158.73-.16.241-.004.48.044.7.14.199.088.373.222.51.39l1.08-.89a2.179 2.179 0 0 0-.47-.44 2.81 2.81 0 0 0-.54-.32 2.91 2.91 0 0 0-.58-.15 2.71 2.71 0 0 0-.56 0 4.08 4.08 0 0 0-1.38.15 3.27 3.27 0 0 0-1.09.67 3.14 3.14 0 0 0-.71 1.06 3.62 3.62 0 0 0-.26 1.39 3.57 3.57 0 0 0 .26 1.38 3 3 0 0 0 .71 1.06c.316.293.687.52 1.09.67.443.16.91.238 1.38.23a3.2 3.2 0 0 0 1.28-.27c.401-.183.747-.47 1-.83l-1.17-.88a1.42 1.42 0 0 1-.53.52Zm6.62 0a1.58 1.58 0 0 1-.76.18 1.54 1.54 0 0 1-.7-.18 1.69 1.69 0 0 1-.57-.42 2.12 2.12 0 0 1-.43-.58 2.29 2.29 0 0 1 .39-2.3 1.84 1.84 0 0 1 1.32-.58c.241-.003.48.045.7.14.199.088.373.222.51.39l1.08-.92a2.43 2.43 0 0 0-.47-.44 3.22 3.22 0 0 0-.53-.29 2.999 2.999 0 0 0-.57-.15 2.87 2.87 0 0 0-.57 0 4.06 4.06 0 0 0-1.36.15 3.17 3.17 0 0 0-1.09.67 3 3 0 0 0-.72 1.06 3.62 3.62 0 0 0-.25 1.39 3.57 3.57 0 0 0 .25 1.38c.16.402.405.764.72 1.06a3.17 3.17 0 0 0 1.09.67c.44.16.904.237 1.37.23.441 0 .877-.092 1.28-.27a2.45 2.45 0 0 0 1-.83l-1.15-.85a1.49 1.49 0 0 1-.54.49Z"
        />
      </svg>
    </media-captions-selectmenu>
  </template>

  <template partial="AirplayButton">
    <media-airplay-button part="bottom airplay button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg aria-hidden="true" viewBox="0 0 26 24" slot="airplay">
        <path
          d="M13.19 14.22a.25.25 0 0 0-.38 0l-5.46 6.37a.25.25 0 0 0 .19.41h10.92a.25.25 0 0 0 .19-.41l-5.46-6.37Z"
        />
        <path
          d="M22 3H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h2.94L8 16.75H4.25V4.25h17.5v12.5H18L19.06 18H22a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z"
        />
      </svg>
    </media-airplay-button>
  </template>

  <template partial="FullscreenButton">
    <media-fullscreen-button part="bottom fullscreen button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg aria-hidden="true" viewBox="0 0 24 24" slot="enter">
        <path
          d="M20.25 14.5a.76.76 0 0 0-.75.75v4.25h-4.25a.75.75 0 1 0 0 1.5h5a.76.76 0 0 0 .75-.75v-5a.76.76 0 0 0-.75-.75Zm0-11.5h-5a.76.76 0 0 0-.75.75.76.76 0 0 0 .75.75h4.25v4.25a.75.75 0 1 0 1.5 0v-5a.76.76 0 0 0-.75-.75ZM8.75 19.5H4.5v-4.25a.76.76 0 0 0-.75-.75.76.76 0 0 0-.75.75v5a.76.76 0 0 0 .75.75h5a.75.75 0 1 0 0-1.5Zm0-16.5h-5a.76.76 0 0 0-.75.75v5a.76.76 0 0 0 .75.75.76.76 0 0 0 .75-.75V4.5h4.25a.76.76 0 0 0 .75-.75.76.76 0 0 0-.75-.75Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" slot="exit">
        <path
          d="M20.25 14.5h-5a.76.76 0 0 0-.75.75v5a.75.75 0 1 0 1.5 0V16h4.25a.75.75 0 1 0 0-1.5Zm-5-5h5a.75.75 0 1 0 0-1.5H16V3.75a.75.75 0 1 0-1.5 0v5a.76.76 0 0 0 .75.75Zm-6.5 5h-5a.75.75 0 1 0 0 1.5H8v4.25a.75.75 0 1 0 1.5 0v-5a.76.76 0 0 0-.75-.75Zm0-11.5a.76.76 0 0 0-.75.75V8H3.75a.75.75 0 0 0 0 1.5h5a.76.76 0 0 0 .75-.75v-5A.76.76 0 0 0 8.75 3Z"
        />
      </svg>
    </media-fullscreen-button>
  </template>

  <template partial="CastButton">
    <media-cast-button part="bottom cast button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg aria-hidden="true" viewBox="0 0 26 24" slot="enter">
        <path d="M3 15.5V17c2.206 0 4 1.794 4 4h1.5A5.5 5.5 0 0 0 3 15.5Zm0 3V21h2.5A2.5 2.5 0 0 0 3 18.5Z" />
        <path d="M3 12.5V14c3.86 0 7 3.14 7 7h1.5A8.5 8.5 0 0 0 3 12.5Z" />
        <path
          d="M22 3H4a1 1 0 0 0-1 1v6.984c.424 0 .84.035 1.25.086V4.25h17.5v15.5h-8.82c.051.41.086.826.086 1.25H22a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 26 24" slot="exit">
        <path d="M3 15.5V17c2.206 0 4 1.794 4 4h1.5A5.5 5.5 0 0 0 3 15.5Zm0 3V21h2.5A2.5 2.5 0 0 0 3 18.5Z" />
        <path d="M3 12.5V14c3.86 0 7 3.14 7 7h1.5A8.5 8.5 0 0 0 3 12.5Z" />
        <path
          d="M22 3H4a1 1 0 0 0-1 1v6.984c.424 0 .84.035 1.25.086V4.25h17.5v15.5h-8.82c.051.41.086.826.086 1.25H22a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z"
        />
        <path d="M20.5 5.5h-15v5.811c3.52.906 6.283 3.67 7.189 7.19H20.5V5.5Z" />
      </svg>
    </media-cast-button>
  </template>

  <template partial="LiveButton">
    <media-live-button
      part="{{section ?? 'top'}} live button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-live-button>
  </template>

  <template partial="PlaybackRateButton">
    <media-playback-rate-button
      rates="{{playbackRates}}"
      part="bottom playback-rate button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-playback-rate-button>
  </template>

  <template partial="VolumeRange">
    <media-volume-range
      part="bottom volume range"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-volume-range>
  </template>

  <template partial="TimeDisplay">
    <media-time-display
      remaining="{{defaultShowRemainingTime}}"
      show-duration="{{!hideDuration}}"
      part="bottom time display"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-time-display>
  </template>

  <template partial="TimeRange">
    <media-time-range
      part="bottom time range"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-time-range>
  </template>

  <media-controller
    default-stream-type="{{defaultStreamType ?? 'on-demand'}}"
    breakpoints="sm:300 md:700"
    gestures-disabled="{{disabled}}"
    hotkeys="{{hotkeys}}"
    nohotkeys="{{nohotkeys}}"
    novolumepref="{{novolumepref}}"
    audio="{{audio}}"
    noautoseektolive="{{noautoseektolive}}"
    exportparts="layer, media-layer, poster-layer, vertical-layer, centered-layer, gesture-layer"
  >
    <slot name="media" slot="media"></slot>
    <slot name="poster" slot="poster"></slot>
    <media-loading-indicator slot="centered-chrome" no-auto-hide></media-loading-indicator>

    <template if="audio">

      <template if="streamType == 'on-demand'">
        <template if="title">
          <media-control-bar>{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar>
          {{>PlayButton}}
          {{>SeekBackwardButton}}
          {{>SeekForwardButton}}
          {{>TimeDisplay}}
          {{>TimeRange}}
          {{>MuteButton}}
          {{>VolumeRange}}
          {{>PlaybackRateButton}}
          {{>AirplayButton}}
          {{>CastButton}}
        </media-control-bar>
      </template>

      <template if="streamType == 'live'">

        <template if="targetLiveWindow > 0">
          <template if="title">
            <media-control-bar>{{>TitleDisplay}}</media-control-bar>
          </template>
          <media-control-bar>
            {{>PlayButton}}
            {{>LiveButton section="bottom"}}
            {{>SeekBackwardButton}}
            {{>SeekForwardButton}}
            {{>TimeDisplay}}
            {{>TimeRange}}
            {{>MuteButton}}
            {{>VolumeRange}}
            {{>PlaybackRateButton}}
            {{>AirplayButton}}
            {{>CastButton}}
          </media-control-bar>
        </template>

        <template if="!targetLiveWindow">
          <template if="title">
            <media-control-bar>{{>TitleDisplay}}</media-control-bar>
          </template>
          <media-control-bar>
            {{>PlayButton}}
            {{>LiveButton section="bottom"}}
            {{>MuteButton}}
            {{>VolumeRange}}
            <div class="spacer"></div>
            {{>AirplayButton}}
            {{>CastButton}}
          </media-control-bar>
        </template>

      </template>
    </template>

    <template if="!audio">

      <template if="streamType == 'on-demand'">

        <template if="!breakpointSm">
          {{>TimeRange}}
          <media-control-bar>
            {{>PlayButton}}
            {{>MuteButton}}
            <div class="spacer"></div>
            {{>CaptionsMenuButton}}
            {{>FullscreenButton}}
          </media-control-bar>
        </template>

        <template if="breakpointSm">
          <template if="!breakpointMd">
            <media-control-bar slot="top-chrome">
              {{>TitleDisplay}}
            </media-control-bar>
            <div slot="centered-chrome" class="center-controls">
              {{>SeekBackwardButton section="center"}}
              {{>PlayButton section="center"}}
              {{>SeekForwardButton section="center"}}
            </div>
            {{>TimeRange}}
            <media-control-bar>
              {{>PlayButton}}
              {{>TimeDisplay}}
              {{>MuteButton}}
              {{>VolumeRange}}
              <div class="spacer"></div>
              {{>PlaybackRateButton}}
              {{>CaptionsMenuButton}}
              {{>AirplayButton}}
              {{>CastButton}}
              {{>PipButton}}
              {{>FullscreenButton}}
            </media-control-bar>
          </template>
        </template>

        <template if="breakpointMd">
          <media-control-bar slot="top-chrome">
            {{>TitleDisplay}}
          </media-control-bar>
          <div slot="centered-chrome" class="center-controls">
            {{>PlayButton section="center"}}
          </div>
          {{>TimeRange}}
          <media-control-bar>
            {{>PlayButton}}
            {{>SeekBackwardButton}}
            {{>SeekForwardButton}}
            {{>TimeDisplay}}
            {{>MuteButton}}
            {{>VolumeRange}}
            <div class="spacer"></div>
            {{>PlaybackRateButton}}
            {{>CaptionsMenuButton}}
            {{>AirplayButton}}
            {{>CastButton}}
            {{>PipButton}}
            {{>FullscreenButton}}
          </media-control-bar>
        </template>

      </template>

      <template if="streamType == 'live'">

        <template if="!targetLiveWindow">

          <template if="!breakpointSm">
            <media-control-bar slot="top-chrome">
              {{>LiveButton}}
            </media-control-bar>
            <media-control-bar>
              {{>PlayButton}}
              {{>MuteButton}}
              <div class="spacer"></div>
              {{>CaptionsMenuButton}}
              {{>FullscreenButton}}
            </media-control-bar>
          </template>

          <template if="breakpointSm">
            <template if="!breakpointMd">
              <media-control-bar slot="top-chrome">
                {{>LiveButton}}
                {{>TitleDisplay}}
              </media-control-bar>
              <div slot="centered-chrome" class="center-controls">
                {{>PlayButton section="center"}}
              </div>
              <media-control-bar>
                {{>PlayButton}}
                {{>MuteButton}}
                {{>VolumeRange}}
                <div class="spacer"></div>
                {{>CaptionsMenuButton}}
                {{>AirplayButton}}
                {{>CastButton}}
                {{>PipButton}}
                {{>FullscreenButton}}
              </media-control-bar>
            </template>
          </template>

          <template if="breakpointMd">
            <media-control-bar slot="top-chrome">
              {{>LiveButton}}
              {{>TitleDisplay}}
            </media-control-bar>
            <div slot="centered-chrome" class="center-controls">
              {{>PlayButton section="center"}}
            </div>
            <media-control-bar>
              {{>PlayButton}}
              {{>MuteButton}}
              {{>VolumeRange}}
              <div class="spacer"></div>
              {{>CaptionsMenuButton}}
              {{>AirplayButton}}
              {{>CastButton}}
              {{>PipButton}}
              {{>FullscreenButton}}
            </media-control-bar>
          </template>
        </template>

        <template if="targetLiveWindow > 0">

          <template if="!breakpointSm">
            <media-control-bar slot="top-chrome">
              {{>LiveButton}}
            </media-control-bar>
            {{>TimeRange}}
            <media-control-bar>
              {{>PlayButton}}
              {{>MuteButton}}
              <div class="spacer"></div>
              {{>CaptionsMenuButton}}
              {{>FullscreenButton}}
            </media-control-bar>
          </template>

          <template if="breakpointSm">
            <template if="!breakpointMd">
              <media-control-bar slot="top-chrome">
                {{>LiveButton}}
                {{>TitleDisplay}}
              </media-control-bar>
              <div slot="centered-chrome" class="center-controls">
                {{>SeekBackwardButton section="center"}}
                {{>PlayButton section="center"}}
                {{>SeekForwardButton section="center"}}
              </div>
              {{>TimeRange}}
              <media-control-bar>
                {{>PlayButton}}
                {{>MuteButton}}
                {{>VolumeRange}}
                <div class="spacer"></div>
                {{>CaptionsMenuButton}}
                {{>AirplayButton}}
                {{>CastButton}}
                {{>PipButton}}
                {{>FullscreenButton}}
              </media-control-bar>
            </template>
          </template>

          <template if="breakpointMd">
            <media-control-bar slot="top-chrome">
              {{>LiveButton}}
              {{>TitleDisplay}}
            </media-control-bar>
            <div slot="centered-chrome" class="center-controls">
              {{>PlayButton section="center"}}
            </div>
            {{>TimeRange}}
            <media-control-bar>
              {{>PlayButton}}
              {{>SeekBackwardButton}}
              {{>SeekForwardButton}}
              {{>MuteButton}}
              {{>VolumeRange}}
              <div class="spacer"></div>
              {{>CaptionsMenuButton}}
              {{>AirplayButton}}
              {{>CastButton}}
              {{>PipButton}}
              {{>FullscreenButton}}
            </media-control-bar>
          </template>

        </template>

      </template>

    </template>

    <slot></slot>

  </media-controller>
</template>
`;

// src/media-chrome/dialog.ts
var styles = `
  :host {
    z-index: 100;
    display: var(--media-dialog-display, flex);
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    color: #fff;
    line-height: 18px;
    font-family: Arial, sans-serif;
    padding: var(--media-dialog-backdrop-padding, 0);
    background: var(--media-dialog-backdrop-background,
      linear-gradient(to bottom, rgba(20, 20, 30, 0.7) 50%, rgba(20, 20, 30, 0.9))
    );
    /* Needs to use !important to prevent overwrite of media-chrome */
    transition: var(--media-dialog-transition-open, visibility .2s, opacity .2s) !important;
    transform: var(--media-dialog-transform-open, none) !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  :host(:not([open])) {
    /* Needs to use !important to prevent overwrite of media-chrome */
    transition: var(--media-dialog-transition-close, visibility .1s, opacity .1s) !important;
    transform: var(--media-dialog-transform-close, none) !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  :focus-visible {
    box-shadow: 0 0 0 2px rgba(27, 127, 204, 0.9);
  }

  .dialog {
    position: relative;
    box-sizing: border-box;
    background: var(--media-dialog-background, none);
    padding: var(--media-dialog-padding, 10px);
    width: min(320px, 100%);
    word-wrap: break-word;
    max-height: 100%;
    overflow: auto;
    text-align: center;
    line-height: 1.4;
  }
`;
var template = internalDocument.createElement("template");
template.innerHTML = `
  <style>
    ${styles}
  </style>

  <div class="dialog">
    <slot></slot>
  </div>
`;
var MediaDialog = class extends internalGlobalThis.HTMLElement {
  constructor() {
    var _a;
    super();
    this.attachShadow({ mode: "open" });
    (_a = this.shadowRoot) == null ? void 0 : _a.appendChild(this.constructor.template.content.cloneNode(true));
  }
  show() {
    this.setAttribute("open", "");
    this.dispatchEvent(new CustomEvent("open", { composed: true, bubbles: true }));
    focus(this);
  }
  close() {
    if (!this.hasAttribute("open"))
      return;
    this.removeAttribute("open");
    this.dispatchEvent(new CustomEvent("close", { composed: true, bubbles: true }));
    restoreFocus(this);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === "open" && oldValue !== newValue) {
      newValue != null ? this.show() : this.close();
    }
  }
  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "dialog");
    }
    if (this.hasAttribute("open")) {
      focus(this);
    }
  }
};
MediaDialog.styles = styles;
MediaDialog.template = template;
MediaDialog.observedAttributes = ["open"];
function focus(el) {
  const initFocus = new CustomEvent("initfocus", { composed: true, bubbles: true, cancelable: true });
  el.dispatchEvent(initFocus);
  if (initFocus.defaultPrevented)
    return;
  let target = el.querySelector("[autofocus]:not([disabled])");
  if (!target && el.tabIndex >= 0) {
    target = el;
  }
  if (!target) {
    target = findFocusableElementWithin(el.shadowRoot);
  }
  el._previouslyFocusedElement = internalDocument.activeElement;
  if (internalDocument.activeElement instanceof HTMLElement) {
    internalDocument.activeElement.blur();
  }
  el.addEventListener(
    "transitionend",
    () => {
      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
      }
    },
    { once: true }
  );
}
function findFocusableElementWithin(hostElement) {
  const opts = ["button", "input", "keygen", "select", "textarea"];
  const query = opts.map(function(el) {
    return el + ":not([disabled])";
  });
  query.push('[tabindex]:not([disabled]):not([tabindex=""])');
  let target = hostElement == null ? void 0 : hostElement.querySelector(query.join(", "));
  if (!target && "attachShadow" in Element.prototype) {
    const elems = (hostElement == null ? void 0 : hostElement.querySelectorAll("*")) || [];
    for (let i = 0; i < elems.length; i++) {
      if (elems[i].tagName && elems[i].shadowRoot) {
        target = findFocusableElementWithin(elems[i].shadowRoot);
        if (target) {
          break;
        }
      }
    }
  }
  return target;
}
function restoreFocus(el) {
  if (el._previouslyFocusedElement instanceof HTMLElement) {
    el._previouslyFocusedElement.focus();
  }
}
if (!internalGlobalThis.customElements.get("media-dialog")) {
  internalGlobalThis.customElements.define("media-dialog", MediaDialog);
  internalGlobalThis.MediaDialog = MediaDialog;
}
var dialog_default = MediaDialog;

// src/dialog.ts
var template2 = internalDocument.createElement("template");
template2.innerHTML = `
  <style>
    ${dialog_default.styles}

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

  <div class="dialog">
    <slot></slot>
  </div>

  <slot name="close">
    <button class="close" tabindex="0">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </slot>
`;
var MxpDialog = class extends dialog_default {
  constructor() {
    var _a, _b;
    super();
    (_b = (_a = this.shadowRoot) == null ? void 0 : _a.querySelector(".close")) == null ? void 0 : _b.addEventListener("click", () => {
      this.close();
    });
  }
};
MxpDialog.template = template2;
if (!internalGlobalThis.customElements.get("mxp-dialog")) {
  internalGlobalThis.customElements.define("mxp-dialog", MxpDialog);
  internalGlobalThis.MxpDialog = MxpDialog;
}

// src/widget.ts
var template3 = internalDocument.createElement("template");
template3.innerHTML = `
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
var _resize, resize_fn, _render, render_fn, _updateVisibility, updateVisibility_fn;
var GroundWidget = class extends internalGlobalThis.HTMLElement {
  constructor() {
    var _a, _b;
    super();
    __privateAdd(this, _resize);
    __privateAdd(this, _render);
    __privateAdd(this, _updateVisibility);
    this.widgetsVisibleInfo = [];
    this.attachShadow({ mode: "open" });
    (_a = this.shadowRoot) == null ? void 0 : _a.appendChild(
      this.constructor.template.content.cloneNode(true)
    );
    (_b = this.media) == null ? void 0 : _b.addEventListener("timeupdate", (event) => {
      __privateMethod(this, _updateVisibility, updateVisibility_fn).call(this);
    });
    window.addEventListener("resize", (event) => {
      __privateMethod(this, _resize, resize_fn).call(this);
    });
    __privateMethod(this, _render, render_fn).call(this);
  }
  get media() {
    var _a;
    return (_a = this.parentElement) == null ? void 0 : _a.querySelector("mux-video");
  }
  get widgets() {
    var _a;
    try {
      return JSON.parse((_a = this.getAttribute("widgets")) != null ? _a : "[]");
    } catch (e) {
      return [];
    }
  }
  get aspectRatio() {
    var _a;
    return (_a = this.getAttribute("aspect-ratio")) != null ? _a : 0.5625;
  }
  isVisible(info, currentTime) {
    if (info.spawnTime <= currentTime * 1e3 && info.spawnTime + info.duration >= currentTime * 1e3) {
      return true;
    }
    return false;
  }
  createWidget(widget, id) {
    var _a, _b, _c, _d, _e;
    let dom;
    switch (widget.type) {
      case "TEXT":
        dom = internalDocument.createElement("p");
        dom.setAttribute("style", (_a = stylePropsToString(widget == null ? void 0 : widget.style)) != null ? _a : "");
        dom.setAttribute("id", `ground-widget-components-${id}`);
        dom.innerText = (_b = widget.label) != null ? _b : "";
        break;
      case "LINK":
        dom = internalDocument.createElement("a");
        dom.setAttribute("style", (_c = stylePropsToString(widget == null ? void 0 : widget.style)) != null ? _c : "");
        dom.setAttribute("id", `ground-widget-components-${id}`);
        dom.innerText = (_d = widget.label) != null ? _d : "";
        dom.href = (_e = widget.href) != null ? _e : "";
        dom.target = "_blank";
        break;
      default:
        dom = internalDocument.createElement("div");
        break;
    }
    return dom;
  }
};
_resize = new WeakSet();
resize_fn = function() {
  if (!this.media)
    return;
  if (!this.shadowRoot)
    return;
  const containerDOM = this.shadowRoot.getElementById(
    "groundbreak-widget-container"
  );
  if (!containerDOM)
    return;
  const width = `${this.media.getBoundingClientRect().height * this.aspectRatio}px`;
  containerDOM.style.width = width;
};
_render = new WeakSet();
render_fn = function() {
  const widgets = this.widgets;
  const initialWidgetVisibleInfo = widgets.map((widget, index) => {
    var _a, _b, _c, _d;
    const dom = this.createWidget(widget, index);
    (_b = (_a = this.shadowRoot) == null ? void 0 : _a.getElementById("groundbreak-widget-container")) == null ? void 0 : _b.appendChild(dom);
    return {
      id: index,
      isVisible: true,
      spawnTime: (_c = widget.spawnTime) != null ? _c : 0,
      duration: (_d = widget.duration) != null ? _d : 0
    };
  });
  this.widgetsVisibleInfo = initialWidgetVisibleInfo;
  __privateMethod(this, _updateVisibility, updateVisibility_fn).call(this);
  setTimeout(() => __privateMethod(this, _resize, resize_fn).call(this), 100);
};
_updateVisibility = new WeakSet();
updateVisibility_fn = function() {
  var _a, _b, _c;
  for (let info of this.widgetsVisibleInfo) {
    const isVisibleNew = this.isVisible(info, (_b = (_a = this.media) == null ? void 0 : _a.currentTime) != null ? _b : 0);
    if (info.isVisible === isVisibleNew)
      continue;
    info.isVisible = isVisibleNew;
    let dom = (_c = this.shadowRoot) == null ? void 0 : _c.getElementById(
      `ground-widget-components-${info.id}`
    );
    if (!dom)
      continue;
    dom.style.display = isVisibleNew === true ? "block" : "none";
  }
};
GroundWidget.template = template3;
if (!internalGlobalThis.customElements.get("groundbreak-widget")) {
  internalGlobalThis.customElements.define("groundbreak-widget", GroundWidget);
  internalGlobalThis.GroundWidget = GroundWidget;
}

// src/html.ts
import { TemplateInstance, ChildNodePart, AttrPart } from "media-chrome/dist/media-theme-element.js";
var eventListeners = /* @__PURE__ */ new WeakMap();
var EventHandler = class {
  constructor(element, type) {
    this.element = element;
    this.type = type;
    this.element.addEventListener(this.type, this);
    const elementMap = eventListeners.get(this.element);
    if (elementMap) {
      elementMap.set(this.type, this);
    }
  }
  set(listener) {
    if (typeof listener == "function") {
      this.handleEvent = listener.bind(this.element);
    } else if (typeof listener === "object" && typeof listener.handleEvent === "function") {
      this.handleEvent = listener.handleEvent.bind(listener);
    } else {
      this.element.removeEventListener(this.type, this);
      const elementMap = eventListeners.get(this.element);
      if (elementMap) {
        elementMap.delete(this.type);
      }
    }
  }
  static for(part) {
    if (!eventListeners.has(part.element))
      eventListeners.set(part.element, /* @__PURE__ */ new Map());
    const type = part.attributeName.slice(2);
    const elementListeners = eventListeners.get(part.element);
    if (elementListeners && elementListeners.has(type))
      return elementListeners.get(type);
    return new EventHandler(part.element, type);
  }
};
function processEvent(part, value) {
  if (part instanceof AttrPart && part.attributeName.startsWith("on")) {
    EventHandler.for(part).set(value);
    part.element.removeAttributeNS(part.attributeNamespace, part.attributeName);
    return true;
  }
  return false;
}
function processSubTemplate(part, value) {
  if (value instanceof TemplateResult && part instanceof ChildNodePart) {
    value.renderInto(part);
    return true;
  }
  return false;
}
function processDocumentFragment(part, value) {
  if (value instanceof DocumentFragment && part instanceof ChildNodePart) {
    if (value.childNodes.length)
      part.replace(...value.childNodes);
    return true;
  }
  return false;
}
function processPropertyIdentity(part, value) {
  if (part instanceof AttrPart) {
    const ns = part.attributeNamespace;
    const oldValue = part.element.getAttributeNS(ns, part.attributeName);
    if (String(value) !== oldValue) {
      part.value = String(value);
    }
    return true;
  }
  part.value = String(value);
  return true;
}
function processElementAttribute(part, value) {
  if (part instanceof AttrPart && value instanceof Element) {
    const element = part.element;
    if (element[part.attributeName] !== value) {
      part.element.removeAttributeNS(part.attributeNamespace, part.attributeName);
      element[part.attributeName] = value;
    }
    return true;
  }
  return false;
}
function processBooleanAttribute(part, value) {
  if (typeof value === "boolean" && part instanceof AttrPart) {
    const ns = part.attributeNamespace;
    const oldValue = part.element.hasAttributeNS(ns, part.attributeName);
    if (value !== oldValue) {
      part.booleanValue = value;
    }
    return true;
  }
  return false;
}
function processBooleanNode(part, value) {
  if (value === false && part instanceof ChildNodePart) {
    part.replace("");
    return true;
  }
  return false;
}
function processPart(part, value) {
  processElementAttribute(part, value) || processBooleanAttribute(part, value) || processEvent(part, value) || processBooleanNode(part, value) || processSubTemplate(part, value) || processDocumentFragment(part, value) || processPropertyIdentity(part, value);
}
var templates = /* @__PURE__ */ new Map();
var renderedTemplates = /* @__PURE__ */ new WeakMap();
var renderedTemplateInstances = /* @__PURE__ */ new WeakMap();
var TemplateResult = class {
  constructor(strings, values, processor) {
    this.strings = strings;
    this.values = values;
    this.processor = processor;
    this.stringsKey = this.strings.join("");
  }
  get template() {
    if (templates.has(this.stringsKey)) {
      return templates.get(this.stringsKey);
    } else {
      const template5 = internalDocument.createElement("template");
      const end = this.strings.length - 1;
      template5.innerHTML = this.strings.reduce((str, cur, i) => str + cur + (i < end ? `{{ ${i} }}` : ""), "");
      templates.set(this.stringsKey, template5);
      return template5;
    }
  }
  renderInto(element) {
    var _a;
    const template5 = this.template;
    if (renderedTemplates.get(element) !== template5) {
      renderedTemplates.set(element, template5);
      const instance = new TemplateInstance(template5, this.values, this.processor);
      renderedTemplateInstances.set(element, instance);
      if (element instanceof ChildNodePart) {
        element.replace(...instance.children);
      } else {
        element.appendChild(instance);
      }
      return;
    }
    const templateInstance = renderedTemplateInstances.get(element);
    (_a = templateInstance == null ? void 0 : templateInstance.update) == null ? void 0 : _a.call(templateInstance, this.values);
  }
};
var defaultProcessor = {
  processCallback(instance, parts, state) {
    var _a;
    if (!state)
      return;
    for (const [expression, part] of parts) {
      if (expression in state) {
        const value = (_a = state[expression]) != null ? _a : "";
        processPart(part, value);
      }
    }
  }
};
function html(strings, ...values) {
  return new TemplateResult(strings, values, defaultProcessor);
}
function render(result, element) {
  result.renderInto(element);
}

// src/template.ts
import { StreamTypes as StreamTypes2 } from "@mux/playback-core";
var muxTemplate = internalDocument.createElement("template");
if ("innerHTML" in muxTemplate)
  muxTemplate.innerHTML = media_theme_mux_default;
var template4 = (props) => html`
  <style>
    ${styles_default}
  </style>
  ${content(props)}
`;
var getHotKeys = (props) => {
  let hotKeys = props.hotKeys ? `${props.hotKeys}` : "";
  if (getStreamTypeFromAttr(props.streamType) === "live") {
    hotKeys += " noarrowleft noarrowright";
  }
  return hotKeys;
};
var content = (props) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I;
  return html`
  <media-theme
    template="${(_a = props.themeTemplate) != null ? _a : muxTemplate.content.children[0]}"
    default-stream-type="${(_b = props.defaultStreamType) != null ? _b : false}"
    hotkeys="${getHotKeys(props) || false}"
    nohotkeys="${props.noHotKeys || !props.hasSrc || props.isDialogOpen || false}"
    noautoseektolive="${!!((_c = props.streamType) == null ? void 0 : _c.includes(StreamTypes2.LIVE)) && props.targetLiveWindow !== 0}"
    novolumepref="${props.novolumepref || false}"
    disabled="${!props.hasSrc || props.isDialogOpen}"
    audio="${(_d = props.audio) != null ? _d : false}"
    style="${(_e = stylePropsToString({
    "--media-primary-color": props.primaryColor,
    "--media-secondary-color": props.secondaryColor
  })) != null ? _e : false}"
    default-showing-captions="${!props.defaultHiddenCaptions}"
    forward-seek-offset="${(_f = props.forwardSeekOffset) != null ? _f : false}"
    backward-seek-offset="${(_g = props.backwardSeekOffset) != null ? _g : false}"
    playback-rates="${(_h = props.playbackRates) != null ? _h : false}"
    default-show-remaining-time="${(_i = props.defaultShowRemainingTime) != null ? _i : false}"
    hide-duration="${(_j = props.hideDuration) != null ? _j : false}"
    title="${(_k = props.title) != null ? _k : false}"
    exportparts="top, center, bottom, layer, media-layer, poster-layer, vertical-layer, centered-layer, gesture-layer, poster, live, play, button, seek-backward, seek-forward, mute, captions, airplay, pip, fullscreen, cast, playback-rate, volume, range, time, display"
  >
    <mux-video
      slot="media"
      target-live-window="${(_l = props.targetLiveWindow) != null ? _l : false}"
      stream-type="${(_m = getStreamTypeFromAttr(props.streamType)) != null ? _m : false}"
      crossorigin="${(_n = props.crossOrigin) != null ? _n : ""}"
      playsinline
      autoplay="${(_o = props.autoplay) != null ? _o : false}"
      muted="${(_p = props.muted) != null ? _p : false}"
      loop="${(_q = props.loop) != null ? _q : false}"
      preload="${(_r = props.preload) != null ? _r : false}"
      debug="${(_s = props.debug) != null ? _s : false}"
      prefer-cmcd="${(_t = props.preferCmcd) != null ? _t : false}"
      disable-cookies="${(_u = props.disableCookies) != null ? _u : false}"
      prefer-playback="${(_v = props.preferPlayback) != null ? _v : false}"
      start-time="${props.startTime != null ? props.startTime : false}"
      beacon-collection-domain="${(_w = props.beaconCollectionDomain) != null ? _w : false}"
      player-software-name="${(_x = props.playerSoftwareName) != null ? _x : false}"
      player-software-version="${(_y = props.playerSoftwareVersion) != null ? _y : false}"
      env-key="${(_z = props.envKey) != null ? _z : false}"
      custom-domain="${(_A = props.customDomain) != null ? _A : false}"
      src="${!!props.src ? props.src : props.playbackId ? getSrcFromPlaybackId(props.playbackId, {
    maxResolution: props.maxResolution,
    domain: props.customDomain,
    token: props.tokens.playback
  }) : false}"
      cast-src="${!!props.src ? props.src : props.playbackId ? getSrcFromPlaybackId(props.playbackId, {
    maxResolution: props.maxResolution,
    domain: props.customDomain,
    token: props.tokens.playback
  }) : false}"
      exportparts="video"
    >
      ${props.storyboard ? html`<track
            label="thumbnails"
            default
            kind="metadata"
            src="${props.storyboard}"
          />` : html``}
    </mux-video>
    <media-poster-image
      no-auto-hide
      slot="poster"
      part="poster"
      src="${props.poster === "" ? false : (_B = props.poster) != null ? _B : false}"
      placeholder-src="${(_C = props.placeholder) != null ? _C : false}"
    ></media-poster-image>
    <groundbreak-widget
      widgets="${props.widgets}"
      aspect-ratio="${props.aspectRatio}"
    >
    </groundbreak-widget>
    <mxp-dialog
      no-auto-hide
      open="${(_D = props.isDialogOpen) != null ? _D : false}"
      onclose="${props.onCloseErrorDialog}"
      oninitfocus="${props.onInitFocusDialog}"
    >
      ${((_E = props.dialog) == null ? void 0 : _E.title) ? html`<h3>${props.dialog.title}</h3>` : html``}
      <p>
        ${(_F = props.dialog) == null ? void 0 : _F.message}
        ${((_G = props.dialog) == null ? void 0 : _G.linkUrl) ? html`<a
              href="${props.dialog.linkUrl}"
              target="_blank"
              rel="external noopener"
              aria-label="${(_H = props.dialog.linkText) != null ? _H : ""} ${i18n(
    `(opens in a new window)`
  )}"
              >${(_I = props.dialog.linkText) != null ? _I : props.dialog.linkUrl}</a
            >` : html``}
      </p>
    </mxp-dialog>
  </media-theme>
`;
};

// src/errors.ts
import { MediaError } from "@mux/mux-video";
function getErrorLogs(error2, offline, playbackId, playbackToken, translate) {
  var _a, _b, _c;
  let dialog = {};
  let devlog2 = {};
  switch (error2.code) {
    case MediaError.MEDIA_ERR_NETWORK: {
      dialog.title = i18n(`Network Error`, translate);
      dialog.message = error2.message;
      switch ((_a = error2.data) == null ? void 0 : _a.response.code) {
        case 412: {
          dialog.title = i18n(`Video is not currently available`, translate);
          dialog.message = i18n(`The live stream or video file are not yet ready.`, translate);
          devlog2.message = i18n(
            `This playback-id may belong to a live stream that is not currently active or an asset that is not ready.`,
            translate
          );
          devlog2.file = "412-not-playable.md";
          break;
        }
        case 404: {
          dialog.title = i18n(`Video does not exist`, translate);
          dialog.message = "";
          devlog2.message = i18n(
            `This playback-id does not exist. You may have used an Asset ID or an ID from a different resource.`,
            translate
          );
          devlog2.file = "404-not-found.md";
          break;
        }
        case 403: {
          dialog.title = i18n(`Invalid playback URL`, translate);
          dialog.message = i18n(
            `The video URL or playback-token are formatted with incorrect or incomplete information.`,
            translate
          );
          devlog2.message = i18n(
            `403 error trying to access this playback URL. If this is a signed URL, you might need to provide a playback-token.`,
            translate
          );
          devlog2.file = "missing-signed-tokens.md";
          if (!playbackToken)
            break;
          const { exp: tokenExpiry, aud: tokenType, sub: tokenPlaybackId } = parseJwt(playbackToken);
          const tokenExpired = Date.now() > tokenExpiry * 1e3;
          const playbackIdMismatch = tokenPlaybackId !== playbackId;
          const badTokenType = tokenType !== "v";
          const dateOptions = {
            timeStyle: "medium",
            dateStyle: "medium"
          };
          if (tokenExpired) {
            dialog.title = i18n(`Video URL has expired`, translate);
            dialog.message = i18n(`The video\u2019s secured playback-token has expired.`, translate);
            devlog2.message = i18n(`The video\u2019s secured playback-token has expired.`, translate);
            devlog2.context = i18n(`Expired at: {expiredDate}. Current time: {currentDate}.`, translate).format({
              expiredDate: new Intl.DateTimeFormat(en_default.code, dateOptions).format(tokenExpiry * 1e3),
              currentDate: new Intl.DateTimeFormat(en_default.code, dateOptions).format(Date.now())
            });
            devlog2.file = "403-expired-token.md";
            break;
          }
          if (playbackIdMismatch) {
            dialog.title = i18n(`Video URL is formatted incorrectly`, translate);
            dialog.message = i18n(
              `The video\u2019s playback ID does not match the one encoded in the playback-token.`,
              translate
            );
            devlog2.message = i18n(
              `The video\u2019s playback ID does not match the one encoded in the playback-token.`,
              translate
            );
            devlog2.context = i18n(
              `Specified playback ID: {playbackId} and the playback ID encoded in the playback-token: {tokenPlaybackId}`,
              translate
            ).format({
              playbackId,
              tokenPlaybackId
            });
            devlog2.file = "403-playback-id-mismatch.md";
            break;
          }
          if (badTokenType) {
            dialog.title = i18n(`Video URL is formatted incorrectly`, translate);
            dialog.message = i18n(`The playback-token is formatted with incorrect information.`, translate);
            devlog2.message = i18n(`The playback-token is formatted with incorrect information.`, translate);
            devlog2.context = i18n(
              `The playback-token has an incorrect aud value: {tokenType}. aud value should be v.`,
              translate
            ).format({
              tokenType
            });
            devlog2.file = "403-incorrect-aud-value.md";
            break;
          }
          devlog2.message = i18n(
            `403 error trying to access this playback URL. If this is a signed playback ID, the token might not have been generated correctly.`,
            translate
          );
          devlog2.file = "403-malformatted-token.md";
          break;
        }
      }
      break;
    }
    case MediaError.MEDIA_ERR_DECODE: {
      const { message } = error2;
      dialog = {
        title: i18n(`Media Error`, translate),
        message
      };
      devlog2.file = "media-decode-error.md";
      break;
    }
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: {
      const status = (_c = (_b = error2.data) == null ? void 0 : _b.response) == null ? void 0 : _c.code;
      if (status >= 400 && status < 500) {
        error2.code = MediaError.MEDIA_ERR_NETWORK;
        error2.data = { response: { code: status } };
        ({ dialog, devlog: devlog2 } = getErrorLogs(error2, offline, playbackId, playbackToken));
        break;
      }
      dialog = {
        title: i18n(`Source Not Supported`, translate),
        message: error2.message
      };
      devlog2.file = "media-src-not-supported.md";
      break;
    }
    default:
      dialog = {
        title: i18n(`Error`, translate),
        message: error2.message
      };
      break;
  }
  if (offline) {
    dialog = {
      title: i18n(`Your device appears to be offline`, translate),
      message: i18n(`Check your internet connection and try reloading this video.`, translate)
    };
  }
  return { dialog, devlog: devlog2 };
}

// src/index.ts
var VideoAttributes = {
  SRC: "src",
  POSTER: "poster"
};
var PlayerAttributes = {
  STYLE: "style",
  DEFAULT_HIDDEN_CAPTIONS: "default-hidden-captions",
  PRIMARY_COLOR: "primary-color",
  SECONDARY_COLOR: "secondary-color",
  FORWARD_SEEK_OFFSET: "forward-seek-offset",
  BACKWARD_SEEK_OFFSET: "backward-seek-offset",
  PLAYBACK_TOKEN: "playback-token",
  THUMBNAIL_TOKEN: "thumbnail-token",
  STORYBOARD_TOKEN: "storyboard-token",
  STORYBOARD_SRC: "storyboard-src",
  THUMBNAIL_TIME: "thumbnail-time",
  AUDIO: "audio",
  NOHOTKEYS: "nohotkeys",
  HOTKEYS: "hotkeys",
  PLAYBACK_RATES: "playbackrates",
  DEFAULT_SHOW_REMAINING_TIME: "default-show-remaining-time",
  TITLE: "title",
  PLACEHOLDER: "placeholder",
  THEME: "theme",
  DEFAULT_STREAM_TYPE: "default-stream-type",
  TARGET_LIVE_WINDOW: "target-live-window",
  NO_VOLUME_PREF: "no-volume-pref"
};
var GroundBreakElementAttributes = {
  WIDGETS: "widgets",
  ASPECT_RATIO: "aspect-ratio"
};
var ThemeAttributeNames = [
  "audio",
  "backward-seek-offset",
  "default-show-remaining-time",
  "default-showing-captions",
  "noautoseektolive",
  "disabled",
  "exportparts",
  "forward-seek-offset",
  "hide-duration",
  "hotkeys",
  "nohotkeys",
  "playbackrates",
  "default-stream-type",
  "stream-type",
  "style",
  "target-live-window",
  "template",
  "title",
  "no-volume-pref"
];
function getProps(el, state) {
  var _a;
  const props = {
    src: !el.playbackId && el.src,
    playbackId: el.playbackId,
    hasSrc: !!el.playbackId || !!el.src,
    poster: el.poster,
    storyboard: el.storyboard,
    storyboardSrc: el.getAttribute(PlayerAttributes.STORYBOARD_SRC),
    placeholder: el.getAttribute("placeholder"),
    themeTemplate: getThemeTemplate(el),
    thumbnailTime: !el.tokens.thumbnail && el.thumbnailTime,
    autoplay: el.autoplay,
    crossOrigin: el.crossOrigin,
    loop: el.loop,
    widgets: el.widgets,
    aspectRatio: el.aspectRatio,
    noHotKeys: el.hasAttribute(PlayerAttributes.NOHOTKEYS),
    hotKeys: el.getAttribute(PlayerAttributes.HOTKEYS),
    muted: el.muted,
    paused: el.paused,
    preload: el.preload,
    envKey: el.envKey,
    preferCmcd: el.preferCmcd,
    debug: el.debug,
    disableCookies: el.disableCookies,
    tokens: el.tokens,
    beaconCollectionDomain: el.beaconCollectionDomain,
    maxResolution: el.maxResolution,
    metadata: el.metadata,
    playerSoftwareName: el.playerSoftwareName,
    playerSoftwareVersion: el.playerSoftwareVersion,
    startTime: el.startTime,
    preferPlayback: el.preferPlayback,
    audio: el.audio,
    defaultStreamType: el.defaultStreamType,
    targetLiveWindow: el.getAttribute(MuxVideoAttributes.TARGET_LIVE_WINDOW),
    streamType: getStreamTypeFromAttr(
      el.getAttribute(MuxVideoAttributes.STREAM_TYPE)
    ),
    primaryColor: el.primaryColor,
    secondaryColor: el.secondaryColor,
    forwardSeekOffset: el.forwardSeekOffset,
    backwardSeekOffset: el.backwardSeekOffset,
    defaultHiddenCaptions: el.defaultHiddenCaptions,
    defaultShowRemainingTime: el.defaultShowRemainingTime,
    hideDuration: getHideDuration(el),
    playbackRates: el.getAttribute(PlayerAttributes.PLAYBACK_RATES),
    customDomain: (_a = el.getAttribute(MuxVideoAttributes.CUSTOM_DOMAIN)) != null ? _a : void 0,
    title: el.getAttribute(PlayerAttributes.TITLE),
    novolumepref: el.hasAttribute(PlayerAttributes.NO_VOLUME_PREF),
    ...state
  };
  return props;
}
function getThemeTemplate(el) {
  var _a, _b;
  let themeName = el.getAttribute(PlayerAttributes.THEME);
  if (themeName) {
    const templateElement = (_b = (_a = el.getRootNode()) == null ? void 0 : _a.getElementById) == null ? void 0 : _b.call(_a, themeName);
    if (templateElement)
      return templateElement;
    if (!themeName.startsWith("media-theme-")) {
      themeName = `media-theme-${themeName}`;
    }
    const ThemeElement = internalGlobalThis.customElements.get(themeName);
    if (ThemeElement == null ? void 0 : ThemeElement.template)
      return ThemeElement.template;
  }
}
function getHideDuration(el) {
  var _a;
  const timeDisplay = (_a = el.mediaController) == null ? void 0 : _a.querySelector("media-time-display");
  return timeDisplay && getComputedStyle(timeDisplay).getPropertyValue("--media-duration-display-display").trim() === "none";
}
function getMetadataFromAttrs(el) {
  return el.getAttributeNames().filter((attrName) => attrName.startsWith("metadata-")).reduce((currAttrs, attrName) => {
    const value = el.getAttribute(attrName);
    if (value !== null) {
      currAttrs[attrName.replace(/^metadata-/, "").replace(/-/g, "_")] = value;
    }
    return currAttrs;
  }, {});
}
var MuxVideoAttributeNames = Object.values(MuxVideoAttributes);
var VideoAttributeNames = Object.values(VideoAttributes);
var PlayerAttributeNames = Object.values(PlayerAttributes);
var GroundBreakElementAttributeNames = Object.values(
  GroundBreakElementAttributes
);
var playerSoftwareVersion = getPlayerVersion();
var playerSoftwareName = "mux-player";
var initialState = {
  dialog: void 0,
  isDialogOpen: false
};
var _isInit, _tokens2, _userInactive, _hotkeys, _state, _init, init_fn, _setupCSSProperties, setupCSSProperties_fn, _setState, setState_fn, _render2, render_fn2, _setUpThemeAttributes, setUpThemeAttributes_fn, _setUpErrors, setUpErrors_fn, _setUpCaptionsButton, setUpCaptionsButton_fn, _setUpCaptionsMovement, setUpCaptionsMovement_fn;
var MuxPlayerElement = class extends video_api_default {
  constructor() {
    super();
    __privateAdd(this, _init);
    __privateAdd(this, _setupCSSProperties);
    __privateAdd(this, _setState);
    __privateAdd(this, _render2);
    __privateAdd(this, _setUpThemeAttributes);
    __privateAdd(this, _setUpErrors);
    __privateAdd(this, _setUpCaptionsButton);
    __privateAdd(this, _setUpCaptionsMovement);
    __privateAdd(this, _isInit, false);
    __privateAdd(this, _tokens2, {});
    __privateAdd(this, _userInactive, true);
    __privateAdd(this, _hotkeys, new AttributeTokenList(this, "hotkeys"));
    __privateAdd(this, _state, {
      ...initialState,
      onCloseErrorDialog: () => __privateMethod(this, _setState, setState_fn).call(this, { dialog: void 0, isDialogOpen: false }),
      onInitFocusDialog: (e) => {
        const isFocusedElementInPlayer = containsComposedNode(
          this,
          internalDocument.activeElement
        );
        if (!isFocusedElementInPlayer)
          e.preventDefault();
      }
    });
    this.attachShadow({ mode: "open" });
    __privateMethod(this, _setupCSSProperties, setupCSSProperties_fn).call(this);
    if (this.isConnected) {
      __privateMethod(this, _init, init_fn).call(this);
    }
  }
  static get observedAttributes() {
    var _a;
    return [
      ...(_a = video_api_default.observedAttributes) != null ? _a : [],
      ...VideoAttributeNames,
      ...MuxVideoAttributeNames,
      ...PlayerAttributeNames,
      ...GroundBreakElementAttributeNames
    ];
  }
  get mediaTheme() {
    var _a;
    return (_a = this.shadowRoot) == null ? void 0 : _a.querySelector("media-theme");
  }
  get mediaController() {
    var _a, _b;
    return (_b = (_a = this.mediaTheme) == null ? void 0 : _a.shadowRoot) == null ? void 0 : _b.querySelector("media-controller");
  }
  connectedCallback() {
    var _a;
    const muxVideo = (_a = this.shadowRoot) == null ? void 0 : _a.querySelector(
      "mux-video"
    );
    if (muxVideo) {
      muxVideo.metadata = getMetadataFromAttrs(this);
    }
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    __privateMethod(this, _init, init_fn).call(this);
    super.attributeChangedCallback(attrName, oldValue, newValue);
    switch (attrName) {
      case PlayerAttributes.HOTKEYS:
        __privateGet(this, _hotkeys).value = newValue;
        break;
      case PlayerAttributes.THUMBNAIL_TIME: {
        if (newValue != null && this.tokens.thumbnail) {
          warn(
            i18n(
              `Use of thumbnail-time with thumbnail-token is currently unsupported. Ignore thumbnail-time.`
            ).format({})
          );
        }
        break;
      }
      case PlayerAttributes.THUMBNAIL_TOKEN: {
        const { aud } = parseJwt(newValue);
        if (newValue && aud !== "t") {
          warn(
            i18n(
              `The provided thumbnail-token should have audience value 't' instead of '{aud}'.`
            ).format({ aud })
          );
        }
        break;
      }
      case PlayerAttributes.STORYBOARD_TOKEN: {
        const { aud } = parseJwt(newValue);
        if (newValue && aud !== "s") {
          warn(
            i18n(
              `The provided storyboard-token should have audience value 's' instead of '{aud}'.`
            ).format({ aud })
          );
        }
        break;
      }
      case MuxVideoAttributes.PLAYBACK_ID: {
        if (newValue == null ? void 0 : newValue.includes("?token")) {
          error(
            i18n(
              "The specificed playback ID {playbackId} contains a token which must be provided via the playback-token attribute."
            ).format({
              playbackId: newValue
            })
          );
        }
        break;
      }
      case MuxVideoAttributes.STREAM_TYPE: {
        if (newValue && ![
          StreamTypes3.LIVE,
          StreamTypes3.ON_DEMAND,
          StreamTypes3.UNKNOWN
        ].includes(newValue)) {
          if (["ll-live", "live:dvr", "ll-live:dvr"].includes(
            this.streamType
          )) {
            this.targetLiveWindow = newValue.includes("dvr") ? Number.POSITIVE_INFINITY : 0;
          } else {
            devlog({
              file: "invalid-stream-type.md",
              message: i18n(
                `Invalid stream-type value supplied: \`{streamType}\`. Please provide stream-type as either: \`on-demand\` or \`live\``
              ).format({ streamType: this.streamType })
            });
          }
        } else {
          this.targetLiveWindow = newValue === StreamTypes3.LIVE ? 0 : Number.NaN;
        }
      }
    }
    const shouldClearState = [
      MuxVideoAttributes.PLAYBACK_ID,
      VideoAttributes.SRC,
      PlayerAttributes.PLAYBACK_TOKEN
    ].includes(attrName);
    if (shouldClearState && oldValue !== newValue) {
      __privateSet(this, _state, { ...__privateGet(this, _state), ...initialState });
    }
    __privateMethod(this, _render2, render_fn2).call(this, { [toPropName(attrName)]: newValue });
  }
  get preferCmcd() {
    var _a;
    return (_a = this.getAttribute(
      MuxVideoAttributes.PREFER_CMCD
    )) != null ? _a : void 0;
  }
  set preferCmcd(value) {
    if (value === this.preferCmcd)
      return;
    if (!value) {
      this.removeAttribute(MuxVideoAttributes.PREFER_CMCD);
    } else if (CmcdTypeValues.includes(value)) {
      this.setAttribute(MuxVideoAttributes.PREFER_CMCD, value);
    } else {
      warn(
        `Invalid value for preferCmcd. Must be one of ${CmcdTypeValues.join()}`
      );
    }
  }
  get hasPlayed() {
    var _a, _b;
    return (_b = (_a = this.mediaController) == null ? void 0 : _a.hasAttribute("media-has-played")) != null ? _b : false;
  }
  get inLiveWindow() {
    var _a;
    return (_a = this.mediaController) == null ? void 0 : _a.hasAttribute("media-time-is-live");
  }
  get _hls() {
    var _a;
    return (_a = this.media) == null ? void 0 : _a._hls;
  }
  get mux() {
    var _a;
    return (_a = this.media) == null ? void 0 : _a.mux;
  }
  get theme() {
    var _a;
    return (_a = this.getAttribute(PlayerAttributes.THEME)) != null ? _a : "";
  }
  set theme(val) {
    this.setAttribute(PlayerAttributes.THEME, `${val}`);
  }
  get themeProps() {
    const theme = this.mediaTheme;
    if (!theme)
      return;
    const props = {};
    for (const name of theme.getAttributeNames()) {
      if (ThemeAttributeNames.includes(name))
        continue;
      const value = theme.getAttribute(name);
      props[camelCase(name)] = value === "" ? true : value;
    }
    return props;
  }
  set themeProps(props) {
    var _a, _b;
    __privateMethod(this, _init, init_fn).call(this);
    const themeProps = { ...this.themeProps, ...props };
    for (const name in themeProps) {
      if (ThemeAttributeNames.includes(name))
        continue;
      const value = props == null ? void 0 : props[name];
      if (typeof value === "boolean" || value == null) {
        (_a = this.mediaTheme) == null ? void 0 : _a.toggleAttribute(kebabCase(name), Boolean(value));
      } else {
        (_b = this.mediaTheme) == null ? void 0 : _b.setAttribute(kebabCase(name), value);
      }
    }
  }
  get playbackId() {
    var _a;
    return (_a = this.getAttribute(MuxVideoAttributes.PLAYBACK_ID)) != null ? _a : void 0;
  }
  set playbackId(val) {
    if (val) {
      this.setAttribute(MuxVideoAttributes.PLAYBACK_ID, val);
    } else {
      this.removeAttribute(MuxVideoAttributes.PLAYBACK_ID);
    }
  }
  get widgets() {
    var _a;
    return (_a = this.getAttribute("widgets")) != null ? _a : void 0;
  }
  set widgets(val) {
    if (val) {
      this.setAttribute("widgets", val);
    } else {
      this.removeAttribute("widgets");
    }
  }
  get aspectRatio() {
    var _a;
    return (_a = this.getAttribute("aspect-ratio")) != null ? _a : void 0;
  }
  set aspectRatio(val) {
    if (val) {
      this.setAttribute("aspect-ratio", val);
    } else {
      this.removeAttribute("aspect-ratio");
    }
  }
  get src() {
    var _a, _b;
    if (this.playbackId) {
      return (_a = getVideoAttribute2(this, VideoAttributes.SRC)) != null ? _a : void 0;
    }
    return (_b = this.getAttribute(VideoAttributes.SRC)) != null ? _b : void 0;
  }
  set src(val) {
    if (val) {
      this.setAttribute(VideoAttributes.SRC, val);
    } else {
      this.removeAttribute(VideoAttributes.SRC);
    }
  }
  get poster() {
    var _a;
    const val = this.getAttribute(VideoAttributes.POSTER);
    if (val != null)
      return val;
    if (this.playbackId && !this.audio) {
      return getPosterURLFromPlaybackId(this.playbackId, {
        domain: this.customDomain,
        thumbnailTime: (_a = this.thumbnailTime) != null ? _a : this.startTime,
        token: this.tokens.thumbnail
      });
    }
    return void 0;
  }
  set poster(val) {
    if (val || val === "") {
      this.setAttribute(VideoAttributes.POSTER, val);
    } else {
      this.removeAttribute(VideoAttributes.POSTER);
    }
  }
  get storyboardSrc() {
    var _a;
    return (_a = this.getAttribute(PlayerAttributes.STORYBOARD_SRC)) != null ? _a : void 0;
  }
  set storyboardSrc(src) {
    if (!src) {
      this.removeAttribute(PlayerAttributes.STORYBOARD_SRC);
    } else {
      this.setAttribute(PlayerAttributes.STORYBOARD_SRC, src);
    }
  }
  get storyboard() {
    if (this.storyboardSrc && !this.tokens.storyboard)
      return this.storyboardSrc;
    if (this.audio || !this.playbackId || !this.streamType || [StreamTypes3.LIVE, StreamTypes3.UNKNOWN].includes(this.streamType)) {
      return void 0;
    }
    return getStoryboardURLFromPlaybackId(this.playbackId, {
      domain: this.customDomain,
      token: this.tokens.storyboard
    });
  }
  get audio() {
    return this.hasAttribute(PlayerAttributes.AUDIO);
  }
  set audio(val) {
    if (!val) {
      this.removeAttribute(PlayerAttributes.AUDIO);
      return;
    }
    this.setAttribute(PlayerAttributes.AUDIO, "");
  }
  get hotkeys() {
    return __privateGet(this, _hotkeys);
  }
  get nohotkeys() {
    return this.hasAttribute(PlayerAttributes.NOHOTKEYS);
  }
  set nohotkeys(val) {
    if (!val) {
      this.removeAttribute(PlayerAttributes.NOHOTKEYS);
      return;
    }
    this.setAttribute(PlayerAttributes.NOHOTKEYS, "");
  }
  get thumbnailTime() {
    return toNumberOrUndefined(
      this.getAttribute(PlayerAttributes.THUMBNAIL_TIME)
    );
  }
  set thumbnailTime(val) {
    this.setAttribute(PlayerAttributes.THUMBNAIL_TIME, `${val}`);
  }
  get title() {
    var _a;
    return (_a = this.getAttribute(PlayerAttributes.TITLE)) != null ? _a : "";
  }
  set title(val) {
    if (val === this.title)
      return;
    if (!!val) {
      this.setAttribute(PlayerAttributes.TITLE, val);
    } else {
      this.removeAttribute("title");
    }
    super.title = val;
  }
  get placeholder() {
    var _a;
    return (_a = getVideoAttribute2(this, PlayerAttributes.PLACEHOLDER)) != null ? _a : "";
  }
  set placeholder(val) {
    this.setAttribute(PlayerAttributes.PLACEHOLDER, `${val}`);
  }
  get primaryColor() {
    var _a, _b;
    let color = this.getAttribute(PlayerAttributes.PRIMARY_COLOR);
    if (color != null)
      return color;
    if (this.mediaTheme) {
      color = (_b = (_a = internalGlobalThis.getComputedStyle(this.mediaTheme)) == null ? void 0 : _a.getPropertyValue("--_primary-color")) == null ? void 0 : _b.trim();
      if (color)
        return color;
    }
  }
  set primaryColor(val) {
    this.setAttribute(PlayerAttributes.PRIMARY_COLOR, `${val}`);
  }
  get secondaryColor() {
    var _a, _b;
    let color = this.getAttribute(PlayerAttributes.SECONDARY_COLOR);
    if (color != null)
      return color;
    if (this.mediaTheme) {
      color = (_b = (_a = internalGlobalThis.getComputedStyle(this.mediaTheme)) == null ? void 0 : _a.getPropertyValue("--_secondary-color")) == null ? void 0 : _b.trim();
      if (color)
        return color;
    }
  }
  set secondaryColor(val) {
    this.setAttribute(PlayerAttributes.SECONDARY_COLOR, `${val}`);
  }
  get defaultShowRemainingTime() {
    return this.hasAttribute(PlayerAttributes.DEFAULT_SHOW_REMAINING_TIME);
  }
  set defaultShowRemainingTime(val) {
    if (!val) {
      this.removeAttribute(PlayerAttributes.DEFAULT_SHOW_REMAINING_TIME);
    } else {
      this.setAttribute(PlayerAttributes.DEFAULT_SHOW_REMAINING_TIME, "");
    }
  }
  get playbackRates() {
    if (!this.hasAttribute(PlayerAttributes.PLAYBACK_RATES))
      return void 0;
    return this.getAttribute(PlayerAttributes.PLAYBACK_RATES).trim().split(/\s*,?\s+/).map((str) => Number(str)).filter((num) => !Number.isNaN(num)).sort((a, b) => a - b);
  }
  set playbackRates(val) {
    if (!val) {
      this.removeAttribute(PlayerAttributes.PLAYBACK_RATES);
      return;
    }
    this.setAttribute(PlayerAttributes.PLAYBACK_RATES, val.join(" "));
  }
  get forwardSeekOffset() {
    var _a;
    return (_a = toNumberOrUndefined(
      this.getAttribute(PlayerAttributes.FORWARD_SEEK_OFFSET)
    )) != null ? _a : 10;
  }
  set forwardSeekOffset(val) {
    this.setAttribute(PlayerAttributes.FORWARD_SEEK_OFFSET, `${val}`);
  }
  get backwardSeekOffset() {
    var _a;
    return (_a = toNumberOrUndefined(
      this.getAttribute(PlayerAttributes.BACKWARD_SEEK_OFFSET)
    )) != null ? _a : 10;
  }
  set backwardSeekOffset(val) {
    this.setAttribute(PlayerAttributes.BACKWARD_SEEK_OFFSET, `${val}`);
  }
  get defaultHiddenCaptions() {
    return this.hasAttribute(PlayerAttributes.DEFAULT_HIDDEN_CAPTIONS);
  }
  set defaultHiddenCaptions(val) {
    if (!val) {
      this.removeAttribute(PlayerAttributes.DEFAULT_HIDDEN_CAPTIONS);
    } else {
      this.setAttribute(PlayerAttributes.DEFAULT_HIDDEN_CAPTIONS, "");
    }
  }
  get playerSoftwareName() {
    var _a;
    return (_a = this.getAttribute(MuxVideoAttributes.PLAYER_SOFTWARE_NAME)) != null ? _a : playerSoftwareName;
  }
  get playerSoftwareVersion() {
    var _a;
    return (_a = this.getAttribute(MuxVideoAttributes.PLAYER_SOFTWARE_VERSION)) != null ? _a : playerSoftwareVersion;
  }
  get beaconCollectionDomain() {
    var _a;
    return (_a = this.getAttribute(MuxVideoAttributes.BEACON_COLLECTION_DOMAIN)) != null ? _a : void 0;
  }
  set beaconCollectionDomain(val) {
    if (val === this.beaconCollectionDomain)
      return;
    if (val) {
      this.setAttribute(MuxVideoAttributes.BEACON_COLLECTION_DOMAIN, val);
    } else {
      this.removeAttribute(MuxVideoAttributes.BEACON_COLLECTION_DOMAIN);
    }
  }
  get maxResolution() {
    var _a;
    return (_a = this.getAttribute(MuxVideoAttributes.MAX_RESOLUTION)) != null ? _a : void 0;
  }
  set maxResolution(val) {
    if (val === this.maxResolution)
      return;
    if (val) {
      this.setAttribute(MuxVideoAttributes.MAX_RESOLUTION, val);
    } else {
      this.removeAttribute(MuxVideoAttributes.MAX_RESOLUTION);
    }
  }
  get customDomain() {
    var _a;
    return (_a = this.getAttribute(MuxVideoAttributes.CUSTOM_DOMAIN)) != null ? _a : void 0;
  }
  set customDomain(val) {
    if (val === this.customDomain)
      return;
    if (val) {
      this.setAttribute(MuxVideoAttributes.CUSTOM_DOMAIN, val);
    } else {
      this.removeAttribute(MuxVideoAttributes.CUSTOM_DOMAIN);
    }
  }
  get envKey() {
    var _a;
    return (_a = getVideoAttribute2(this, MuxVideoAttributes.ENV_KEY)) != null ? _a : void 0;
  }
  set envKey(val) {
    this.setAttribute(MuxVideoAttributes.ENV_KEY, `${val}`);
  }
  get noVolumePref() {
    return this.hasAttribute(PlayerAttributes.NO_VOLUME_PREF);
  }
  set noVolumePref(val) {
    if (val) {
      this.setAttribute(PlayerAttributes.NO_VOLUME_PREF, "");
    } else {
      this.removeAttribute(PlayerAttributes.NO_VOLUME_PREF);
    }
  }
  get debug() {
    return getVideoAttribute2(this, MuxVideoAttributes.DEBUG) != null;
  }
  set debug(val) {
    if (val) {
      this.setAttribute(MuxVideoAttributes.DEBUG, "");
    } else {
      this.removeAttribute(MuxVideoAttributes.DEBUG);
    }
  }
  get disableCookies() {
    return getVideoAttribute2(this, MuxVideoAttributes.DISABLE_COOKIES) != null;
  }
  set disableCookies(val) {
    if (val) {
      this.setAttribute(MuxVideoAttributes.DISABLE_COOKIES, "");
    } else {
      this.removeAttribute(MuxVideoAttributes.DISABLE_COOKIES);
    }
  }
  get streamType() {
    var _a, _b, _c;
    return (_c = (_b = this.getAttribute(MuxVideoAttributes.STREAM_TYPE)) != null ? _b : (_a = this.media) == null ? void 0 : _a.streamType) != null ? _c : StreamTypes3.UNKNOWN;
  }
  set streamType(val) {
    this.setAttribute(MuxVideoAttributes.STREAM_TYPE, `${val}`);
  }
  get defaultStreamType() {
    var _a, _b, _c;
    return (_c = (_b = this.getAttribute(
      PlayerAttributes.DEFAULT_STREAM_TYPE
    )) != null ? _b : (_a = this.mediaController) == null ? void 0 : _a.getAttribute(
      PlayerAttributes.DEFAULT_STREAM_TYPE
    )) != null ? _c : StreamTypes3.ON_DEMAND;
  }
  set defaultStreamType(val) {
    if (val) {
      this.setAttribute(PlayerAttributes.DEFAULT_STREAM_TYPE, val);
    } else {
      this.removeAttribute(PlayerAttributes.DEFAULT_STREAM_TYPE);
    }
  }
  get targetLiveWindow() {
    var _a, _b;
    if (this.hasAttribute(PlayerAttributes.TARGET_LIVE_WINDOW)) {
      return +this.getAttribute(
        PlayerAttributes.TARGET_LIVE_WINDOW
      );
    }
    return (_b = (_a = this.media) == null ? void 0 : _a.targetLiveWindow) != null ? _b : Number.NaN;
  }
  set targetLiveWindow(val) {
    if (val == this.targetLiveWindow)
      return;
    if (val == null) {
      this.removeAttribute(PlayerAttributes.TARGET_LIVE_WINDOW);
    } else {
      this.setAttribute(PlayerAttributes.TARGET_LIVE_WINDOW, `${+val}`);
    }
  }
  get liveEdgeStart() {
    var _a;
    return (_a = this.media) == null ? void 0 : _a.liveEdgeStart;
  }
  get startTime() {
    return toNumberOrUndefined(
      getVideoAttribute2(this, MuxVideoAttributes.START_TIME)
    );
  }
  set startTime(val) {
    this.setAttribute(MuxVideoAttributes.START_TIME, `${val}`);
  }
  get preferPlayback() {
    const val = this.getAttribute(MuxVideoAttributes.PREFER_PLAYBACK);
    if (val === PlaybackTypes.MSE || val === PlaybackTypes.NATIVE)
      return val;
    return void 0;
  }
  set preferPlayback(val) {
    if (val === this.preferPlayback)
      return;
    if (val === PlaybackTypes.MSE || val === PlaybackTypes.NATIVE) {
      this.setAttribute(MuxVideoAttributes.PREFER_PLAYBACK, val);
    } else {
      this.removeAttribute(MuxVideoAttributes.PREFER_PLAYBACK);
    }
  }
  get metadata() {
    var _a;
    return (_a = this.media) == null ? void 0 : _a.metadata;
  }
  set metadata(val) {
    __privateMethod(this, _init, init_fn).call(this);
    if (!this.media) {
      error(
        "underlying media element missing when trying to set metadata. metadata will not be set."
      );
      return;
    }
    this.media.metadata = { ...getMetadataFromAttrs(this), ...val };
  }
  async addCuePoints(cuePoints) {
    var _a;
    __privateMethod(this, _init, init_fn).call(this);
    if (!this.media) {
      error(
        "underlying media element missing when trying to addCuePoints. cuePoints will not be added."
      );
      return;
    }
    return (_a = this.media) == null ? void 0 : _a.addCuePoints(cuePoints);
  }
  get activeCuePoint() {
    var _a;
    return (_a = this.media) == null ? void 0 : _a.activeCuePoint;
  }
  get cuePoints() {
    var _a, _b;
    return (_b = (_a = this.media) == null ? void 0 : _a.cuePoints) != null ? _b : [];
  }
  getStartDate() {
    var _a;
    return (_a = this.media) == null ? void 0 : _a.getStartDate();
  }
  get currentPdt() {
    var _a;
    return (_a = this.media) == null ? void 0 : _a.currentPdt;
  }
  get tokens() {
    const playback = this.getAttribute(PlayerAttributes.PLAYBACK_TOKEN);
    const thumbnail = this.getAttribute(PlayerAttributes.THUMBNAIL_TOKEN);
    const storyboard = this.getAttribute(PlayerAttributes.STORYBOARD_TOKEN);
    return {
      ...__privateGet(this, _tokens2),
      ...playback != null ? { playback } : {},
      ...thumbnail != null ? { thumbnail } : {},
      ...storyboard != null ? { storyboard } : {}
    };
  }
  set tokens(val) {
    __privateSet(this, _tokens2, val != null ? val : {});
  }
  get playbackToken() {
    var _a;
    return (_a = this.getAttribute(PlayerAttributes.PLAYBACK_TOKEN)) != null ? _a : void 0;
  }
  set playbackToken(val) {
    this.setAttribute(PlayerAttributes.PLAYBACK_TOKEN, `${val}`);
  }
  get thumbnailToken() {
    var _a;
    return (_a = this.getAttribute(PlayerAttributes.THUMBNAIL_TOKEN)) != null ? _a : void 0;
  }
  set thumbnailToken(val) {
    this.setAttribute(PlayerAttributes.THUMBNAIL_TOKEN, `${val}`);
  }
  get storyboardToken() {
    var _a;
    return (_a = this.getAttribute(PlayerAttributes.STORYBOARD_TOKEN)) != null ? _a : void 0;
  }
  set storyboardToken(val) {
    this.setAttribute(PlayerAttributes.STORYBOARD_TOKEN, `${val}`);
  }
  addTextTrack(kind, label, lang, id) {
    var _a;
    const mediaEl = (_a = this.media) == null ? void 0 : _a.nativeEl;
    if (!mediaEl)
      return;
    return addTextTrack(mediaEl, kind, label, lang, id);
  }
  removeTextTrack(track) {
    var _a;
    const mediaEl = (_a = this.media) == null ? void 0 : _a.nativeEl;
    if (!mediaEl)
      return;
    return removeTextTrack(mediaEl, track);
  }
  get textTracks() {
    var _a;
    return (_a = this.media) == null ? void 0 : _a.textTracks;
  }
};
_isInit = new WeakMap();
_tokens2 = new WeakMap();
_userInactive = new WeakMap();
_hotkeys = new WeakMap();
_state = new WeakMap();
_init = new WeakSet();
init_fn = function() {
  var _a, _b, _c;
  if (__privateGet(this, _isInit))
    return;
  __privateSet(this, _isInit, true);
  __privateMethod(this, _render2, render_fn2).call(this);
  try {
    customElements.upgrade(this.mediaTheme);
    if (!(this.mediaTheme instanceof internalGlobalThis.HTMLElement))
      throw "";
  } catch (error2) {
    error(`<media-theme> failed to upgrade!`);
  }
  try {
    customElements.upgrade(this.media);
    if (!(this.media instanceof MuxVideoElement))
      throw "";
  } catch (error2) {
    error("<mux-video> failed to upgrade!");
  }
  try {
    customElements.upgrade(this.mediaController);
    if (!(this.mediaController instanceof MediaController))
      throw "";
  } catch (error2) {
    error(`<media-controller> failed to upgrade!`);
  }
  initVideoApi(this);
  __privateMethod(this, _setUpThemeAttributes, setUpThemeAttributes_fn).call(this);
  __privateMethod(this, _setUpErrors, setUpErrors_fn).call(this);
  __privateMethod(this, _setUpCaptionsButton, setUpCaptionsButton_fn).call(this);
  __privateSet(this, _userInactive, (_b = (_a = this.mediaController) == null ? void 0 : _a.hasAttribute("user-inactive")) != null ? _b : true);
  __privateMethod(this, _setUpCaptionsMovement, setUpCaptionsMovement_fn).call(this);
  (_c = this.media) == null ? void 0 : _c.addEventListener("streamtypechange", () => {
    __privateMethod(this, _render2, render_fn2).call(this);
  });
};
_setupCSSProperties = new WeakSet();
setupCSSProperties_fn = function() {
  var _a, _b;
  try {
    (_a = window == null ? void 0 : window.CSS) == null ? void 0 : _a.registerProperty({
      name: "--media-primary-color",
      syntax: "<color>",
      inherits: true
    });
    (_b = window == null ? void 0 : window.CSS) == null ? void 0 : _b.registerProperty({
      name: "--media-secondary-color",
      syntax: "<color>",
      inherits: true
    });
  } catch (e) {
  }
};
_setState = new WeakSet();
setState_fn = function(newState) {
  Object.assign(__privateGet(this, _state), newState);
  __privateMethod(this, _render2, render_fn2).call(this);
};
_render2 = new WeakSet();
render_fn2 = function(props = {}) {
  render(
    template4(getProps(this, { ...__privateGet(this, _state), ...props })),
    this.shadowRoot
  );
};
_setUpThemeAttributes = new WeakSet();
setUpThemeAttributes_fn = function() {
  const setThemeAttribute = (attributeName) => {
    var _a, _b;
    if (!(attributeName == null ? void 0 : attributeName.startsWith("theme-")))
      return;
    const themeAttrName = attributeName.replace(/^theme-/, "");
    if (ThemeAttributeNames.includes(themeAttrName))
      return;
    const value = this.getAttribute(attributeName);
    if (value != null) {
      (_a = this.mediaTheme) == null ? void 0 : _a.setAttribute(themeAttrName, value);
    } else {
      (_b = this.mediaTheme) == null ? void 0 : _b.removeAttribute(themeAttrName);
    }
  };
  const observer = new MutationObserver((mutationList) => {
    for (const { attributeName } of mutationList) {
      setThemeAttribute(attributeName);
    }
  });
  observer.observe(this, { attributes: true });
  this.getAttributeNames().forEach(setThemeAttribute);
};
_setUpErrors = new WeakSet();
setUpErrors_fn = function() {
  var _a;
  const onError = (event) => {
    let { detail: error2 } = event;
    if (!(error2 instanceof MediaError2)) {
      error2 = new MediaError2(error2.message, error2.code, error2.fatal);
    }
    if (!(error2 == null ? void 0 : error2.fatal)) {
      warn(error2);
      if (error2.data) {
        warn(`${error2.name} data:`, error2.data);
      }
      return;
    }
    const { dialog, devlog: devlog2 } = getErrorLogs(
      error2,
      !window.navigator.onLine,
      this.playbackId,
      this.playbackToken
    );
    if (devlog2.message) {
      devlog(devlog2);
    }
    error(error2);
    if (error2.data) {
      error(`${error2.name} data:`, error2.data);
    }
    __privateMethod(this, _setState, setState_fn).call(this, { isDialogOpen: true, dialog });
  };
  this.addEventListener("error", onError);
  if (this.media) {
    this.media.errorTranslator = (errorEvent = {}) => {
      var _a2, _b, _c;
      if (!(((_a2 = this.media) == null ? void 0 : _a2.error) instanceof MediaError2))
        return errorEvent;
      const { devlog: devlog2 } = getErrorLogs(
        (_b = this.media) == null ? void 0 : _b.error,
        !window.navigator.onLine,
        this.playbackId,
        this.playbackToken,
        false
      );
      return {
        player_error_code: (_c = this.media) == null ? void 0 : _c.error.code,
        player_error_message: devlog2.message ? String(devlog2.message) : errorEvent.player_error_message,
        player_error_context: devlog2.context ? String(devlog2.context) : errorEvent.player_error_context
      };
    };
  }
  (_a = this.media) == null ? void 0 : _a.addEventListener("error", (event) => {
    var _a2, _b;
    let { detail: error2 } = event;
    if (!error2) {
      const { message, code: code2 } = (_b = (_a2 = this.media) == null ? void 0 : _a2.error) != null ? _b : {};
      error2 = new MediaError2(message, code2);
    }
    if (!(error2 == null ? void 0 : error2.fatal))
      return;
    this.dispatchEvent(
      new CustomEvent("error", {
        detail: error2
      })
    );
  });
};
_setUpCaptionsButton = new WeakSet();
setUpCaptionsButton_fn = function() {
  var _a, _b, _c, _d;
  const onTrackCountChange = () => __privateMethod(this, _render2, render_fn2).call(this);
  (_b = (_a = this.media) == null ? void 0 : _a.textTracks) == null ? void 0 : _b.addEventListener("addtrack", onTrackCountChange);
  (_d = (_c = this.media) == null ? void 0 : _c.textTracks) == null ? void 0 : _d.addEventListener("removetrack", onTrackCountChange);
};
_setUpCaptionsMovement = new WeakSet();
setUpCaptionsMovement_fn = function() {
  var _a, _b;
  const isSafari = /.*Version\/.*Safari\/.*/.test(navigator.userAgent);
  const isFirefox = /Firefox/i.test(navigator.userAgent);
  if (!isFirefox)
    return;
  let selectedTrack;
  const cuesmap = /* @__PURE__ */ new WeakMap();
  const shouldSkipLineToggle = () => {
    return this.streamType === StreamTypes3.LIVE && !this.secondaryColor && this.offsetWidth >= 800;
  };
  const toggleLines = (track, userInactive, force = false) => {
    if (shouldSkipLineToggle()) {
      return;
    }
    const cues = Array.from(track && track.activeCues || []);
    cues.forEach((cue) => {
      if (!cue.snapToLines || cue.line < -5 || cue.line >= 0 && cue.line < 10) {
        return;
      }
      if (!userInactive || this.paused) {
        const lines = cue.text.split("\n").length;
        let offset = isSafari ? -2 : -3;
        if (this.streamType === StreamTypes3.LIVE) {
          offset = isSafari ? -1 : -2;
        }
        const setTo = offset - lines;
        if (cue.line === setTo && !force) {
          return;
        }
        if (!cuesmap.has(cue)) {
          cuesmap.set(cue, cue.line);
        }
        cue.line = setTo - 1;
        cue.line = setTo;
      } else {
        setTimeout(() => {
          cue.line = cuesmap.get(cue) || "auto";
        }, 500);
      }
    });
  };
  const cuechangeHandler = () => {
    var _a2, _b2;
    toggleLines(
      selectedTrack,
      (_b2 = (_a2 = this.mediaController) == null ? void 0 : _a2.hasAttribute("user-inactive")) != null ? _b2 : false
    );
  };
  const selectTrack = () => {
    var _a2, _b2;
    const tracks = Array.from(
      ((_b2 = (_a2 = this.mediaController) == null ? void 0 : _a2.media) == null ? void 0 : _b2.textTracks) || []
    );
    const newSelectedTrack = tracks.filter(
      (t) => ["subtitles", "captions"].includes(t.kind) && t.mode === "showing"
    )[0];
    if (newSelectedTrack !== selectedTrack) {
      selectedTrack == null ? void 0 : selectedTrack.removeEventListener("cuechange", cuechangeHandler);
    }
    selectedTrack = newSelectedTrack;
    selectedTrack == null ? void 0 : selectedTrack.addEventListener("cuechange", cuechangeHandler);
    toggleLines(selectedTrack, __privateGet(this, _userInactive));
  };
  selectTrack();
  (_a = this.textTracks) == null ? void 0 : _a.addEventListener("change", selectTrack);
  (_b = this.textTracks) == null ? void 0 : _b.addEventListener("addtrack", selectTrack);
  if (navigator.userAgent.includes("Chrome/")) {
    const chromeWorkaround = () => {
      toggleLines(selectedTrack, __privateGet(this, _userInactive), true);
      if (!this.paused) {
        window.requestAnimationFrame(chromeWorkaround);
      }
    };
    this.addEventListener("playing", () => {
      chromeWorkaround();
    });
  }
  this.addEventListener("userinactivechange", () => {
    var _a2, _b2;
    const newUserInactive = (_b2 = (_a2 = this.mediaController) == null ? void 0 : _a2.hasAttribute("user-inactive")) != null ? _b2 : true;
    if (__privateGet(this, _userInactive) === newUserInactive) {
      return;
    }
    __privateSet(this, _userInactive, newUserInactive);
    toggleLines(selectedTrack, __privateGet(this, _userInactive));
  });
};
function getVideoAttribute2(el, name) {
  return el.media ? el.media.getAttribute(name) : el.getAttribute(name);
}
if (!internalGlobalThis.customElements.get("mux-player")) {
  internalGlobalThis.customElements.define("mux-player", MuxPlayerElement);
  internalGlobalThis.MuxPlayerElement = MuxPlayerElement;
}
var src_default = MuxPlayerElement;
export {
  MediaError2 as MediaError,
  src_default as default,
  getVideoAttribute2 as getVideoAttribute
};
