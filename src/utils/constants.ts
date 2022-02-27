/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        MSStream: any;
        WebKitMediaSource: any;
        WebKitSourceBuffer: any;
    }

    interface NavigatorExtended extends Navigator {
        msMaxTouchPoints?: number;
        connection: NetworkInformation & { effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' };
        mozConnection?: NetworkInformation & { effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' };
        webkitConnection?: NetworkInformation & { effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' };
    }
}

export const NAV = (): NavigatorExtended | null => (typeof window !== 'undefined' ? window.navigator : null);

export const UA = (): string | null => {
    const nav = NAV();
    return nav?.userAgent?.toLowerCase() || null;
};

// borrowed from https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_device_detection
export const IS_MOBILE = (): boolean => {
    let hasTouchScreen = false;
    const nav = NAV();
    if (nav?.maxTouchPoints) {
        hasTouchScreen = nav.maxTouchPoints > 0;
    } else if (nav?.msMaxTouchPoints) {
        hasTouchScreen = nav.msMaxTouchPoints > 0;
    } else {
        const mQ = typeof window !== 'undefined' && window.matchMedia && matchMedia('(pointer:coarse)');
        if (mQ && mQ.media === '(pointer:coarse)') {
            hasTouchScreen = !!mQ.matches;
        } else if ('orientation' in window) {
            hasTouchScreen = true;
        } else {
            // Only as a last resort, fall back to user agent sniffing
            const ua = UA();
            hasTouchScreen = ua
                ? /\b(BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod)\b/i.test(ua)
                : false;
        }
    }

    return hasTouchScreen;
};

export const IS_IPHONE = (): boolean => {
    const ua = UA();
    return IS_MOBILE() && ua ? /iphone/i.test(ua) && !window.MSStream : false;
};

export const IS_ANDROID = (): boolean => {
    const ua = UA();
    return IS_MOBILE() && ua ? /android/i.test(ua) : false;
};

export const IS_IOS = (): boolean => {
    const ua = UA();
    return IS_MOBILE() && ua ? /iphone|ip(o|a)d/i.test(ua) : false;
};

export const IS_CHROME = (): boolean => {
    const ua = UA();
    return ua ? /chrome/i.test(ua) : false;
};

export const IS_SAFARI = (): boolean => {
    const ua = UA();
    return ua ? /safari/i.test(ua) && !IS_CHROME() : false;
};

export const HAS_MSE = (): boolean => (typeof window !== 'undefined' ? 'MediaSource' in window : false);

// @see https://github.com/video-dev/hls.js/blob/master/src/is-supported.js
export const SUPPORTS_HLS = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }
    const mediaSource = window.MediaSource || window.WebKitMediaSource;
    const sourceBuffer = window.SourceBuffer || window.WebKitSourceBuffer;
    const isTypeSupported =
        mediaSource &&
        typeof mediaSource.isTypeSupported === 'function' &&
        mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');

    const sourceBufferValidAPI =
        !sourceBuffer ||
        (sourceBuffer.prototype &&
            typeof sourceBuffer.prototype.appendBuffer === 'function' &&
            typeof sourceBuffer.prototype.remove === 'function');

    // Safari is still an exception since it has built-in HLS support; currently HLS.js
    // is still in beta to support Safari
    return !!isTypeSupported && !!sourceBufferValidAPI && !IS_SAFARI();
};

export const DVR_THRESHOLD = 120;

export const EVENT_OPTIONS = { passive: false };
