import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';

const SettingsView = ({ 
  appData, 
  updateSettings, 
  setView, 
  exportToCSV, 
  resetConfirmation, 
  setResetConfirmation, 
  executeReset 
}) => {
  return (
    <div className="app-container">
      <div className="app-header">
        <button onClick={() => setView('home')} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h1 className="app-title">SETTINGS</h1>
        <div className="spacer"></div>
      </div>

      <div className="app-content">
        <div className="settings-section">
          <h2 className="settings-section-title">PREFERENCES</h2>
          
          <div className="settings-cards">
            <div className="settings-card">
              <div className="settings-card-content">
                <div className="settings-info">
                  <div className="settings-title">Reps Tracking</div>
                  <div className="settings-description">Track individual reps per set</div>
                </div>
                <input
  type="checkbox"
  checked={appData.settings.repsTracking}
  onChange={(e) => updateSettings('repsTracking', e.target.checked)}
  className="settings-checkbox"
/>
              </div>
            </div>

            <div className="settings-card">
              <div className="settings-card-content">
                <div className="settings-info">
                  <div className="settings-title">Weight Tracking</div>
                  <div className="settings-description">Track weights per set</div>
                </div>
                <input
  type="checkbox"
  checked={appData.settings.weightTracking}
  onChange={(e) => updateSettings('weightTracking', e.target.checked)}
  className="settings-checkbox"
/>
              </div>
            </div>

            {appData.settings.weightTracking && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-title">Weight Increment</div>
                  <div className="settings-description">Weight adjustment per tap (lbs)</div>
                </div>
                <div className="increment-buttons">
                  {[1, 2.5, 5].map(increment => (
                    <button
                      key={increment}
                      onClick={() => updateSettings('weightIncrement', increment)}
                      className={`increment-button ${
                        appData.settings.weightIncrement === increment ? 'active' : ''
                      }`}
                    >
                      {increment === 2.5 ? '2.5' : increment}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">MANAGEMENT</h2>
          
          <div className="settings-cards">
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-title">Manage Exercises</div>
                <div className="settings-description">Add, remove, and reorder exercises</div>
              </div>
              <button
                onClick={() => setView('exercise-management')}
                className="settings-action-button"
              >
                MANAGE EXERCISES
              </button>
            </div>

            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-title">Export Data</div>
                <div className="settings-description">Download workout history as CSV</div>
              </div>
              <button
                onClick={exportToCSV}
                className="settings-action-button export-button"
              >
                <Download size={20} />
                DOWNLOAD CSV
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">RESET OPTIONS</h2>
          
          <div className="settings-cards">
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-title">Factory Reset</div>
                <div className="settings-description">Clear all data and restore to default state</div>
              </div>
              <button
                onClick={() => setResetConfirmation({ step: 1 })}
                className="settings-action-button reset-button"
              >
                FACTORY RESET
              </button>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <div className="app-info">
            <div className="app-name">Strength Tracker MVP4</div>
            <div className="app-stats">{appData.workouts.length} workouts logged</div>
            <div className="app-storage">Data stored locally</div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmation && (
        <div className="modal-overlay" onClick={() => setResetConfirmation(null)}>
          <div className="modal-content reset-modal" onClick={(e) => e.stopPropagation()}>
            {resetConfirmation.step === 1 && (
              <>
                <h3 className="modal-title">Factory Reset Warning</h3>
                
                <div className="reset-warning">
                  <div className="reset-warning-title">This will delete ALL your data!</div>

                  <div className="reset-warning-details">
                    <div className="reset-warning-header">⚠️ This action will permanently delete:</div>
                    <div className="reset-warning-list">
                      <div>• All workout history</div>
                      <div>• All custom exercises</div>
                      <div>• All settings</div>
                      <div className="reset-warning-footer">This cannot be undone!</div>
                    </div>
                  </div>

                  <div className="reset-modal-actions">
                    <button
                      onClick={() => setResetConfirmation({ step: 2 })}
                      className="reset-continue-button"
                    >
                      CONTINUE TO FINAL WARNING
                    </button>
                    <button
                      onClick={() => setResetConfirmation(null)}
                      className="reset-cancel-button"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {resetConfirmation.step === 2 && (
              <>
                <h3 className="modal-title">Final Confirmation</h3>
                
                <div className="final-warning">
                  <div className="final-warning-title">Are you absolutely sure?</div>

                  <div className="final-warning-icon">
                    <div className="warning-emoji">🚨</div>
                    <div className="warning-text">LAST CHANCE</div>
                    <div className="warning-subtext">This will reset everything to factory defaults</div>
                  </div>

                  <div className="final-modal-actions">
                    <button
                      onClick={() => executeReset('factory')}
                      className="final-reset-button"
                    >
                      YES, FACTORY RESET NOW
                    </button>
                    <button
                      onClick={() => setResetConfirmation(null)}
                      className="final-cancel-button"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;