import { StreamTypes } from '@mux/playback-core';
import type { ValueOf } from '@mux/playback-core';
export declare const getPlayerVersion: () => any;
export declare const getSrcFromPlaybackId: (playbackId?: string, { maxResolution, token, domain }?: {
    maxResolution?: string | undefined;
    token?: string | undefined;
    domain?: string | undefined;
}) => string;
export declare const getPosterURLFromPlaybackId: (playbackId?: string, { token, thumbnailTime, domain }?: {
    token?: string | undefined;
    domain?: string | undefined;
    thumbnailTime?: number | undefined;
}) => string | undefined;
export declare const getStoryboardURLFromPlaybackId: (playbackId?: string, { token, domain }?: {
    token?: string | undefined;
    domain?: string | undefined;
}) => string | undefined;
export declare const getStreamTypeFromAttr: (streamTypeAttr: string | null | undefined) => ValueOf<StreamTypes> | undefined;
export declare function castThemeName(themeName?: string): string | undefined;
export declare function toPropName(attrName: string): string;
export declare class AttributeTokenList implements Iterable<string> {
    #private;
    constructor(el?: HTMLElement, attr?: string);
    [Symbol.iterator](): IterableIterator<string>;
    get length(): number;
    get value(): string | undefined;
    set value(val: string | undefined);
    toString(): string | undefined;
    item(index: number): string;
    values(): IterableIterator<string>;
    keys(): IterableIterator<number>;
    forEach(callback: (value: string, index: number, list: string[]) => void): void;
    add(...tokens: string[]): void;
    remove(...tokens: string[]): void;
    contains(token: string): boolean;
    toggle(token: string, force: boolean): boolean;
    replace(oldToken: string, newToken: string): void;
}
