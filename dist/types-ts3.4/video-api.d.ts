import { globalThis } from './polyfills';
import MuxVideoElement from '@mux/mux-video';
export type CastOptions = {
    receiverApplicationId: string;
    autoJoinPolicy: string;
    androidReceiverCompatible: boolean;
    language: string;
    resumeSavedSession: boolean;
};
export type MuxVideoElementExt = MuxVideoElement & {
    requestCast(options: CastOptions): Promise<undefined>;
};
/**
 * Gets called from mux-player when mux-video is rendered and upgraded.
 * We might just merge VideoApiElement in MuxPlayerElement and remove this?
 */
export declare function initVideoApi(el: VideoApiElement): void;
type PartialHTMLVideoElement = Pick<HTMLVideoElement, Exclude<keyof HTMLVideoElement, 'disablePictureInPicture' | 'height' | 'width' | 'error' | 'seeking' | 'onenterpictureinpicture' | 'onleavepictureinpicture' | 'load' | 'cancelVideoFrameCallback' | 'getVideoPlaybackQuality' | 'requestPictureInPicture' | 'requestVideoFrameCallback' | 'controls' | 'currentSrc' | 'disableRemotePlayback' | 'mediaKeys' | 'networkState' | 'onencrypted' | 'onwaitingforkey' | 'played' | 'remote' | 'srcObject' | 'textTracks' | 'addTextTrack' | 'canPlayType' | 'fastSeek' | 'setMediaKeys' | 'HAVE_CURRENT_DATA' | 'HAVE_ENOUGH_DATA' | 'HAVE_FUTURE_DATA' | 'HAVE_METADATA' | 'HAVE_NOTHING' | 'NETWORK_EMPTY' | 'NETWORK_IDLE' | 'NETWORK_LOADING' | 'NETWORK_NO_SOURCE' | 'src' | 'poster' | 'mux'>>;
interface VideoApiElement extends PartialHTMLVideoElement, HTMLElement {
    addEventListener<K extends keyof HTMLVideoElementEventMap>(type: K, listener: (this: HTMLVideoElement, ev: HTMLVideoElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof HTMLVideoElementEventMap>(type: K, listener: (this: HTMLVideoElement, ev: HTMLVideoElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
declare class VideoApiElement extends globalThis.HTMLElement implements VideoApiElement {
    static readonly observedAttributes: string[];
    /**
     * Create a HTMLVideoElement like API with opt-in methods to expose publicly.
     * This class is intentionally not extending MuxVideoElement but composing it
     * to opt in methods and not expose too much. More flexibility in the future.
     */
    constructor();
    attributeChangedCallback(attrName: string, oldValue: string | null, newValue: string): void;
    play(): Promise<void>;
    pause(): void;
    requestCast(options: CastOptions): Promise<undefined> | undefined;
    readonly media: MuxVideoElementExt | null | undefined;
    readonly paused: boolean;
    readonly duration: number;
    readonly ended: boolean;
    readonly buffered: TimeRanges;
    readonly seekable: TimeRanges;
    readonly readyState: number;
    readonly videoWidth: number;
    readonly videoHeight: number;
    currentTime: number;
    volume: number;
    playbackRate: number;
    defaultPlaybackRate: number;
    crossOrigin: string | null;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    defaultMuted: boolean;
    playsInline: boolean;
    preload: "" | "metadata" | "none" | "auto";
}
export default VideoApiElement;
