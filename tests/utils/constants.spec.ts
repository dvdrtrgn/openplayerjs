import '@testing-library/jest-dom';
import * as constants from 'utils/constants';

describe('utils > constants', () => {
    beforeAll(() => {
        // Mock the MediaSource element to pass validations
        Object.defineProperty(window, 'MediaSource', {
            writable: true,
            value: jest.fn().mockImplementation(() => ({
                addEventListener: jest.fn(),
            })),
        });
    });

    // test('must check if browser can support HLS accordingly in Chrome', () => {
    //     expect(constants.SUPPORTS_HLS()).toEqual(true);
    // });

    // test('must check if browser is Chrome', () => {
    //     expect(constants.IS_ANDROID).toEqual(false);
    //     expect(constants.IS_CHROME).toEqual(true);
    //     expect(constants.IS_EDGE).toEqual(false);
    //     expect(constants.IS_FIREFOX).toEqual(false);
    //     expect(constants.IS_SAFARI).toEqual(false);
    //     expect(constants.IS_STOCK_ANDROID).toEqual(false);
    // });

    test('must check if browser is in iOS', () => {
        expect(constants.IS_IOS).toEqual(false);
        expect(constants.IS_IPAD).toEqual(false);
        expect(constants.IS_IPOD).toEqual(false);
        expect(constants.IS_IPHONE).toEqual(false);
    });

    // test('must check if browser has MSE support', () => {
    //     expect(constants.HAS_MSE).toEqual(true);
    // });

    test('must check if browser has support for passive events', () => {
        expect(constants.EVENT_OPTIONS).toEqual({ passive: false });
    });
});
