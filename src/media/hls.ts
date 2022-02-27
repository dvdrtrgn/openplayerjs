/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventsList, Level, Source } from 'interfaces';
import { DVR_THRESHOLD, EVENT_OPTIONS, SUPPORTS_HLS } from 'utils/constants';
import { addEvent, loadScript } from 'utils/general';
import { getMediaFiles, isHlsSource } from 'utils/media';
import Native from './native';

declare const Hls: any;

// @see https://github.com/video-dev/hls.js/
class HlsMedia extends Native {
    #player: any;

    // @see https://github.com/video-dev/hls.js/blob/master/src/events.js
    #events: EventsList = {};

    #recoverDecodingErrorDate = 0;

    #recoverSwapAudioCodecDate = 0;

    // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning
    #options?: unknown;

    constructor(element: HTMLMediaElement, media?: Source, options?: unknown) {
        super(element, media);
        this.#options = options || {};
        this.element = element;

        this._preparePlayer = this._preparePlayer.bind(this);
        this._play = this._play.bind(this);
        this._pause = this._pause.bind(this);
        this._assign = this._assign.bind(this);
        return this;
    }

    canPlayType(mimeType: string): boolean {
        return SUPPORTS_HLS() && (mimeType === 'application/x-mpegURL' || mimeType === 'application/vnd.apple.mpegurl');
    }

    load(): void {
        if (!this.#player) {
            this._preparePlayer();
        }
        const sources = getMediaFiles(this.element);
        this.#player.detachMedia();
        this.#player.loadSource(sources[0]);
        this.#player.attachMedia(this.element);

        const e = addEvent('loadedmetadata');
        this.element.dispatchEvent(e);

        if (!this.#events) {
            this.#events = Hls.Events;
            Object.keys(this.#events).forEach((event) => {
                this.#player.on(this.#events[event], (...args: Record<string, unknown>[]) =>
                    this._assign(this.#events[event], args)
                );
            });
        }
    }

    destroy(): void {
        if (this.#player) {
            this.#player.stopLoad();
        }
        if (this.#events) {
            Object.keys(this.#events).forEach((event) => {
                this.#player.off(this.#events[event], (...args: Record<string, unknown>[]) =>
                    this._assign(this.#events[event], args)
                );
            });
        }
        this.element.removeEventListener('play', this._play);
        this.element.removeEventListener('pause', this._pause);
        if (this.#player) {
            this.#player.destroy();
            this.#player = null;
        }
    }

    set src(media: Source) {
        if (isHlsSource(media)) {
            this.destroy();
            this.#player = new Hls(this.#options);
            this.#player.loadSource(media.src);
            this.#player.attachMedia(this.element);

            this.#events = Hls.Events;
            Object.keys(this.#events).forEach((event) => {
                this.#player.on(this.#events[event], (...args: Record<string, unknown>[]) =>
                    this._assign(this.#events[event], args)
                );
            });
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
        if (typeof window !== 'undefined' && typeof (window as any).Hls === 'undefined') {
            await loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js');
        }

        const autoplay = !!(this.element.preload === 'auto' || this.element.autoplay);
        (this.#options as Record<string, unknown>).autoStartLoad = autoplay;

        this.#player = new Hls(this.#options);
        this.instance = this.#player;
        this.#events = Hls.Events;
        Object.keys(this.#events).forEach((event) => {
            this.#player.on(this.#events[event], (...args: Record<string, unknown>[]) =>
                this._assign(this.#events[event], args)
            );
        });

        if (!autoplay) {
            this.element.addEventListener('play', this._play, EVENT_OPTIONS);
            this.element.addEventListener('pause', this._pause, EVENT_OPTIONS);
        }
    }

    // @see https://github.com/video-dev/hls.js/blob/master/src/events.js
    // @see https://github.com/video-dev/hls.js/blob/master/src/errors.js
    // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#runtime-events
    // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#errors
    private _assign(event: string, data: Record<string, unknown>[]): void {
        if (event === 'hlsError') {
            const errorDetails = {
                detail: {
                    data,
                    message: data[1].details,
                    type: 'HLS',
                },
            };
            const errorEvent = addEvent('playererror', errorDetails);
            this.element.dispatchEvent(errorEvent);

            // borrowed from https://hls-js.netlify.app/dist/hls-demo.js
            const type = data[1].type as string;
            const { fatal } = data[1];
            const details = data[1];
            if (fatal) {
                switch (type) {
                    case 'mediaError':
                        const now = new Date().getTime();
                        if (!this.#recoverDecodingErrorDate || now - this.#recoverDecodingErrorDate > 3000) {
                            this.#recoverDecodingErrorDate = new Date().getTime();
                            this.#player.recoverMediaError();
                        } else if (!this.#recoverSwapAudioCodecDate || now - this.#recoverSwapAudioCodecDate > 3000) {
                            this.#recoverSwapAudioCodecDate = new Date().getTime();
                            console.warn('Attempting to swap Audio Codec and recover from media error');
                            this.#player.swapAudioCodec();
                            this.#player.recoverMediaError();
                        } else {
                            const msg = 'Cannot recover, last media error recovery failed';
                            console.error(msg);
                            const mediaEvent = addEvent(type, { detail: { data: details } });
                            this.element.dispatchEvent(mediaEvent);
                        }
                        break;
                    case 'networkError':
                        const message = 'Network error';
                        console.error(message);
                        const networkEvent = addEvent(type, { detail: { data: details } });
                        this.element.dispatchEvent(networkEvent);
                        break;
                    default:
                        this.#player.destroy();
                        const fatalEvent = addEvent(type, { detail: { data: details } });
                        this.element.dispatchEvent(fatalEvent);
                        break;
                }
            } else {
                const err = addEvent(type, { detail: { data: details } });
                this.element.dispatchEvent(err);
            }
        } else {
            const details: Record<string, unknown> = data[1] as Record<string, unknown>;
            if (event === 'hlsLevelLoaded' && details.live === true) {
                this.element.setAttribute('op-live__enabled', 'true');
                const timeEvent = addEvent('timeupdate');
                this.element.dispatchEvent(timeEvent);
            } else if (
                event === 'hlsLevelUpdated' &&
                details.live === true &&
                (details.totalduration as number) > DVR_THRESHOLD
            ) {
                this.element.setAttribute('op-dvr__enabled', 'true');
                const timeEvent = addEvent('timeupdate');
                this.element.dispatchEvent(timeEvent);
            } else if (event === 'hlsFragParsingMetadata') {
                const metaEvent = addEvent('metadataready', { detail: { data: data[1] } });
                this.element.dispatchEvent(metaEvent);
            }
            const e = addEvent(event, { detail: { data: data[1] } });
            this.element.dispatchEvent(e);
        }
    }

    private _play(): void {
        if (this.#player) {
            this.#player.startLoad();
        }
    }

    private _pause(): void {
        if (this.#player) {
            this.#player.stopLoad();
        }
    }
}

export default HlsMedia;
