/**
 * Proofly — Client-Side Keystroke Telemetry Engine (Module 2 / Pillar 3)
 *
 * Captures keystroke dynamics during the AI Defense Challenge to build
 * a behavioral fingerprint that distinguishes genuine practitioners from
 * students reading from a secondary LLM source.
 *
 * Metrics captured:
 *   - Inter-Key Latency (IKL): time between consecutive key presses
 *   - Flight Time: time between key-down and next key-down
 *   - Pause Frequency: ratio of pauses > 2s (thinking) to total intervals
 *   - Burstiness Index: ratio of rapid typing clusters to total typing
 *   - Tab Switch Count: how many times the user left the browser tab
 *   - Paste Attempt Count: how many times the user tried to paste
 *
 * Anti-Cheat Hardening:
 *   - Paste events are blocked and counted
 *   - Tab switches are logged via visibilitychange
 *   - Right-click context menu is disabled during the challenge
 *   - Clipboard API access is blocked
 */

export interface KeystrokeEvent {
  key: string;
  timestamp_ms: number;
  event_type: 'keydown' | 'keyup';
}

export interface TelemetrySnapshot {
  keystroke_events: KeystrokeEvent[];
  tab_switch_count: number;
  paste_attempt_count: number;
  start_time_ms: number;
  end_time_ms: number;
}

export interface TelemetryMetrics {
  mean_ikl_ms: number;
  std_ikl_ms: number;
  burstiness_index: number;
  pause_frequency: number;
  total_keystrokes: number;
  total_time_ms: number;
  tab_switch_count: number;
  paste_attempt_count: number;
}

/**
 * TelemetryRecorder — captures keystroke dynamics for a single question
 *
 * Usage:
 *   const recorder = new TelemetryRecorder();
 *   recorder.start();
 *   // ... user types their answer ...
 *   const snapshot = recorder.stop();
 *   // Send snapshot with the response to the backend
 */
export class TelemetryRecorder {
  private events: KeystrokeEvent[] = [];
  private tabSwitchCount = 0;
  private pasteAttemptCount = 0;
  private startTime = 0;
  private isRecording = false;

  // Bound handlers for cleanup
  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private boundKeyUp: ((e: KeyboardEvent) => void) | null = null;
  private boundPaste: ((e: ClipboardEvent) => void) | null = null;
  private boundVisibility: (() => void) | null = null;
  private boundContextMenu: ((e: Event) => void) | null = null;
  private boundCopy: ((e: ClipboardEvent) => void) | null = null;

  /**
   * Start recording keystroke telemetry.
   * Attaches event listeners for keystrokes, paste, tab switches,
   * and context menu suppression.
   */
  start(): void {
    if (this.isRecording) return;

    this.events = [];
    this.tabSwitchCount = 0;
    this.pasteAttemptCount = 0;
    this.startTime = performance.now();
    this.isRecording = true;

    // Keystroke capture
    this.boundKeyDown = (e: KeyboardEvent) => {
      if (!this.isRecording) return;
      // Don't capture modifier-only keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
      this.events.push({
        key: e.key.length === 1 ? '*' : e.key, // Anonymize actual characters
        timestamp_ms: performance.now(),
        event_type: 'keydown',
      });
    };

    this.boundKeyUp = (e: KeyboardEvent) => {
      if (!this.isRecording) return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
      this.events.push({
        key: e.key.length === 1 ? '*' : e.key,
        timestamp_ms: performance.now(),
        event_type: 'keyup',
      });
    };

    // Paste blocking
    this.boundPaste = (e: ClipboardEvent) => {
      if (!this.isRecording) return;
      e.preventDefault();
      this.pasteAttemptCount++;
    };

    // Copy blocking (prevent copying questions to paste into LLM)
    this.boundCopy = (e: ClipboardEvent) => {
      if (!this.isRecording) return;
      e.preventDefault();
    };

    // Tab switch detection
    this.boundVisibility = () => {
      if (!this.isRecording) return;
      if (document.visibilityState === 'hidden') {
        this.tabSwitchCount++;
      }
    };

    // Context menu suppression
    this.boundContextMenu = (e: Event) => {
      if (!this.isRecording) return;
      e.preventDefault();
    };

    // Attach all listeners
    document.addEventListener('keydown', this.boundKeyDown, true);
    document.addEventListener('keyup', this.boundKeyUp, true);
    document.addEventListener('paste', this.boundPaste, true);
    document.addEventListener('copy', this.boundCopy, true);
    document.addEventListener('visibilitychange', this.boundVisibility);
    document.addEventListener('contextmenu', this.boundContextMenu);
  }

  /**
   * Stop recording and return the telemetry snapshot.
   * Removes all event listeners.
   */
  stop(): TelemetrySnapshot {
    this.isRecording = false;
    const endTime = performance.now();

    // Remove listeners
    if (this.boundKeyDown)
      document.removeEventListener('keydown', this.boundKeyDown, true);
    if (this.boundKeyUp)
      document.removeEventListener('keyup', this.boundKeyUp, true);
    if (this.boundPaste)
      document.removeEventListener('paste', this.boundPaste, true);
    if (this.boundCopy)
      document.removeEventListener('copy', this.boundCopy, true);
    if (this.boundVisibility)
      document.removeEventListener('visibilitychange', this.boundVisibility);
    if (this.boundContextMenu)
      document.removeEventListener('contextmenu', this.boundContextMenu);

    return {
      keystroke_events: this.events,
      tab_switch_count: this.tabSwitchCount,
      paste_attempt_count: this.pasteAttemptCount,
      start_time_ms: this.startTime,
      end_time_ms: endTime,
    };
  }

  /**
   * Get current metrics without stopping recording.
   * Useful for real-time UI feedback.
   */
  getCurrentMetrics(): TelemetryMetrics {
    return computeTelemetryMetrics({
      keystroke_events: this.events,
      tab_switch_count: this.tabSwitchCount,
      paste_attempt_count: this.pasteAttemptCount,
      start_time_ms: this.startTime,
      end_time_ms: performance.now(),
    });
  }

  /** Current tab switch count (for UI warning display). */
  getTabSwitchCount(): number {
    return this.tabSwitchCount;
  }

  /** Current paste attempt count (for UI warning display). */
  getPasteAttemptCount(): number {
    return this.pasteAttemptCount;
  }
}


/**
 * Compute telemetry metrics from a snapshot.
 * This runs client-side for real-time feedback and is also replicated
 * server-side for authoritative scoring.
 */
export function computeTelemetryMetrics(snapshot: TelemetrySnapshot): TelemetryMetrics {
  const keydowns = snapshot.keystroke_events
    .filter(e => e.event_type === 'keydown')
    .sort((a, b) => a.timestamp_ms - b.timestamp_ms);

  if (keydowns.length < 2) {
    return {
      mean_ikl_ms: 0,
      std_ikl_ms: 0,
      burstiness_index: 0.5,
      pause_frequency: 0.3,
      total_keystrokes: keydowns.length,
      total_time_ms: snapshot.end_time_ms - snapshot.start_time_ms,
      tab_switch_count: snapshot.tab_switch_count,
      paste_attempt_count: snapshot.paste_attempt_count,
    };
  }

  // Calculate inter-key latencies
  const ikls: number[] = [];
  let burstCount = 0;
  let pauseCount = 0;

  for (let i = 1; i < keydowns.length; i++) {
    const ikl = keydowns[i].timestamp_ms - keydowns[i - 1].timestamp_ms;
    if (ikl > 0 && ikl < 30000) { // Filter outliers
      ikls.push(ikl);
      if (ikl < 150) burstCount++;
      if (ikl > 2000) pauseCount++;
    }
  }

  if (ikls.length === 0) {
    return {
      mean_ikl_ms: 0,
      std_ikl_ms: 0,
      burstiness_index: 0.5,
      pause_frequency: 0.3,
      total_keystrokes: keydowns.length,
      total_time_ms: snapshot.end_time_ms - snapshot.start_time_ms,
      tab_switch_count: snapshot.tab_switch_count,
      paste_attempt_count: snapshot.paste_attempt_count,
    };
  }

  const mean = ikls.reduce((a, b) => a + b, 0) / ikls.length;
  const variance = ikls.reduce((sum, x) => sum + (x - mean) ** 2, 0) / ikls.length;
  const std = Math.sqrt(variance);

  return {
    mean_ikl_ms: Math.round(mean * 10) / 10,
    std_ikl_ms: Math.round(std * 10) / 10,
    burstiness_index: Math.round((burstCount / ikls.length) * 1000) / 1000,
    pause_frequency: Math.round((pauseCount / ikls.length) * 1000) / 1000,
    total_keystrokes: keydowns.length,
    total_time_ms: snapshot.end_time_ms - snapshot.start_time_ms,
    tab_switch_count: snapshot.tab_switch_count,
    paste_attempt_count: snapshot.paste_attempt_count,
  };
}

