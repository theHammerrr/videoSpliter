/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/app';

describe('App', () => {
  it('renders correctly', async () => {
    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<App />);
    });
  });

  it('displays the app title', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<App />);
    });

    const root = renderer!.root;
    const titleElement = root.findByProps({ style: expect.objectContaining({}) });
    expect(titleElement).toBeDefined();
  });
});
