/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventsList, Level, Source } from 'interfaces';
import { HAS_MSE } from 'utils/constants';
import { addEvent, loadScript } from 'utils/general';
import { getMediaFiles, isFlvSource } from 'utils/media';
import Native from './native';

declare const flvjs: any;

class FlvMedia extends Native {
    #player: any;

    // @see https://github.com/video-dev/hls.js/blob/master/src/events.js
    #events: EventsList = {};

    // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md
    #options?: unknown = {};

    constructor(element: HTMLMediaElement, media?: Source, options?: unknown) {
        super(element, media);
        this.#options = options;
        this.element = element;

        this._preparePlayer = this._preparePlayer.bind(this);
        this._assign = this._assign.bind(this);
        return this;
    }

    canPlayType(mimeType: string): boolean {
        return HAS_MSE() && (mimeType === 'video/x-flv' || mimeType === 'video/flv');
    }

    async load(): Promise<void> {
        if (!this.#player) {
            await this._preparePlayer();
        }
        this.#player.unload();
        this.#player.detachMediaElement();
        this.#player.attachMediaElement(this.element);
        this.#player.load();

        const e = addEvent('loadedmetadata');
        this.element.dispatchEvent(e);

        if (!this.#events) {
            this.#events = flvjs.Events;
            Object.keys(this.#events).forEach((event) => {
                this.#player.on(this.#events[event], (...args: Record<string, unknown>[]) =>
                    this._assign(this.#events[event], args)
                );
            });
        }
    }

    destroy(): void {
        this.#player.destroy();
        this.#player = null;
    }

    set src(media: Source) {
        if (isFlvSource(media)) {
            this.destroy();
            this._preparePlayer();
        }
    }

    get levels(): Level[] {
        const levels: Level[] = [];
        if (this.#player && this.#player.levels && this.#player.levels.length) {
            Object.keys(this.#player.levels).forEach((item) => {
                const { height, name } = this.#player.levels[item];
                const level = {
                    height,
                    id: item,
                    label: name || null,
                };
                levels.push(level);
            });
        }
        return levels;
    }

    set level(level: number) {
        this.#player.currentLevel = level;
    }

    get level(): number {
        return this.#player ? this.#player.currentLevel : -1;
    }

    private async _preparePlayer(): Promise<void> {
        if (typeof window !== 'undefined' && typeof (window as any).flvjs === 'undefined') {
            await loadScript('https://cdn.jsdelivr.net/npm/flv.js@latest/dist/flv.min.js');
        }
        const { configs, ...rest } = (this.#options as Record<string, unknown>) || {};

        flvjs.LoggingControl.enableDebug = rest?.debug || false;
        flvjs.LoggingControl.enableVerbose = rest?.debug || false;

        const sources = getMediaFiles(this.element);
        const url = this.media?.src || sources[0].src;
        const options = { ...rest, type: 'flv', url };
        this.#player = flvjs.createPlayer(options, configs || {});
        this.instance = this.#player;

        if (!this.#events) {
            this.#events = flvjs.Events;
            Object.keys(this.#events).forEach((event) => {
                this.#player.on(this.#events[event], (...args: Record<string, unknown>[]) =>
                    this._assign(this.#events[event], args)
                );
            });
        }
    }

    // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjsevents
    // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjserrortypes
    // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjserrordetails
    private _assign(event: string, data: Record<string, unknown>[]): void {
        if (event === 'error') {
            const errorDetails = {
                detail: {
                    data,
                    message: `${data[0]}: ${data[1]} ${data[2].msg}`,
                    type: 'FLV',
                },
            };
            const errorEvent = addEvent('playererror', errorDetails);
            this.element.dispatchEvent(errorEvent);
        } else {
            const e = addEvent(event, { detail: { data } });
            this.element.dispatchEvent(e);
        }
    }
}

export default FlvMedia;
