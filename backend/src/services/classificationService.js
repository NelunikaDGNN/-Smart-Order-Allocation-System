const { spawn } = require('child_process');
const path = require('path');
const env = require('../config/env');


function classifyMessage(message) {
  return new Promise((resolve) => {
    if (!message || !message.trim()) {
      resolve({ category: null, confidence: null, flagged: false });
      return;
    }

    const scriptPath = path.resolve(__dirname, '..', '..', 'ml', 'predict.py');
    const child = spawn(env.mlPythonBin, [scriptPath, message]);

    let output = '';
    let errorOutput = '';
    let settled = false;

    const settle = (result) => {
      if (settled) return; 
      settled = true;
      resolve(result);
    };

    
    child.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Classifier subprocess could not be started:', err.message);
      settle({
        category: null,
        confidence: null,
        flagged: false,
        error: 'classifier_unavailable',
      });
    });

    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { errorOutput += data.toString(); });

    child.on('close', (code) => {
      if (code !== 0) {
        // eslint-disable-next-line no-console
        console.error('Classifier subprocess failed:', errorOutput);
        settle({
          category: null,
          confidence: null,
          flagged: false,
          error: 'classification_unavailable',
        });
        return;
      }
      try {
        const result = JSON.parse(output.trim().split('\n').pop());
        settle({
          category: result.category,                               
          confidence: result.confidence,
          flagged: result.confidence < env.mlConfidenceThreshold, 
        });
      } catch (e) {
        settle({
          category: null,
          confidence: null,
          flagged: false,
          error: 'classification_parse_error',
        });
      }
    });
  });
}

module.exports = { classifyMessage };