import React from 'react';
import PropTypes from 'prop-types';

import style from 'PVWStyle/ReactWidgets/ColorPickerWidget.mcss';

import swatchURL from './defaultSwatches.png';

/**
 * This React component expect the following input properties:
 *   - color:
 *       Expect an array [r,g,b] of the initial color to show.
 *       Default value is [0,0,0].
 *       Each color channel must be a number between 0 and 1.
 *   - onChange:
 *       Expect a callback function which will receive a color array [r, g, b]
 *       as argument each time the user pick a different color.
 *   - swatch:
 *       Image URL that should be used for color picking.
 *       Default value is a base64 encoded swatch.
 */
export default class ColorPickerWidget extends React.Component {
  constructor(props) {
    super(props);

    this.image = new Image();
    this.image.src = props.swatch;
    this.state = {
      swatch: props.swatch,
      color: props.color,
      preview: false,
      originalColor: [props.color[0], props.color[1], props.color[2]],
    };

    // Bind callback
    this.showColor = this.showColor.bind(this);
    this.rgbColorChange = this.rgbColorChange.bind(this);
    this.updateColor = this.updateColor.bind(this);
    this.updateSwatch = this.updateSwatch.bind(this);
  }

  componentDidMount() {
    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = `rgb(${this.state.originalColor.join(',')})`;
    ctx.fillRect(0, 0, 1, 1);
  }

  // FIXME need to do that properly if possible?
  /* eslint-disable react/no-did-update-set-state */
  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.color[0] !== this.props.color[0] ||
      prevProps.color[1] !== this.props.color[1] ||
      prevProps.color[2] !== this.props.color[2]
    ) {
      this.setState({ originalColor: this.props.color });
    }
    if (!this.state.preview) {
      const ctx = this.canvas.getContext('2d');
      ctx.fillStyle = `rgb(${this.state.originalColor.join(',')})`;
      ctx.fillRect(0, 0, 1, 1);
    }
  }
  /* eslint-enable react/no-did-update-set-state */

  showColor(event) {
    let color = this.state.originalColor;
    const ctx = this.canvas.getContext('2d');
    event.preventDefault();

    if (event.type === 'mouseleave') {
      ctx.fillStyle = `rgb(${color.join(',')})`;
      ctx.fillRect(0, 0, 1, 1);

      this.setState({ color: [color[0], color[1], color[2]], preview: false });

      return;
    }

    const img = this.swatch;
    const rect = img.getBoundingClientRect();

    const scale = this.image.width / rect.width;
    const x = scale * (event.pageX - rect.left);
    const y = scale * (event.pageY - rect.top);

    ctx.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);

    // Update state base on the event type
    color = ctx.getImageData(0, 0, 1, 1).data;

    if (event.type === 'click') {
      this.setState({ color: [color[0], color[1], color[2]], preview: false });
      if (this.props.onChange) {
        this.props.onChange(color);
      }
    } else {
      this.setState({ color: [color[0], color[1], color[2]], preview: true });
    }
  }

  rgbColorChange(event) {
    const color = this.state.color;
    const value = event.target.value;
    const idx = Number(event.target.dataset.colorIdx);

    color[idx] = value;

    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = `rgb(${color.join(',')})`;
    ctx.fillRect(0, 0, 1, 1);

    this.setState({ color: [color[0], color[1], color[2]], preview: false });

    if (this.props.onChange) {
      this.props.onChange(color);
    }
  }

  updateColor(color) {
    this.setState({ originalColor: color });
  }

  updateSwatch(url) {
    this.image.src = url;
    this.setState({ swatch: url });
  }

  render() {
    return (
      <div className={style.container}>
        <div className={style.activeColor}>
          <canvas
            className={style.colorCanvas}
            ref={(c) => {
              this.canvas = c;
            }}
            width="1"
            height="1"
          />
          <input
            className={style.colorRGB}
            type="number"
            min="0"
            max="255"
            value={this.state.color[0]}
            data-color-idx="0"
            onChange={this.rgbColorChange}
          />
          <input
            className={style.colorRGB}
            type="number"
            min="0"
            max="255"
            value={this.state.color[1]}
            data-color-idx="1"
            onChange={this.rgbColorChange}
          />
          <input
            className={style.colorRGB}
            type="number"
            min="0"
            max="255"
            value={this.state.color[2]}
            data-color-idx="2"
            onChange={this.rgbColorChange}
          />
        </div>
        <div className={style.swatch}>
          <img
            alt="swatch"
            ref={(c) => {
              this.swatch = c;
            }}
            className={style.swatchImage}
            width="100%"
            src={this.state.swatch}
            onClick={this.showColor}
            onMouseMove={this.showColor}
            onMouseLeave={this.showColor}
          />
        </div>
      </div>
    );
  }
}

ColorPickerWidget.propTypes = {
  color: PropTypes.array,
  onChange: PropTypes.func,
  swatch: PropTypes.string,
};

ColorPickerWidget.defaultProps = {
  color: [0, 0, 0],
  swatch: swatchURL,
  onChange: undefined,
};
