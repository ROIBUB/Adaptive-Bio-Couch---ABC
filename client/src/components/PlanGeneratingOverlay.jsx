import React, { useState, useEffect, useRef } from 'react';
import './PlanGeneratingOverlay.css';

const STAGES = [
  { message: 'Analyzing your fitness profile…',       note: 'Reviewing your goals and body metrics' },
  { message: 'Calculating optimal calorie targets…',  note: 'Based on your measurements and goal' },
  { message: 'Designing your workout plan…',          note: 'Selecting exercises matched to your level' },
  { message: 'Scheduling your training week…',        note: 'Balancing workload and recovery days' },
  { message: 'Creating your personalized meal plan…', note: 'Calibrating meals to your caloric target' },
  { message: 'Finalizing your FitWise experience…',   note: 'Almost there — just a few more seconds' },
];

const STAGE_INTERVAL  = 2000; // ms between automatic stage advances
const NAVIGATE_DELAY  = 1200; // ms to show success state before navigating

function PlanGeneratingOverlay({ visible, status, firstName, onNavigate }) {
  const [stageIndex,   setStageIndex]   = useState(0);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const overlayRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // Reset and focus each time the overlay becomes visible
  useEffect(() => {
    if (visible) {
      setStageIndex(0);
      setShowSuccess(false);
      // Defer one tick so the element is in the DOM
      const t = setTimeout(() => overlayRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [visible]);

  // Advance stages while the request is in flight
  useEffect(() => {
    if (!visible || status !== 'generating') return;
    const interval = setInterval(() => {
      setStageIndex(prev => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, STAGE_INTERVAL);
    return () => clearInterval(interval);
  }, [visible, status]);

  // Transition to success as soon as the request completes
  useEffect(() => {
    if (status !== 'done') return;
    setShowSuccess(true);
    const t = setTimeout(() => {
      if (mountedRef.current) onNavigate();
    }, NAVIGATE_DELAY);
    return () => clearTimeout(t);
  }, [status, onNavigate]);

  // Warn the user before they accidentally close or refresh the tab
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [visible]);

  if (!visible) return null;

  const progressPct = showSuccess
    ? 100
    : Math.round(((stageIndex + 1) / STAGES.length) * 100);

  const stage = STAGES[stageIndex];

  return (
    <div
      className="pgo-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pgo-title"
      aria-describedby="pgo-status"
      tabIndex={-1}
      ref={overlayRef}
    >
      <div className="pgo-card">

        {/* FitWise brand */}
        <div className="pgo-brand" aria-hidden="true">
          <span className="pgo-brand-icon">🏋️</span>
          <span className="pgo-brand-name">FitWise</span>
        </div>

        {/* Pulsing orb / success checkmark */}
        <div className={`pgo-orb${showSuccess ? ' pgo-orb--success' : ''}`} aria-hidden="true">
          <div className="pgo-ring pgo-ring--1" />
          <div className="pgo-ring pgo-ring--2" />
          <div className="pgo-ring pgo-ring--3" />
          <div className="pgo-icon">
            {showSuccess ? '✓' : '🏋️'}
          </div>
        </div>

        {/* Headline */}
        <h2 id="pgo-title" className="pgo-headline">
          {showSuccess ? 'Your plan is ready!' : 'Building Your Fitness Journey'}
        </h2>

        {/* Personalisation / success sub-line */}
        <p className="pgo-subtitle">
          {showSuccess
            ? 'Taking you to your dashboard…'
            : firstName
              ? `Personalizing for ${firstName}`
              : 'Personalizing your experience…'}
        </p>

        {/* Stage message — only during generation */}
        {!showSuccess && (
          <div className="pgo-status-wrap">
            <p
              id="pgo-status"
              className="pgo-status-msg"
              key={stageIndex}
              aria-live="polite"
              aria-atomic="true"
            >
              {stage.message}
            </p>
            <p className="pgo-status-note">{stage.note}</p>
          </div>
        )}

        {/* Progress bar */}
        <div
          className="pgo-bar-track"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Plan generation progress"
        >
          <div
            className={`pgo-bar-fill${showSuccess ? ' pgo-bar-fill--success' : ''}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Stage counter */}
        {!showSuccess && (
          <p className="pgo-counter" aria-hidden="true">
            Stage {stageIndex + 1} of {STAGES.length}
          </p>
        )}

        {/* Unload warning */}
        {!showSuccess && (
          <p className="pgo-warning">
            Please keep this tab open — your plan is being generated
          </p>
        )}

      </div>
    </div>
  );
}

export default PlanGeneratingOverlay;
