/**
 * Common setup for Jest, improve rendering capabilities of JSDOM
 * and reduces randomness of tests
 *
 * Run for each test to guarantee a clean state
 */

// @see https://github.com/testing-library/jest-dom
// TODO: this library will load @types/jest which in turns lead to issue with Playwright by overriding the "test" object
import "@testing-library/jest-dom";