import { spawn } from 'child_process';
import { CONFIG } from '../config.js';

export interface PythonResult {
  output: string;
  error?: string;
}

export function runPythonScript(scriptName: string, args: string[]): Promise<PythonResult> {
  return new Promise((resolve) => {
    const pythonPath = `${CONFIG.NOTEBOOKLM_SKILL_DIR}\\.venv\\Scripts\\python.exe`;
    const scriptPath = `${CONFIG.NOTEBOOKLM_SKILL_DIR}\\scripts\\${scriptName}`;

    const proc = spawn(pythonPath, [scriptPath, ...args], {
      cwd: CONFIG.NOTEBOOKLM_SKILL_DIR
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        // ask_question.py 출력에서 응답 부분만 추출
        const lines = stdout.split('\n');
        const separatorIndex = lines.findIndex(l => l.startsWith('====='));

        if (separatorIndex >= 0) {
          // "====" 라인 다음 2줄 건너뛰고 마지막 3줄 제외
          const answerLines = lines.slice(separatorIndex + 3, -3);
          resolve({ output: answerLines.join('\n').trim() });
        } else {
          resolve({ output: stdout.trim() });
        }
      } else {
        resolve({
          output: '',
          error: stderr || `Process exited with code ${code}`
        });
      }
    });

    proc.on('error', (err) => {
      resolve({ output: '', error: err.message });
    });
  });
}
