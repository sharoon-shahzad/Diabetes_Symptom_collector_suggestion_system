import { spawn } from 'child_process';
import path from 'path';

// Runs the Python risk assessment script with provided feature payload
export function assessDiabetesRiskPython(features) {
  return new Promise((resolve, reject) => {
    const projectRoot = path.resolve(process.cwd(), '..');
    const scriptPath = path.resolve(process.cwd(), 'services', 'ml', 'diabetes_assess.py');

    const pythonCmd = process.env.PYTHON_BIN || 'python';

    const child = spawn(pythonCmd, [scriptPath], {
      cwd: path.resolve(process.cwd()),
      env: {
        ...process.env,
        PROJECT_ROOT: projectRoot,
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => reject(err));

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python exited with code ${code}: ${stderr}`));
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${e.message}. Raw: ${stdout}`));
      }
    });

    // Write JSON payload to stdin
    child.stdin.write(JSON.stringify({ features }));
    child.stdin.end();
  });
}


