import '@testing-library/jest-dom';
import * as constants from 'utils/constants';

describe('utils > constants', () => {
    beforeAll(() => {
        // Mock the MediaSource element to pass validations
        Object.defineProperty(window, 'MediaSource', {
            writable: true,
            value: {
                isTypeSupported: () => true,
            },
        });
    });

    test('browser can support HLS accordingly in Chrome', () => {
        // Mock user agent
        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        });

        expect(constants.SUPPORTS_HLS()).toEqual(true);
    });

    test('browser is Chrome', () => {
        // Mock user agent
        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        });

        expect(constants.IS_CHROME()).toEqual(true);
        expect(constants.IS_SAFARI()).toEqual(false);
    });

    test('browser is Safari', () => {
        // Mock user agent
        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Safari/605.1.15',
        });

        expect(constants.IS_CHROME()).toEqual(false);
        expect(constants.IS_SAFARI()).toEqual(true);
    });

    test('browser is on an iPhone (iOS system)', () => {
        // Mock user agent
        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1',
        });

        expect(constants.IS_MOBILE()).toEqual(true);
        expect(constants.IS_IPHONE()).toEqual(true);
    });

    test('must check if browser has MSE support', () => {
        expect(constants.HAS_MSE()).toEqual(true);
    });

    test('must check if browser has support for passive events', () => {
        expect(constants.EVENT_OPTIONS).toEqual({ passive: false });
    });
});
