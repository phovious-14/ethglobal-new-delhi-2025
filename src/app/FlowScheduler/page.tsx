/**
 * FlowScheduler Demo Component
 * Complete example of FlowScheduler integration with React
 */

"use client"
import React, { useState, useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { useSigner } from '@/src/hooks/use-signer';
import { useFlowScheduler, useFlowSchedulerEvents, useFlowRateUtils, useFlowScheduleState } from '../../hooks/use-flow-scheduler';
import { toUnixTimestamp, fromUnixTimestamp, calculateTotalAmountFromFlowRate } from '../../utils/web3-utils';
import { Framework } from '@superfluid-finance/sdk-core';
import { FLOW_SCHEDULER_DEPLOYMENT_BASE_SEPOLIA } from '@/src/utils/contract-info';
import { getTokenPairBySymbol } from '@/src/utils/tokenRegistry';

export default function FlowSchedulerDemo() {
  // Privy wallets and signer
  const { wallets } = useWallets();
  const { signer, address } = useSigner(wallets);
  const provider = signer?.provider as ethers.providers.Provider | undefined;
  const isConnected = !!signer && !!address;

  // Form state
  type FormData = {
    superToken: string;
    receiver: string;
    startDate: string;
    startMaxDelay: number;
    totalAmount: string;
    flowRateAmount: string;
    flowRateTimeUnit: number;
    startAmount: string;
    endDate: string;
    userData: string;
    calculationMethod: 'period' | 'rate'; // 'period' for total amount over time, 'rate' for amount per time unit
  };

  const [formData, setFormData] = useState<FormData>({
    superToken: '0x143ea239159155b408e71cdbe836e8cfd6766732',
    receiver: '0xCf2Da640E7F33A90f6E471620D9150E09b77311d',
    startDate: '',
    startMaxDelay: 3600, // 1 hour default
    totalAmount: '',
    flowRateAmount: '',
    flowRateTimeUnit: 86400, // 1 day default
    startAmount: '',
    endDate: '',
    userData: '',
    calculationMethod: 'period' // Default to period-based calculation
  });

  // Schedule viewing state
  interface ViewSchedule { superToken: string; sender: string; receiver: string }
  const [viewSchedule, setViewSchedule] = useState<ViewSchedule>({
    superToken: '0x143ea239159155b408e71cdbe836e8cfd6766732',
    sender: '0x36dCB6173777a17CE1E0910EC0D6F31a64b6b9c7',
    receiver: '0xCf2Da640E7F33A90f6E471620D9150E09b77311d'
  });

  // FlowScheduler hooks
  const {
    isLoading,
    error,
    isCorrectNet,
    switchNetwork,
    createFlowSchedule,
    deleteFlowSchedule,
    executeCreateFlow,
    executeDeleteFlow,
    getFlowSchedule,
    clearError
  } = useFlowScheduler();

  // Events hook
  const defaultProvider = useMemo(() => new ethers.providers.JsonRpcProvider('https://sepolia.base.org'), []);
  const eventsProvider = (provider ?? defaultProvider) as ethers.providers.Provider;

  const {
    events,
    isListening,
    startListening,
    stopListening,
    clearEvents
  } = useFlowSchedulerEvents(eventsProvider, {
    sender: address || ''
  });

  // Flow rate utilities
  const { calculateRate, calculateRateFromPeriod, formatRate, timeUnits } = useFlowRateUtils();

  // Schedule state for viewing
  const scheduleState = useFlowScheduleState(
    viewSchedule.superToken,
    viewSchedule.sender,
    viewSchedule.receiver
  );

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle view schedule input changes
  const handleViewScheduleChange = (field: keyof ViewSchedule, value: string) => {
    setViewSchedule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create flow schedule
  const handleCreateSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    try {
      let flowRate = '0';

      if (formData.calculationMethod === 'period') {
        // Calculate flow rate based on total amount and time period
        if (!formData.totalAmount || !formData.startDate || !formData.endDate) {
          throw new Error('For period-based calculation, please provide total amount, start date, and end date');
        }

        const startTimestamp = toUnixTimestamp(formData.startDate);
        const endTimestamp = toUnixTimestamp(formData.endDate);

        if (startTimestamp >= endTimestamp) {
          throw new Error('Start date must be before end date');
        }

        flowRate = calculateRateFromPeriod(formData.totalAmount, startTimestamp, endTimestamp);
      } else {
        // Calculate flow rate based on amount per time unit
        if (!formData.flowRateAmount) {
          throw new Error('Please provide flow rate amount');
        }
        flowRate = calculateRate(formData.flowRateAmount, formData.flowRateTimeUnit);
      }

      const params = {
        superToken: formData.superToken,
        receiver: formData.receiver,
        startDate: formData.startDate ? toUnixTimestamp(formData.startDate) : 0,
        startMaxDelay: formData.startMaxDelay,
        flowRate,
        startAmount: formData.startAmount ? ethers.utils.parseEther(formData.startAmount).toString() : '0',
        endDate: formData.endDate ? toUnixTimestamp(formData.endDate) : 0,
        userData: formData.userData ? ethers.utils.hexlify(ethers.utils.toUtf8Bytes(formData.userData)) : '0x'
      };

      const { tx, receipt } = await createFlowSchedule(params);
      alert(`Schedule created successfully! Transaction: ${tx.hash}`);

      // Reset form
      setFormData({
        superToken: '',
        receiver: '',
        startDate: '',
        startMaxDelay: 3600,
        totalAmount: '',
        flowRateAmount: '',
        flowRateTimeUnit: 86400,
        startAmount: '',
        endDate: '',
        userData: '',
        calculationMethod: 'period'
      });
    } catch (err) {
      const error = err as Error;
      console.error('Failed to create schedule:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Delete flow schedule
  const handleDeleteSchedule = async () => {
    if (!formData.superToken || !formData.receiver) {
      alert('Please provide SuperToken and receiver addresses');
      return;
    }

    try {
      const { tx, receipt } = await deleteFlowSchedule(formData.superToken, formData.receiver);
      alert(`Schedule deleted successfully! Transaction: ${tx.hash}`);
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    }
  };

  // Execute create flow
  const handleExecuteCreateFlow = async () => {
    if (!viewSchedule.superToken || !viewSchedule.sender || !viewSchedule.receiver) {
      alert('Please provide all addresses for execution');
      return;
    }

    console.log('viewSchedule', viewSchedule);

    try {
      const { tx, receipt } = await executeCreateFlow(
        viewSchedule.superToken,
        viewSchedule.sender,
        viewSchedule.receiver
      );
      alert(`Flow execution successful! Transaction: ${tx.hash}`);
    } catch (err) {
      const e = err as Error;
      console.error('Failed to execute create flow:', e);
    }
  };

  // Execute delete flow
  const handleExecuteDeleteFlow = async () => {
    if (!viewSchedule.superToken || !viewSchedule.sender || !viewSchedule.receiver) {
      alert('Please provide all addresses for execution');
      return;
    }

    try {
      const { tx, receipt } = await executeDeleteFlow(
        viewSchedule.superToken,
        viewSchedule.sender,
        viewSchedule.receiver
      );
      alert(`Flow deletion successful! Transaction: ${tx.hash}`);
    } catch (err) {
      const e = err as Error;
      console.error('Failed to execute delete flow:', e);
    }
  };

  // Fetch schedule details
  const handleGetSchedule = async () => {
    if (!viewSchedule.superToken || !viewSchedule.sender || !viewSchedule.receiver) {
      alert('Please provide all addresses');
      return;
    }

    try {
      scheduleState.setIsLoading(true);
      const schedule = await getFlowSchedule(
        viewSchedule.superToken,
        viewSchedule.sender,
        viewSchedule.receiver
      );
      scheduleState.setSchedule(schedule);
    } catch (err) {
      const e = err as Error;
      scheduleState.setError(e.message);
      console.error('Failed to get schedule:', e);
    } finally {
      scheduleState.setIsLoading(false);
    }
  };

  const authorizeUser = async () => {
    console.log(signer, address);
    if (!signer || !address) {
      alert('Please connect your wallet');
      return;
    }

    const sf = await Framework.create({
      chainId: 84532, // Base Sepolia
      provider: provider as ethers.providers.Provider,
    });

    const sfSigner = sf.createSigner({ signer: signer as ethers.Signer });

    const op = sf.cfaV1.authorizeFlowOperatorWithFullControl({
      superToken: "0x143ea239159155b408e71cdbe836e8cfd6766732",
      flowOperator: FLOW_SCHEDULER_DEPLOYMENT_BASE_SEPOLIA.addresses.flowScheduler,
      userData: "0x"
    });

    const tx = await op.exec(sfSigner);
    console.log('Authorization tx:', tx.hash);
    await tx.wait();
    console.log('Authorization confirmed');

  };

  if (!isConnected) {
    return (
      <div className="flow-scheduler-demo">
        <h1>FlowScheduler Demo</h1>
        <div className="connect-section">
          <p>Connect your wallet via Privy to interact with FlowScheduler.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flow-scheduler-demo">
      <h1>FlowScheduler Demo - Base Sepolia</h1>

      <button onClick={authorizeUser}>Authorize user</button>

      {/* Connection Status */}
      <div className="status-section">
        <p><strong>Connected Account:</strong> {address}</p>
        <p><strong>Network:</strong> {isCorrectNet ? '✅ Base Sepolia' : '❌ Wrong Network'}</p>
        {!isCorrectNet && (
          <button onClick={switchNetwork} disabled={isLoading} className="btn-warning">
            Switch to Base Sepolia
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-section">
          <p className="error">{error}</p>
          <button onClick={clearError} className="btn-secondary">Clear Error</button>
        </div>
      )}

      {/* Create Schedule Form */}
      <div className="form-section">
        <h2>Create Flow Schedule</h2>
        <form onSubmit={handleCreateSchedule} className="schedule-form">
          <div className="form-group">
            <label>SuperToken Address:</label>
            <input
              type="text"
              value={formData.superToken}
              onChange={(e) => handleInputChange('superToken', e.target.value)}
              placeholder="0x..."
              required
            />
          </div>

          <div className="form-group">
            <label>Receiver Address:</label>
            <input
              type="text"
              value={formData.receiver}
              onChange={(e) => handleInputChange('receiver', e.target.value)}
              placeholder="0x..."
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date (optional):</label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Start Max Delay (seconds):</label>
            <input
              type="number"
              value={formData.startMaxDelay}
              onChange={(e) => handleInputChange('startMaxDelay', parseInt(e.target.value))}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Calculation Method:</label>
            <select
              value={formData.calculationMethod}
              onChange={(e) => handleInputChange('calculationMethod', e.target.value as 'period' | 'rate')}
            >
              <option value="period">Total Amount Over Time Period</option>
              <option value="rate">Amount Per Time Unit</option>
            </select>
            <div className="method-description">
              <small>
                {formData.calculationMethod === 'period'
                  ? 'Enter the total amount to be streamed and the time period. Flow rate will be calculated automatically.'
                  : 'Enter the amount per time unit (e.g., 0.1 ETH per day).'
                }
              </small>
            </div>
          </div>

          {formData.calculationMethod === 'period' ? (
            <div className="form-group">
              <label>Total Amount:</label>
              <input
                type="number"
                step="0.000001"
                value={formData.totalAmount}
                onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                placeholder="1.0"
              />
              {formData.totalAmount && formData.startDate && formData.endDate && (
                <div className="calculated-info">
                  <small>
                    Calculated Flow Rate: {(() => {
                      try {
                        const startTimestamp = toUnixTimestamp(formData.startDate);
                        const endTimestamp = toUnixTimestamp(formData.endDate);
                        const flowRate = calculateRateFromPeriod(formData.totalAmount, startTimestamp, endTimestamp);
                        const formattedRate = formatRate(flowRate, timeUnits.DAY);
                        return `${formattedRate} per day`;
                      } catch (error) {
                        return 'Invalid dates';
                      }
                    })()}
                  </small>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Flow Rate Amount:</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.flowRateAmount}
                  onChange={(e) => handleInputChange('flowRateAmount', e.target.value)}
                  placeholder="0.1"
                />
              </div>

              <div className="form-group">
                <label>Flow Rate Time Unit:</label>
                <select
                  value={formData.flowRateTimeUnit}
                  onChange={(e) => handleInputChange('flowRateTimeUnit', parseInt(e.target.value))}
                >
                  <option value={timeUnits.HOUR}>Per Hour</option>
                  <option value={timeUnits.DAY}>Per Day</option>
                  <option value={timeUnits.WEEK}>Per Week</option>
                  <option value={timeUnits.MONTH}>Per Month</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Start Amount (ETH, optional):</label>
            <input
              type="number"
              step="0.000001"
              value={formData.startAmount}
              onChange={(e) => handleInputChange('startAmount', e.target.value)}
              placeholder="0.1"
            />
          </div>

          <div className="form-group">
            <label>End Date (optional):</label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>User Data (optional):</label>
            <input
              type="text"
              value={formData.userData}
              onChange={(e) => handleInputChange('userData', e.target.value)}
              placeholder="Custom data"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading || !isCorrectNet}
              className="btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create Schedule'}
            </button>
            <button
              type="button"
              onClick={handleDeleteSchedule}
              disabled={isLoading || !isCorrectNet}
              className="btn-danger"
            >
              Delete Schedule
            </button>
          </div>
        </form>
      </div>

      {/* View Schedule Section */}
      <div className="view-section">
        <h2>View & Execute Schedule</h2>
        <div className="view-form">
          <div className="form-group">
            <label>SuperToken Address:</label>
            <input
              type="text"
              value={viewSchedule.superToken}
              onChange={(e) => handleViewScheduleChange('superToken', e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="form-group">
            <label>Sender Address:</label>
            <input
              type="text"
              value={viewSchedule.sender}
              onChange={(e) => handleViewScheduleChange('sender', e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="form-group">
            <label>Receiver Address:</label>
            <input
              type="text"
              value={viewSchedule.receiver}
              onChange={(e) => handleViewScheduleChange('receiver', e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="form-actions">
            <button
              onClick={handleGetSchedule}
              disabled={scheduleState.isLoading || !isCorrectNet}
              className="btn-secondary"
            >
              {scheduleState.isLoading ? 'Loading...' : 'Get Schedule'}
            </button>
            <button
              onClick={handleExecuteCreateFlow}
              disabled={isLoading || !isCorrectNet}
              className="btn-success"
            >
              Execute Create Flow
            </button>
            <button
              onClick={handleExecuteDeleteFlow}
              disabled={isLoading || !isCorrectNet}
              className="btn-warning"
            >
              Execute Delete Flow
            </button>
          </div>
        </div>

        {/* Schedule Details */}
        {scheduleState.schedule && (
          <div className="schedule-details">
            <h3>Schedule Details</h3>
            <div className="details-grid">
              <div><strong>Exists:</strong> {scheduleState.exists ? 'Yes' : 'No'}</div>
              <div><strong>Start Date:</strong> {scheduleState.schedule.startDate > 0 ? fromUnixTimestamp(scheduleState.schedule.startDate).toLocaleString() : 'Not set'}</div>
              <div><strong>Start Max Delay:</strong> {scheduleState.schedule.startMaxDelay} seconds</div>
              <div><strong>End Date:</strong> {scheduleState.schedule.endDate > 0 ? fromUnixTimestamp(scheduleState.schedule.endDate).toLocaleString() : 'Not set'}</div>
              <div><strong>Flow Rate:</strong> {scheduleState.schedule.flowRate !== '0' ? formatRate(scheduleState.schedule.flowRate) + ' per day' : 'Not set'}</div>
              {scheduleState.schedule.flowRate !== '0' && scheduleState.schedule.startDate > 0 && scheduleState.schedule.endDate > 0 && (
                <div><strong>Total Amount:</strong> {(() => {
                  try {
                    const totalAmount = calculateTotalAmountFromFlowRate(
                      scheduleState.schedule.flowRate,
                      scheduleState.schedule.startDate,
                      scheduleState.schedule.endDate
                    );
                    return totalAmount + ' ETH';
                  } catch (error) {
                    return 'Calculation error';
                  }
                })()}</div>
              )}
              <div><strong>Start Amount:</strong> {scheduleState.schedule.startAmount !== '0' ? ethers.utils.formatEther(scheduleState.schedule.startAmount) + ' ETH' : 'Not set'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Events Section */}
      <div className="events-section">
        <h2>Contract Events</h2>
        <div className="events-controls">
          <button
            onClick={isListening ? stopListening : startListening}
            className={isListening ? "btn-warning" : "btn-primary"}
          >
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
          <button onClick={clearEvents} className="btn-secondary">
            Clear Events
          </button>
        </div>

        <div className="events-list">
          {events.length === 0 ? (
            <p>No events yet. {isListening ? 'Listening for new events...' : 'Start listening to see events.'}</p>
          ) : (
            events.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-header">
                  <strong>{event.type}</strong>
                  <span className="event-time">{new Date(event.timestamp).toLocaleString()}</span>
                </div>
                <div className="event-details">
                  <div>SuperToken: {event.superToken}</div>
                  <div>Sender: {event.sender}</div>
                  <div>Receiver: {event.receiver}</div>
                  {'flowRate' in event && event.flowRate && (
                    <div>Flow Rate: {formatRate(event.flowRate)} per day</div>
                  )}
                  {'startAmount' in event && event.startAmount && event.startAmount !== '0' && (
                    <div>Start Amount: {ethers.utils.formatEther(event.startAmount)} ETH</div>
                  )}
                  <div>Block: {event.blockNumber}</div>
                  <div>Tx: {event.transactionHash}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .flow-scheduler-demo {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .status-section, .error-section, .form-section, .view-section, .events-section {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .error {
          color: #d32f2f;
          background: #ffebee;
          padding: 10px;
          border-radius: 4px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }

        .calculated-info {
          margin-top: 5px;
          padding: 5px;
          background: #e3f2fd;
          border-radius: 4px;
          border-left: 3px solid #2196f3;
        }

        .calculated-info small {
          color: #1976d2;
          font-weight: 500;
        }

        .method-description {
          margin-top: 5px;
          padding: 5px;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .method-description small {
          color: #666;
          font-style: italic;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn-primary {
          background: #1976d2;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-secondary {
          background: #757575;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-success {
          background: #388e3c;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-warning {
          background: #f57c00;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-danger {
          background: #d32f2f;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .schedule-details {
          margin-top: 20px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }

        .events-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .event-item {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 10px;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .event-time {
          font-size: 12px;
          color: #666;
        }

        .event-details {
          font-size: 12px;
          color: #555;
        }

        .event-details div {
          margin-bottom: 2px;
        }

        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

