// can-icon.js - الإصدار النهائي
(() => {
  class CanIcon extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.canvas = document.createElement('canvas');
      this.img = new Image();
      this.img.crossOrigin = "Anonymous";
    }

    connectedCallback() {
      this.render();
    }

    static get observedAttributes() {
      return ['name', 'src', 'size', 'color'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this.render();
      }
    }

    async render() {
      const name = this.getAttribute('name') || '';
      const src = this.getAttribute('src') || '';
      const size = parseInt(this.getAttribute('size')) || 24;
      const color = this.getAttribute('color') || '#000000';

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
            width: ${size}px;
            height: ${size}px;
            position: relative;
          }
          .loading, .error {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${Math.max(10, size/3)}px;
          }
          .loading {
            background: #f5f5f5;
            color: #999;
          }
          .error {
            background: #ffebee;
            color: #f44336;
            display: none;
          }
          canvas {
            width: 100%;
            height: 100%;
            display: none;
          }
        </style>
        <div class="loading">...</div>
        <div class="error">!</div>
        <canvas></canvas>
      `;

      const canvas = this.shadowRoot.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const loadingDiv = this.shadowRoot.querySelector('.loading');
      const errorDiv = this.shadowRoot.querySelector('.error');

      try {
        // حل بديل لمشكلة CORS
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const imgUrl = src.startsWith('http') ? `${proxyUrl}${encodeURIComponent(src)}` : src;

        await new Promise((resolve, reject) => {
          this.img.onload = resolve;
          this.img.onerror = reject;
          this.img.src = imgUrl;
        });

        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(this.img, 0, 0, size, size);
        this.applyColorFilter(ctx, color, size);

        canvas.style.display = 'block';
        loadingDiv.style.display = 'none';
      } catch (error) {
        console.error('Error loading icon:', error);
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'flex';
      }
    }

    applyColorFilter(ctx, color, size) {
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      const hex = color.replace('#', '');
      const targetR = parseInt(hex.substring(0, 2), 16);
      const targetG = parseInt(hex.substring(2, 4), 16);
      const targetB = parseInt(hex.substring(4, 6), 16);

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) {
          const intensity = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = (targetR * intensity) / 255;
          data[i + 1] = (targetG * intensity) / 255;
          data[i + 2] = (targetB * intensity) / 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }
  }

  if (!customElements.get('can-icon')) {
    customElements.define('can-icon', CanIcon);
  }
})();
