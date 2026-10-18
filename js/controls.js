/**
 * Big Bad Chicken - Mobile Touch Joystick & Desktop Keyboard/Mouse Controls
 */

export class InputController {
  constructor() {
    this.moveVector = { x: 0, y: 0 };
    this.isDashing = false;
    this.isMoving = false;
    this.pausePressed = false;
    
    // Desktop keyboard state
    this.keys = {};
    
    // Mouse state
    this.isMouseDown = false;
    this.mouseTarget = null;
    
    // Mobile Virtual Joystick state
    this.joystickActive = false;
    this.joystickTouchId = null;
    this.joystickCenter = { x: 0, y: 0 };
    this.joystickCurrent = { x: 0, y: 0 };
    this.joystickRadius = 55; // max pull distance in px
    
    // DOM Elements
    this.canvas = null;
    this.joystickBaseEl = null;
    this.joystickThumbEl = null;
    this.dashBtnEl = null;
    
    this.init();
  }

  init() {
    this.setupKeyboard();
    this.setupMouse();
  }

  bindUIElements(canvas, joystickBase, joystickThumb, dashBtn) {
    this.canvas = canvas;
    this.joystickBaseEl = joystickBase;
    this.joystickThumbEl = joystickThumb;
    this.dashBtnEl = dashBtn;

    this.setupTouch();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        this.isDashing = true;
        e.preventDefault();
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.pausePressed = true;
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') {
        this.isDashing = false;
      }
    });

    window.addEventListener('blur', () => {
      this.keys = {};
      this.isDashing = false;
      this.resetJoystick();
    });
  }

  setupMouse() {
    window.addEventListener('mousedown', (e) => {
      if (e.target && e.target.closest && e.target.closest('.interactive-ui')) {
        return;
      }
      if (e.button === 0) {
        this.isMouseDown = true;
        this.mouseTarget = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isMouseDown) {
        this.mouseTarget = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isMouseDown = false;
        this.mouseTarget = null;
      }
    });
  }

  setupTouch() {
    if (!this.canvas) return;

    // Canvas Touch for Virtual Joystick
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    window.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });

    // Dash button touch events
    if (this.dashBtnEl) {
      const startDash = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isDashing = true;
        this.dashBtnEl.classList.add('active');
        this.haptic(25);
      };
      const endDash = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isDashing = false;
        this.dashBtnEl.classList.remove('active');
      };

      this.dashBtnEl.addEventListener('touchstart', startDash, { passive: false });
      this.dashBtnEl.addEventListener('touchend', endDash, { passive: false });
      this.dashBtnEl.addEventListener('touchcancel', endDash, { passive: false });
      this.dashBtnEl.addEventListener('mousedown', startDash);
      this.dashBtnEl.addEventListener('mouseup', endDash);
    }
  }

  handleTouchStart(e) {
    // If joystick is already active with a touch, check if other touches hit dash or UI
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (e.target && e.target.closest && e.target.closest('.interactive-ui')) {
        continue;
      }

      if (!this.joystickActive) {
        e.preventDefault();
        this.joystickActive = true;
        this.joystickTouchId = touch.identifier;
        this.joystickCenter = { x: touch.clientX, y: touch.clientY };
        this.joystickCurrent = { x: touch.clientX, y: touch.clientY };

        this.showJoystickUI(touch.clientX, touch.clientY);
        break;
      }
    }
  }

  handleTouchMove(e) {
    if (!this.joystickActive) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.joystickTouchId) {
        e.preventDefault();
        this.joystickCurrent = { x: touch.clientX, y: touch.clientY };
        this.updateJoystickUI();
        break;
      }
    }
  }

  handleTouchEnd(e) {
    if (!this.joystickActive) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.joystickTouchId) {
        e.preventDefault();
        this.resetJoystick();
        break;
      }
    }
  }

  showJoystickUI(x, y) {
    if (!this.joystickBaseEl || !this.joystickThumbEl) return;
    this.joystickBaseEl.style.left = `${x}px`;
    this.joystickBaseEl.style.top = `${y}px`;
    this.joystickBaseEl.style.display = 'block';

    this.joystickThumbEl.style.transform = `translate(0px, 0px)`;
  }

  updateJoystickUI() {
    if (!this.joystickBaseEl || !this.joystickThumbEl) return;

    const dx = this.joystickCurrent.x - this.joystickCenter.x;
    const dy = this.joystickCurrent.y - this.joystickCenter.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) {
      this.joystickThumbEl.style.transform = `translate(0px, 0px)`;
      return;
    }

    const clampedDist = Math.min(dist, this.joystickRadius);
    const angle = Math.atan2(dy, dx);
    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    this.joystickThumbEl.style.transform = `translate(${thumbX}px, ${thumbY}px)`;
  }

  resetJoystick() {
    this.joystickActive = false;
    this.joystickTouchId = null;
    this.moveVector = { x: 0, y: 0 };
    this.isMoving = false;
    if (this.joystickBaseEl) {
      this.joystickBaseEl.style.display = 'none';
    }
  }

  /**
   * Called each frame with screen center and player position to calculate directional vector
   */
  update(screenCenterX, screenCenterY) {
    let vx = 0;
    let vy = 0;

    // 1. Virtual Joystick input
    if (this.joystickActive) {
      const dx = this.joystickCurrent.x - this.joystickCenter.x;
      const dy = this.joystickCurrent.y - this.joystickCenter.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 8) {
        const factor = Math.min(1, dist / this.joystickRadius);
        vx = (dx / dist) * factor;
        vy = (dy / dist) * factor;
      }
    }

    // 2. Keyboard (WASD / Arrows)
    if (this.keys['KeyW'] || this.keys['ArrowUp']) vy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) vy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) vx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) vx += 1;

    // 3. Mouse target (if mouse button down)
    if (this.isMouseDown && this.mouseTarget && !this.joystickActive) {
      const mdx = this.mouseTarget.x - screenCenterX;
      const mdy = this.mouseTarget.y - screenCenterY;
      const mdist = Math.hypot(mdx, mdy);
      if (mdist > 15) {
        const norm = Math.min(1, mdist / 140);
        vx = (mdx / mdist) * norm;
        vy = (mdy / mdist) * norm;
      }
    }

    // Normalize diagonal keyboard speed
    const mag = Math.hypot(vx, vy);
    if (mag > 1) {
      vx /= mag;
      vy /= mag;
    }

    this.moveVector.x = vx;
    this.moveVector.y = vy;
    this.isMoving = mag > 0.08;
  }

  consumePause() {
    const p = this.pausePressed;
    this.pausePressed = false;
    return p;
  }

  haptic(ms = 30) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  }
}
